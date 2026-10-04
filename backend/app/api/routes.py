from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.core.config import settings
from app.core.database import DatabaseUnavailableError, check_database_connection
from app.core.storage import LocalJsonStore
from app.core.supabase import SupabaseUnavailableError, check_supabase_auth

router = APIRouter(prefix="/api")
store = LocalJsonStore(settings.local_storage_path)


@router.get("/health")
async def health() -> dict[str, str]:
    try:
        storage_ready = store.check_ready()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Local storage is unavailable") from exc

    if not storage_ready:
        raise HTTPException(status_code=503, detail="Local storage is unavailable")

    return {"status": "ok", "storage": "local-file"}


@router.get("/health/supabase")
def supabase_health() -> dict[str, str]:
    try:
        check_supabase_auth()
    except SupabaseUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"status": "ok", "service": "supabase-auth"}


@router.get("/health/database")
def database_health() -> dict[str, str]:
    try:
        check_database_connection()
    except DatabaseUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from None
    return {"status": "ok", "service": "postgresql"}


@router.get("/storage")
async def list_storage() -> dict[str, Any]:
    try:
        keys = store.list_keys()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail="Local storage is invalid") from exc
    return {"keys": keys, "count": len(keys)}


@router.get("/storage/{key}")
async def read_value(key: str) -> dict[str, Any]:
    try:
        return {"key": key, "value": store.get(key)}
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Storage key not found") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail="Local storage is invalid") from exc


@router.put("/storage/{key}")
async def write_value(key: str, request: Request) -> dict[str, Any]:
    try:
        value = await request.json()
        store.set(key, value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Request body must be valid JSON") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail="Local storage is invalid") from exc
    return {"key": key, "value": value}


@router.delete("/storage/{key}")
async def delete_value(key: str) -> dict[str, str]:
    try:
        store.delete(key)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Storage key not found") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail="Local storage is invalid") from exc
    return {"status": "deleted", "key": key}
