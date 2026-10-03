"""Person B: bounty card flow (generate -> review -> post -> board).

Exposes `router` so the integration owner can mount it into the shared backend:
    from bounties import router as bounty_router
    app.include_router(bounty_router)
"""

import json
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from typing import Literal

import anthropic
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field, field_validator

HERE = Path(__file__).resolve().parent
load_dotenv(HERE / ".env")  # ANTHROPIC_API_KEY lives here; never hardcode it

log = logging.getLogger("bounties")
CLAUDE_MODEL = "claude-sonnet-5-5"
CLAUDE_TIMEOUT_SECONDS = 9.0
SEED_PATH = HERE / "seed_bounties.json"
FALLBACK_PATH = HERE / "fallback_card.json"
DATA_PATH = HERE / "data" / "bounties.json"

DEMO_OWNER = {"name": "Maria Lopez", "business_name": "Sweet Crumb Bakery"}

CASH_PATTERN = re.compile(r"\$\s*\d|\bcash\b|\bvenmo\b|\bzelle\b|\bpaypal\b|\bper hour\b", re.I)


class BountyCard(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    summary: str = Field(min_length=10, max_length=400)
    tasks: list[str] = Field(min_length=1)
    done_when: list[str] = Field(min_length=1)
    skills: list[str] = Field(min_length=1)
    estimated_hours: float = Field(gt=0, le=200)
    difficulty: Literal["easy", "medium", "hard"]
    reward: str = Field(min_length=3)
    business_name: str = Field(min_length=1)

    @field_validator("tasks", "done_when", "skills")
    @classmethod
    def no_blank_items(cls, items: list[str]) -> list[str]:
        cleaned = [item.strip() for item in items if item.strip()]
        if not cleaned:
            raise ValueError("must contain at least one non-empty item")
        return cleaned

    @field_validator("reward")
    @classmethod
    def reward_is_not_cash(cls, reward: str) -> str:
        if CASH_PATTERN.search(reward):
            raise ValueError("reward must be a portfolio entry or local perk, never cash")
        return reward


class SavedBounty(BountyCard):
    id: str
    owner_name: str
    status: str = "open"
    created_at: str


class GenerateRequest(BaseModel):
    problem: str = Field(min_length=5, max_length=2000)


class BountyStore:
    """Tiny JSON-file store, seeded with mock Cupertino bounties on first use."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = RLock()

    def list(self) -> list[dict]:
        with self._lock:
            bounties = self._read()
        return sorted(bounties, key=lambda b: b["created_at"], reverse=True)

    def add(self, card: BountyCard) -> dict:
        saved = SavedBounty(
            **card.model_dump(),
            id=uuid.uuid4().hex[:12],
            owner_name=DEMO_OWNER["name"],
            created_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        ).model_dump()
        with self._lock:
            bounties = self._read()
            bounties.append(saved)
            self._write(bounties)
        return saved

    def _read(self) -> list[dict]:
        if not self.path.exists():
            seeds = json.loads(SEED_PATH.read_text(encoding="utf-8"))
            self._write(seeds)
            return seeds
        return json.loads(self.path.read_text(encoding="utf-8"))

    def _write(self, bounties: list[dict]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.path.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(bounties, indent=2), encoding="utf-8")
        tmp.replace(self.path)


store = BountyStore(DATA_PATH)
router = APIRouter(prefix="/api")


def fallback_card() -> dict:
    return BountyCard(**json.loads(FALLBACK_PATH.read_text(encoding="utf-8"))).model_dump()


class DraftCard(BaseModel):
    """Plain shape for Claude's structured output; BountyCard does the strict validation."""

    title: str
    summary: str
    tasks: list[str]
    done_when: list[str]
    skills: list[str]
    estimated_hours: float
    difficulty: Literal["easy", "medium", "hard"]
    reward: str
    business_name: str


SYSTEM_PROMPT = """You turn a small local business's problem, written in plain words, into a \
bounty card for De Anza College students in Cupertino, CA.

Write for both a non-technical owner and a student:
- title: short, plain English, under 70 characters, no jargon.
- summary: 1-2 sentences describing the problem and the outcome the owner wants.
- tasks: 3-4 concrete steps a student would do, one short sentence each.
- done_when: exactly 3 checks the owner can verify themselves without technical knowledge, one short sentence each.
- skills: 2-4 short skill tags, e.g. "HTML/CSS", "Spanish translation", "Excel", "Canva".
- estimated_hours: realistic hours for a capable student (usually 2-20).
- difficulty: "easy", "medium", or "hard".
- reward: a verified portfolio entry from the business, optionally plus a small local perk \
from that business (a free item, a discount, a reference letter). Never cash, wages, \
dollar amounts, or gift cards with a dollar value.
- business_name: use the business name given; do not invent a different one.

Do not invent facts the owner didn't give (addresses, prices, software names) unless \
phrased as something the student should find out."""


def generate_with_claude(problem: str) -> dict:
    """One Claude call -> validated card dict. Raises on any failure."""
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise RuntimeError("ANTHROPIC_API_KEY is not set")
    client = anthropic.Anthropic(timeout=CLAUDE_TIMEOUT_SECONDS, max_retries=0)
    response = client.beta.messages.parse(
        model=CLAUDE_MODEL,
        max_tokens=4000,
        output_config={"effort": "low"},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Business: {DEMO_OWNER['business_name']}\n\nProblem from the owner:\n{problem}",
        }],
        output_format=DraftCard,
    )
    if response.stop_reason != "end_turn" or response.parsed_output is None:
        raise RuntimeError(f"Claude stopped with {response.stop_reason}")
    return BountyCard(**response.parsed_output.model_dump()).model_dump()


@router.post("/bounties/generate")
def generate_bounty(body: GenerateRequest, response: Response) -> dict:
    """Turn a plain-words problem into a draft card. Not saved.

    Any failure (no key, timeout, API error, bad JSON, schema mismatch) returns the saved
    example card so the demo never breaks. X-Bounty-Source says which one you got.
    """
    try:
        card = generate_with_claude(body.problem)
        response.headers["X-Bounty-Source"] = "ai"
        return card
    except Exception as exc:  # demo must never break, whatever went wrong
        log.warning("Claude generation failed, using fallback card: %s", exc)
        response.headers["X-Bounty-Source"] = "fallback"
        return fallback_card()


@router.post("/bounties", status_code=201)
def create_bounty(card: BountyCard) -> dict:
    return store.add(card)


@router.get("/bounties")
def list_bounties() -> list[dict]:
    try:
        return store.list()
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=500, detail="Bounty storage is unreadable") from exc
