from collections.abc import AsyncIterator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

engine = (
    create_async_engine(settings.database_url, pool_pre_ping=True)
    if settings.database_url
    else None
)
session_factory = async_sessionmaker(engine, expire_on_commit=False) if engine else None


async def get_session() -> AsyncIterator[AsyncSession]:
    if session_factory is None:
        raise RuntimeError("DATABASE_URL is not configured")
    async with session_factory() as session:
        yield session


async def database_is_ready() -> bool:
    if session_factory is None:
        return False
    async with session_factory() as session:
        await session.execute(text("select 1"))
    return True
