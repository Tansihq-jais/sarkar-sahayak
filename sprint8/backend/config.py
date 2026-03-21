from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_env: str = "development"
    debug: bool = True

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # Pinecone
    pinecone_api_key: str = ""
    pinecone_index_name: str = "sarkar-sahayak"
    pinecone_dimension: int = 384  # all-MiniLM-L6-v2 dimensions

    # AWS S3 (optional — local file storage used if not set)
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ap-south-1"
    s3_bucket: str = "sarkar-sahayak-docs"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # Embedding model (local, free)
    embedding_model: str = "all-MiniLM-L6-v2"

    # OCR
    tesseract_lang: str = "eng+hin"  # English + Hindi

    # Next.js frontend URL
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
