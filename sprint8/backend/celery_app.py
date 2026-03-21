"""
Celery app configuration.
Broker: Redis (local or Upstash free tier)
"""

from celery import Celery
from config import get_settings

settings = get_settings()

celery_app = Celery(
    "sarkar_sahayak",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["tasks.process_document"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "tasks.process_document.*": {"queue": "documents"},
    },
)
