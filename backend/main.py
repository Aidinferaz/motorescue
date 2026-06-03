"""
MotoRescue.ID — FastAPI Application Entry Point

Creates the FastAPI app, registers CORS middleware, mounts routers, and
serves the frontend static files.  Importing ``backend.database`` at the
module level automatically triggers ``init_db()`` and ``seed_db()``.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Importing database triggers table creation and seeding
import backend.database  # noqa: F401
from backend.routes.estimation import router as estimation_router
from backend.routes.mechanics import router as mechanics_router
from backend.routes.orders import router as orders_router

# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="MotoRescue.ID API",
    description="On-demand emergency motorcycle mechanic service API",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow all origins for development / prototype use
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(mechanics_router)
app.include_router(orders_router)
app.include_router(estimation_router)

# ---------------------------------------------------------------------------
# Static files — serve the frontend SPA
# ---------------------------------------------------------------------------
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
