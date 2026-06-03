"""
MotoRescue.ID — Pydantic Models

Defines all request/response schemas used across the MotoRescue.ID API.
Every model is fully typed and validated via Pydantic v2.
"""

from pydantic import BaseModel, Field


class Mechanic(BaseModel):
    """Represents a registered mechanic available for dispatch."""

    id: int
    name: str
    photo: str = Field(description="URL or path to the mechanic's profile photo")
    distance: float = Field(description="Distance from the user in kilometres")
    rating: float = Field(ge=1.0, le=5.0, description="Average rating (1–5 stars)")
    specialty: str = Field(description="Area of expertise, e.g. 'Ban & Velg'")
    plate: str = Field(description="Vehicle registration plate")
    phone: str
    lat: float
    lng: float


class SparePart(BaseModel):
    """A single spare-part line item in a cost estimation."""

    name: str
    price_min: int = Field(ge=0)
    price_max: int = Field(ge=0)


class EstimationRequest(BaseModel):
    """Payload sent by the client to request a cost estimation."""

    description: str = Field(min_length=1, description="Free-text description of the issue")
    service_type: str = Field(
        default="general",
        description="One of: flat_tire, engine, towing, general",
    )


class EstimationResponse(BaseModel):
    """AI-generated (or mock) cost breakdown returned to the client."""

    parts: list[SparePart]
    callout_fee: int = Field(default=25_000, description="Fixed callout fee in Rupiah (Rp 25.000)")
    repair_fee_min: int
    repair_fee_max: int
    total_min: int
    total_max: int
    ai_summary: str = Field(description="Human-readable AI explanation of the estimate")


class OrderRequest(BaseModel):
    """Payload sent by the client to place a new service order."""

    mechanic_id: int
    service_type: str
    description: str
    estimated_cost_min: int
    estimated_cost_max: int


class OrderResponse(BaseModel):
    """Confirmation returned after an order is successfully created."""

    order_id: int
    status: str
    mechanic: Mechanic
    estimated_arrival: int = Field(description="Estimated arrival time in minutes")
