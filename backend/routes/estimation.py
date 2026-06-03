"""
MotoRescue.ID — Estimation Router

POST /api/estimate — returns an AI-powered (or mock) cost estimation for a
motorcycle repair request.  When an ``OPENROUTER_API_KEY`` environment variable
is set, the endpoint queries the OpenRouter LLM API; otherwise it falls back to
a deterministic mock based on the requested ``service_type``.
"""

import json
import logging
import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

from backend.models import EstimationRequest, EstimationResponse, SparePart

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["estimation"])

# ---------------------------------------------------------------------------
# OpenRouter configuration
# ---------------------------------------------------------------------------
OPENROUTER_URL: str = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL: str = "deepseek/deepseek-v4-flash"

SYSTEM_PROMPT: str = (
    "You are an expert Indonesian motorcycle mechanic assistant. "
    "Analyze the user's motorcycle issue and return a JSON object with the following structure:\n"
    '{\n'
    '  "parts": [{"name": "<part name in Indonesian>", "price_min": <int Rupiah>, "price_max": <int Rupiah>}],\n'
    '  "repair_fee_min": <int Rupiah>,\n'
    '  "repair_fee_max": <int Rupiah>,\n'
    '  "summary": "<brief explanation in Indonesian>"\n'
    '}\n'
    "All prices must be in Indonesian Rupiah (IDR). Be realistic with Indonesian market prices. "
    "Return ONLY valid JSON, no markdown fences."
)

# ---------------------------------------------------------------------------
# Mock data per service type
# ---------------------------------------------------------------------------
_MOCK_DATA: dict[str, dict[str, Any]] = {
    "flat_tire": {
        "parts": [
            SparePart(name="Ban Dalam", price_min=35_000, price_max=50_000),
            SparePart(name="Ban Luar", price_min=80_000, price_max=150_000),
            SparePart(name="Jasa Tambal", price_min=15_000, price_max=25_000),
        ],
        "summary": "Estimasi untuk perbaikan ban kempes meliputi penggantian ban dalam/luar dan jasa tambal ban.",
    },
    "engine": {
        "parts": [
            SparePart(name="Busi", price_min=15_000, price_max=35_000),
            SparePart(name="Oli Mesin", price_min=45_000, price_max=80_000),
            SparePart(name="Filter Udara", price_min=20_000, price_max=40_000),
        ],
        "summary": "Estimasi untuk perbaikan mesin meliputi penggantian busi, oli mesin, dan filter udara.",
    },
    "towing": {
        "parts": [
            SparePart(name="Biaya Derek per km", price_min=15_000, price_max=25_000),
            SparePart(name="Tali Derek", price_min=30_000, price_max=50_000),
        ],
        "summary": "Estimasi untuk layanan derek meliputi biaya per kilometer dan peralatan derek.",
    },
    "general": {
        "parts": [
            SparePart(name="Diagnosa", price_min=25_000, price_max=50_000),
            SparePart(name="Suku Cadang Umum", price_min=50_000, price_max=150_000),
        ],
        "summary": "Estimasi umum meliputi biaya diagnosa dan suku cadang yang mungkin diperlukan.",
    },
}

CALLOUT_FEE: int = 25_000


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_mock_response(service_type: str) -> EstimationResponse:
    """Generate a deterministic estimation from the mock catalogue."""
    data = _MOCK_DATA.get(service_type, _MOCK_DATA["general"])
    parts: list[SparePart] = data["parts"]

    repair_fee_min: int = sum(p.price_min for p in parts)
    repair_fee_max: int = sum(p.price_max for p in parts)

    return EstimationResponse(
        parts=parts,
        callout_fee=CALLOUT_FEE,
        repair_fee_min=repair_fee_min,
        repair_fee_max=repair_fee_max,
        total_min=CALLOUT_FEE + repair_fee_min,
        total_max=CALLOUT_FEE + repair_fee_max,
        ai_summary=data["summary"],
    )


async def _call_openrouter(api_key: str, request: EstimationRequest) -> EstimationResponse:
    """Query the OpenRouter LLM and parse the structured JSON response."""
    user_message: str = (
        f"Jenis layanan: {request.service_type}\n"
        f"Deskripsi masalah: {request.description}"
    )

    headers: dict[str, str] = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload: dict[str, Any] = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.3,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(OPENROUTER_URL, json=payload, headers=headers)

    if response.status_code != 200:
        logger.error("OpenRouter API error %s: %s", response.status_code, response.text)
        raise HTTPException(
            status_code=502,
            detail="Failed to get estimation from AI service",
        )

    # Extract the assistant's text reply
    try:
        raw_content: str = response.json()["choices"][0]["message"]["content"]
        # Strip potential markdown code fences
        cleaned: str = raw_content.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        ai_data: dict[str, Any] = json.loads(cleaned)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        logger.error("Failed to parse OpenRouter response: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="AI returned an unparseable response",
        ) from exc

    # Build typed SparePart list
    parts: list[SparePart] = [
        SparePart(
            name=p.get("name", "Unknown"),
            price_min=int(p.get("price_min", 0)),
            price_max=int(p.get("price_max", 0)),
        )
        for p in ai_data.get("parts", [])
    ]

    repair_fee_min: int = int(ai_data.get("repair_fee_min", sum(p.price_min for p in parts)))
    repair_fee_max: int = int(ai_data.get("repair_fee_max", sum(p.price_max for p in parts)))

    return EstimationResponse(
        parts=parts,
        callout_fee=CALLOUT_FEE,
        repair_fee_min=repair_fee_min,
        repair_fee_max=repair_fee_max,
        total_min=CALLOUT_FEE + repair_fee_min,
        total_max=CALLOUT_FEE + repair_fee_max,
        ai_summary=ai_data.get("summary", "Estimasi berhasil dibuat oleh AI."),
    )


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post("/estimate", response_model=EstimationResponse)
async def estimate_cost(request: EstimationRequest) -> EstimationResponse:
    """Return a cost estimation for the described motorcycle issue.

    Uses the OpenRouter LLM when ``OPENROUTER_API_KEY`` is set; otherwise
    returns a deterministic mock estimation based on ``service_type``.
    """
    api_key: str | None = os.environ.get("OPENROUTER_API_KEY")

    if api_key:
        return await _call_openrouter(api_key, request)

    return _build_mock_response(request.service_type)
