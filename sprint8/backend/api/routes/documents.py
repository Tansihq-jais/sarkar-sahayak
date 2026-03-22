"""
FastAPI router for document processing endpoints.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
import logging

from tasks.process_document import process_document
from config import get_settings, Settings
from services.embedder import embed_single
from services.vectorstore import query_similar

logger = logging.getLogger(__name__)
router = APIRouter()


class ProcessRequest(BaseModel):
    document_id: str
    s3_key: str | None = None
    file_path: str | None = None   # for local dev without S3
    mime_type: str = "application/pdf"
    document_name: str = "document"


class ProcessResponse(BaseModel):
    task_id: str
    document_id: str
    status: str


@router.post("/process", response_model=ProcessResponse)
async def trigger_processing(request: ProcessRequest):
    """
    Trigger the document processing pipeline via Celery.
    Returns immediately with a task_id — processing happens in background.
    """
    file_path = request.file_path or request.s3_key
    if not file_path:
        raise HTTPException(status_code=400, detail="Either file_path or s3_key is required")

    task = process_document.delay(
        document_id=request.document_id,
        file_path=file_path,
        mime_type=request.mime_type,
        document_name=request.document_name,
    )

    logger.info(f"Triggered processing task {task.id} for document {request.document_id}")

    return ProcessResponse(
        task_id=task.id,
        document_id=request.document_id,
        status="queued",
    )


@router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """Check status of a processing task."""
    from celery_app import celery_app
    result = celery_app.AsyncResult(task_id)

    return {
        "task_id": task_id,
        "status": result.status,
        "result": result.result if result.ready() else None,
    }


class QueryRequest(BaseModel):
    query: str
    document_ids: list[str]
    top_k: int = 5

class ChunkResponse(BaseModel):
    chunk_index: int
    text: str

class QueryResponse(BaseModel):
    chunks: list[ChunkResponse]

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest, settings: Settings = Depends(get_settings)):
    try:
        query_embedding = embed_single(request.query, model_name=settings.embedding_model)
        
        matches = query_similar(
            query_embedding=query_embedding,
            document_ids=request.document_ids,
            api_key=settings.pinecone_api_key,
            index_name=settings.pinecone_index_name,
            top_k=request.top_k,
        )
        
        chunks = [
            ChunkResponse(chunk_index=match.chunk_index, text=match.text)
            for match in matches
        ]
        return QueryResponse(chunks=chunks)
    except Exception as e:
        logger.error(f"Failed to query documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))
