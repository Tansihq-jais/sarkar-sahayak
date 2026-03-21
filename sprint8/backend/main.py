"""
Sarkar Sahayak — FastAPI Backend
Handles server-side document processing, OCR, embeddings and RAG.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from api.routes import documents, health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Sarkar Sahayak backend...")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Sarkar Sahayak API",
    description="Document processing and RAG pipeline for government scheme eligibility",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
