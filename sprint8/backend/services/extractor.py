"""
Document text extraction using PyMuPDF.
Fast, accurate extraction for text-based PDFs.
Falls back to OCR for scanned documents.
"""

import fitz  # PyMuPDF
import logging
from pathlib import Path
from dataclasses import dataclass

logger = logging.getLogger(__name__)

MIN_TEXT_LENGTH = 100  # If less than this, trigger OCR


@dataclass
class PageContent:
    page_num: int
    text: str
    char_count: int


@dataclass
class ExtractionResult:
    pages: list[PageContent]
    full_text: str
    total_chars: int
    needs_ocr: bool
    error: str | None = None


def extract_text_from_pdf(file_path: str | Path) -> ExtractionResult:
    """
    Extract text from a PDF file using PyMuPDF.
    Returns page-by-page content and full concatenated text.
    """
    path = Path(file_path)
    if not path.exists():
        return ExtractionResult(
            pages=[], full_text="", total_chars=0,
            needs_ocr=False, error=f"File not found: {file_path}"
        )

    pages: list[PageContent] = []

    try:
        doc = fitz.open(str(path))

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text", sort=True)  # sort=True preserves reading order
            text = text.strip()
            pages.append(PageContent(
                page_num=page_num + 1,
                text=text,
                char_count=len(text),
            ))

        doc.close()

        full_text = "\n\n".join(p.text for p in pages if p.text)
        total_chars = len(full_text)
        needs_ocr = total_chars < MIN_TEXT_LENGTH

        logger.info(
            f"Extracted {total_chars} chars from {path.name} "
            f"({len(pages)} pages, needs_ocr={needs_ocr})"
        )

        return ExtractionResult(
            pages=pages,
            full_text=full_text,
            total_chars=total_chars,
            needs_ocr=needs_ocr,
        )

    except Exception as e:
        logger.error(f"PyMuPDF extraction failed for {path.name}: {e}")
        return ExtractionResult(
            pages=[], full_text="", total_chars=0,
            needs_ocr=True, error=str(e)
        )


def extract_text_from_docx(file_path: str | Path) -> ExtractionResult:
    """Extract text from a DOCX file using python-docx."""
    from docx import Document as DocxDocument

    path = Path(file_path)
    try:
        doc = DocxDocument(str(path))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        total_chars = len(full_text)

        # Treat as a single "page"
        pages = [PageContent(page_num=1, text=full_text, char_count=total_chars)]

        return ExtractionResult(
            pages=pages,
            full_text=full_text,
            total_chars=total_chars,
            needs_ocr=False,
        )
    except Exception as e:
        logger.error(f"DOCX extraction failed for {path.name}: {e}")
        return ExtractionResult(
            pages=[], full_text="", total_chars=0,
            needs_ocr=False, error=str(e)
        )
