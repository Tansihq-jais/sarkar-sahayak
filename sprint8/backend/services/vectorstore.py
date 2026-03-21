"""
Pinecone vector store — upsert and query document chunks.
Free tier: 1 index, 100K vectors, 1GB storage.
Create free account at: https://pinecone.io
"""

import logging
from dataclasses import dataclass
from functools import lru_cache

logger = logging.getLogger(__name__)

PINECONE_METRIC = "cosine"
TOP_K_DEFAULT = 15


@dataclass
class VectorMatch:
    chunk_index: int
    document_id: str
    text: str
    score: float
    metadata: dict


@lru_cache(maxsize=1)
def _get_index(api_key: str, index_name: str):
    """Get or create Pinecone index (cached singleton)."""
    try:
        from pinecone import Pinecone, ServerlessSpec

        pc = Pinecone(api_key=api_key)

        # Create index if it doesn't exist
        existing = [idx.name for idx in pc.list_indexes()]
        if index_name not in existing:
            logger.info(f"Creating Pinecone index: {index_name}")
            pc.create_index(
                name=index_name,
                dimension=384,          # all-MiniLM-L6-v2 dimension
                metric=PINECONE_METRIC,
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),  # free tier
            )
            logger.info(f"Index {index_name} created")

        return pc.Index(index_name)

    except ImportError:
        raise ImportError("pinecone-client not installed. Run: pip install pinecone-client")


def upsert_chunks(
    document_id: str,
    chunks: list,           # list of TextChunk
    embeddings: list[list[float]],
    api_key: str,
    index_name: str,
) -> int:
    """
    Upsert document chunks with their embeddings into Pinecone.
    Uses namespace=doc_{document_id} for easy filtering.
    Returns number of vectors upserted.
    """
    if not chunks or not embeddings:
        return 0
    if len(chunks) != len(embeddings):
        raise ValueError(f"chunks ({len(chunks)}) and embeddings ({len(embeddings)}) must match")

    index = _get_index(api_key, index_name)
    namespace = f"doc_{document_id}"

    vectors = []
    for chunk, embedding in zip(chunks, embeddings):
        vector_id = f"{document_id}_chunk_{chunk.index}"
        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": {
                "document_id": document_id,
                "chunk_index": chunk.index,
                "text": chunk.text[:500],      # Pinecone metadata limit
                "char_start": chunk.char_start,
                "char_end": chunk.char_end,
            },
        })

    # Upsert in batches of 100 (Pinecone limit)
    batch_size = 100
    total_upserted = 0
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch, namespace=namespace)
        total_upserted += len(batch)
        logger.info(f"Upserted batch {i//batch_size + 1}: {len(batch)} vectors")

    logger.info(f"Total upserted for {document_id}: {total_upserted} vectors")
    return total_upserted


def query_similar(
    query_embedding: list[float],
    document_ids: list[str],
    api_key: str,
    index_name: str,
    top_k: int = TOP_K_DEFAULT,
) -> list[VectorMatch]:
    """
    Query Pinecone for the most similar chunks across given document IDs.
    Queries each document namespace and merges results.
    """
    if not document_ids:
        return []

    index = _get_index(api_key, index_name)
    all_matches: list[VectorMatch] = []

    for doc_id in document_ids:
        namespace = f"doc_{doc_id}"
        try:
            result = index.query(
                vector=query_embedding,
                top_k=top_k,
                namespace=namespace,
                include_metadata=True,
            )
            for match in result.matches:
                meta = match.metadata or {}
                all_matches.append(VectorMatch(
                    chunk_index=meta.get("chunk_index", 0),
                    document_id=meta.get("document_id", doc_id),
                    text=meta.get("text", ""),
                    score=match.score,
                    metadata=meta,
                ))
        except Exception as e:
            logger.error(f"Pinecone query failed for {doc_id}: {e}")

    # Sort by score descending and return top_k overall
    all_matches.sort(key=lambda m: m.score, reverse=True)
    return all_matches[:top_k]


def delete_document(document_id: str, api_key: str, index_name: str) -> None:
    """Delete all vectors for a document from Pinecone."""
    index = _get_index(api_key, index_name)
    namespace = f"doc_{document_id}"
    try:
        index.delete(delete_all=True, namespace=namespace)
        logger.info(f"Deleted all vectors for document {document_id}")
    except Exception as e:
        logger.error(f"Failed to delete vectors for {document_id}: {e}")
