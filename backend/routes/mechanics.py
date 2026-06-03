"""
MotoRescue.ID — Mechanics Router

Endpoints for listing and retrieving registered mechanics.
"""

from fastapi import APIRouter, HTTPException

from backend.database import get_all_mechanics, get_mechanic_by_id
from backend.models import Mechanic

router = APIRouter(prefix="/api", tags=["mechanics"])


@router.get("/mechanics", response_model=list[Mechanic])
async def list_mechanics() -> list[dict]:
    """Return all mechanics sorted by distance (nearest first)."""
    mechanics: list[dict] = get_all_mechanics()
    return mechanics


@router.get("/mechanics/{mechanic_id}", response_model=Mechanic)
async def get_mechanic(mechanic_id: int) -> dict:
    """Return a single mechanic by ID, or 404 if not found."""
    mechanic = get_mechanic_by_id(mechanic_id)
    if mechanic is None:
        raise HTTPException(status_code=404, detail=f"Mechanic with id {mechanic_id} not found")
    return mechanic
