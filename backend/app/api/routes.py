import logging

from fastapi import APIRouter, HTTPException

from app.core.database import database_is_ready

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)


@router.get("/health")
async def health() -> dict[str, str]:
    try:
        database_ready = await database_is_ready()
    except Exception as exc:
        logger.exception("Database health check failed")
        raise HTTPException(status_code=503, detail="Database connection failed") from exc

    if not database_ready:
        raise HTTPException(status_code=503, detail="DATABASE_URL is not configured")

    return {"status": "ok", "database": "connected"}
