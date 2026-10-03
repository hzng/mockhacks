from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings

app = FastAPI(title="Hackathon Starter API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hackathon Starter API", "docs": "/docs", "health": "/api/health"}
