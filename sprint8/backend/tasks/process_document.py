"""
Task #74 — Full document processing pipeline.
Flow: file_path → extract → OCR if needed → chunk → embed → Pinecone → DB update
"""

import logging
import tempfile
from pathlib import Path

from celery_app import celery_app
from config import get_settings
from services.extractor import extract_text_from_pdf, extract_text_from_docx
from services.ocr import run_ocr
from services.chunker import chunk_text
from services.embedder import embed_texts
from services.vectorstore import upsert_chunks

logger = logging.getLogger(__name__)
settings = get_settings()


def _update_document_status(document_id: str, status: str, error: str | None = None, chunk_count: int = 0):
    """Update document status in Supabase."""
    try:
        from supabase import create_client
        client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        update_data = {"status": status}
        if error:
            update_data["error_message"] = error
        if chunk_count:
            update_data["chunk_count"] = chunk_count
        client.table("documents").update(update_data).eq("id", document_id).execute()
    except Exception as e:
        logger.error(f"Failed to update document status in DB: {e}")


@celery_app.task(
    name="tasks.process_document.process",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def process_document(
    self,
    document_id: str,
    file_path: str,
    mime_type: str,
    document_name: str,
):
    """
    Main document processing pipeline task.
    Called after a file is uploaded to S3 or saved locally.

    Args:
        document_id: UUID of the document in Supabase
        file_path: Local path or S3 key of the file
        mime_type: MIME type of the file
        document_name: Display name
    """
    logger.info(f"Processing document {document_id}: {document_name}")
    _update_document_status(document_id, "parsing")

    try:
        # ── Step 1: Extract text ─────────────────────────────
        path = Path(file_path)

        if mime_type == "application/pdf" or path.suffix.lower() == ".pdf":
            result = extract_text_from_pdf(file_path)
        elif mime_type in (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ) or path.suffix.lower() == ".docx":
            result = extract_text_from_docx(file_path)
        else:
            # Plain text
            text = path.read_text(encoding="utf-8", errors="ignore")
            from services.extractor import ExtractionResult, PageContent
            result = ExtractionResult(
                pages=[PageContent(page_num=1, text=text, char_count=len(text))],
                full_text=text,
                total_chars=len(text),
                needs_ocr=False,
            )

        if result.error and not result.full_text:
            logger.error(f"Extraction failed: {result.error}")
            _update_document_status(document_id, "failed", error=result.error)
            return {"status": "failed", "error": result.error}

        # ── Step 2: OCR fallback if text is too short ────────
        full_text = result.full_text
        if result.needs_ocr and path.suffix.lower() == ".pdf":
            logger.info(f"Triggering OCR for {document_name} (only {result.total_chars} chars extracted)")
            ocr_result = run_ocr(file_path, lang=settings.tesseract_lang)
            if ocr_result.full_text:
                full_text = ocr_result.full_text
                logger.info(f"OCR extracted {ocr_result.total_chars} chars")
            else:
                logger.warning(f"OCR also failed: {ocr_result.error}")

        if not full_text.strip():
            _update_document_status(document_id, "failed", error="No text could be extracted")
            return {"status": "failed", "error": "No text extracted"}

        # ── Step 3: Chunk text ───────────────────────────────
        chunks = chunk_text(full_text, document_id=document_id)
        if not chunks:
            _update_document_status(document_id, "failed", error="Chunking produced no results")
            return {"status": "failed", "error": "No chunks produced"}

        logger.info(f"Created {len(chunks)} chunks")

        # ── Step 4: Generate embeddings ──────────────────────
        texts = [c.text for c in chunks]
        embeddings = embed_texts(texts, model_name=settings.embedding_model)

        if len(embeddings) != len(chunks):
            raise ValueError("Embedding count mismatch")

        # ── Step 5: Upsert to Pinecone ───────────────────────
        if settings.pinecone_api_key:
            upserted = upsert_chunks(
                document_id=document_id,
                chunks=chunks,
                embeddings=embeddings,
                api_key=settings.pinecone_api_key,
                index_name=settings.pinecone_index_name,
            )
            logger.info(f"Upserted {upserted} vectors to Pinecone")
        else:
            logger.warning("PINECONE_API_KEY not set — skipping vector upsert")

        # ── Step 6: Update DB status ─────────────────────────
        _update_document_status(document_id, "indexed", chunk_count=len(chunks))

        return {
            "status": "indexed",
            "document_id": document_id,
            "chunk_count": len(chunks),
            "char_count": len(full_text),
        }

    except Exception as exc:
        logger.error(f"Pipeline failed for {document_id}: {exc}", exc_info=True)
        _update_document_status(document_id, "failed", error=str(exc))

        # Retry on transient errors
        raise self.retry(exc=exc)
