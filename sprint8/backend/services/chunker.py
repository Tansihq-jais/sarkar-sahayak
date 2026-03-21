"""
Text chunking pipeline using LangChain's RecursiveTextSplitter.
Splits documents into overlapping chunks for embedding and retrieval.
"""

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

CHUNK_SIZE = 1000       # tokens (approx chars for most models)
CHUNK_OVERLAP = 150     # overlap between chunks


@dataclass
class TextChunk:
    index: int
    text: str
    char_start: int
    char_end: int
    page_num: int | None = None
    metadata: dict | None = None


def chunk_text(
    text: str,
    document_id: str,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[TextChunk]:
    """
    Split text into overlapping chunks using LangChain's
    RecursiveCharacterTextSplitter. Respects sentence and
    paragraph boundaries where possible.
    """
    if not text or not text.strip():
        return []

    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", "। ", ". ", " ", ""],  # Hindi + English
        )

        raw_chunks = splitter.split_text(text)
        chunks: list[TextChunk] = []
        char_pos = 0

        for i, chunk_text_content in enumerate(raw_chunks):
            # Find the actual position in the original text
            start = text.find(chunk_text_content, max(0, char_pos - chunk_overlap))
            if start == -1:
                start = char_pos
            end = start + len(chunk_text_content)
            char_pos = end

            chunks.append(TextChunk(
                index=i,
                text=chunk_text_content.strip(),
                char_start=start,
                char_end=end,
                metadata={"document_id": document_id, "chunk_index": i},
            ))

        logger.info(f"Chunked document {document_id}: {len(chunks)} chunks from {len(text)} chars")
        return chunks

    except ImportError:
        logger.warning("langchain_text_splitters not installed, using simple chunker")
        return _simple_chunk(text, document_id, chunk_size, chunk_overlap)


def _simple_chunk(
    text: str,
    document_id: str,
    chunk_size: int,
    chunk_overlap: int,
) -> list[TextChunk]:
    """Fallback chunker — no LangChain dependency."""
    chunks = []
    start = 0
    index = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        # Try to end at sentence boundary
        if end < len(text):
            for sep in [". ", ".\n", "\n\n", "\n", " "]:
                boundary = text.rfind(sep, start, end)
                if boundary > start + chunk_size // 2:
                    end = boundary + len(sep)
                    break

        chunk_content = text[start:end].strip()
        if chunk_content:
            chunks.append(TextChunk(
                index=index,
                text=chunk_content,
                char_start=start,
                char_end=end,
                metadata={"document_id": document_id, "chunk_index": index},
            ))
            index += 1

        start = max(start + 1, end - chunk_overlap)

    return chunks
