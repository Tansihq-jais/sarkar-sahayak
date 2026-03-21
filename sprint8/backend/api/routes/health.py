from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    return {"status": "ok", "service": "sarkar-sahayak-backend"}


@router.get("/ready")
async def readiness_check():
    """Check if all required services are reachable."""
    checks = {}

    # Check Redis / Celery
    try:
        from celery_app import celery_app
        celery_app.control.ping(timeout=1)
        checks["celery"] = "ok"
    except Exception:
        checks["celery"] = "unavailable"

    # Check Pinecone
    try:
        from config import get_settings
        settings = get_settings()
        if settings.pinecone_api_key:
            checks["pinecone"] = "configured"
        else:
            checks["pinecone"] = "not configured"
    except Exception:
        checks["pinecone"] = "error"

    all_ok = all(v in ("ok", "configured", "not configured") for v in checks.values())

    return {
        "status": "ready" if all_ok else "degraded",
        "checks": checks,
    }
