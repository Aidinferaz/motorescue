"""
MotoRescue.ID — Orders Router

Endpoint for placing a new service order.
"""

import random

from fastapi import APIRouter, HTTPException

from backend.database import create_order, get_mechanic_by_id
from backend.models import Mechanic, OrderRequest, OrderResponse

router = APIRouter(prefix="/api", tags=["orders"])


@router.post("/orders", response_model=OrderResponse)
async def place_order(payload: OrderRequest) -> OrderResponse:
    """Create an order and return confirmation with mechanic details."""

    # Validate that the requested mechanic exists
    mechanic_data = get_mechanic_by_id(payload.mechanic_id)
    if mechanic_data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Mechanic with id {payload.mechanic_id} not found",
        )

    # Persist the order
    order_id: int = create_order(
        mechanic_id=payload.mechanic_id,
        service_type=payload.service_type,
        description=payload.description,
        estimated_cost_min=payload.estimated_cost_min,
        estimated_cost_max=payload.estimated_cost_max,
    )

    # Build the response with a randomised ETA (5–15 minutes)
    return OrderResponse(
        order_id=order_id,
        status="confirmed",
        mechanic=Mechanic(**mechanic_data),
        estimated_arrival=random.randint(5, 15),
    )
