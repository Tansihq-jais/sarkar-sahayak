"""
Embedding service using sentence-transformers.
Runs locally — completely free, no API key needed.
Model: all-MiniLM-L6-v2 (384 dimensions, fast, good quality)

First run downloads the model (~90MB) from HuggingFace automatically.
"""

import logging
from functools import lru_cache
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "all-MiniLM-L6-v2"
BATCH_SIZE = 64


@lru_cache(maxsize=1)
def _get_model(model_name: str = DEFAULT_MODEL):
    """Load and cache the embedding model (singleton)."""
    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading embedding model: {model_name}")
        model = SentenceTransformer(model_name)
        logger.info(f"Model loaded. Embedding dimension: {model.get_sentence_embedding_dimension()}")
        return model
    except ImportError:
        raise ImportError(
            "sentence-transformers not installed. Run: pip install sentence-transformers"
        )


def embed_texts(
    texts: list[str],
    model_name: str = DEFAULT_MODEL,
    batch_size: int = BATCH_SIZE,
) -> list[list[float]]:
    """
    Generate embeddings for a list of texts.
    Returns list of embedding vectors (each is a list of floats).
    """
    if not texts:
        return []

    model = _get_model(model_name)

    # Filter empty texts
    valid_texts = [t.strip() for t in texts if t and t.strip()]
    if not valid_texts:
        return []

    try:
        logger.info(f"Embedding {len(valid_texts)} texts in batches of {batch_size}")
        embeddings = model.encode(
            valid_texts,
            batch_size=batch_size,
            show_progress_bar=len(valid_texts) > 100,
            convert_to_numpy=True,
            normalize_embeddings=True,  # Normalize for cosine similarity
        )
        logger.info(f"Generated {len(embeddings)} embeddings of dim {embeddings.shape[1]}")
        return embeddings.tolist()

    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        raise


def embed_single(text: str, model_name: str = DEFAULT_MODEL) -> list[float]:
    """Embed a single text string."""
    results = embed_texts([text], model_name=model_name)
    return results[0] if results else []


def get_embedding_dimension(model_name: str = DEFAULT_MODEL) -> int:
    """Return the embedding dimension for the model."""
    model = _get_model(model_name)
    return model.get_sentence_embedding_dimension()
