"""Standalone runner for Person B's bounty API (port 8001).

    cd person-b/backend
    .venv/bin/fastapi dev app.py --port 8001
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from bounties import router

app = FastAPI(title="Community Bridge - Bounty API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    expose_headers=["X-Bounty-Source"],
)
app.include_router(router)
