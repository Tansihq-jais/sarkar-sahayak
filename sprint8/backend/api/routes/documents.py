"""
FastAPI router for document processing endpoints.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import logging

from tasks.process_document import process_document

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
