"""
MotoRescue.ID — SQLite Database Layer

Provides helpers to initialise, seed, and query a lightweight SQLite database.
Tables are created and seeded automatically when this module is first imported.
"""

import sqlite3
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Database path — created in the current working directory at runtime
# ---------------------------------------------------------------------------
DB_PATH: str = "motorescue.db"


def _get_connection() -> sqlite3.Connection:
    """Return a new SQLite connection with row-factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------------------------------------------------------
# Schema creation
# ---------------------------------------------------------------------------

def init_db() -> None:
    """Create the ``mechanics`` and ``orders`` tables if they do not exist."""
    conn = _get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS mechanics (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            photo       TEXT    NOT NULL,
            distance    REAL    NOT NULL,
            rating      REAL    NOT NULL,
            specialty   TEXT    NOT NULL,
            plate       TEXT    NOT NULL,
            phone       TEXT    NOT NULL,
            lat         REAL    NOT NULL,
            lng         REAL    NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            mechanic_id         INTEGER NOT NULL,
            service_type        TEXT    NOT NULL,
            description         TEXT    NOT NULL,
            estimated_cost_min  INTEGER NOT NULL,
            estimated_cost_max  INTEGER NOT NULL,
            status              TEXT    NOT NULL DEFAULT 'confirmed',
            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (mechanic_id) REFERENCES mechanics(id)
        )
        """
    )

    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

_SEED_MECHANICS: list[dict] = [
    {
        "name": "Ahmad Sudirman",
        "photo": "https://ui-avatars.com/api/?name=Ahmad+Sudirman&background=DC2626&color=fff&size=128",
        "distance": 0.8,
        "rating": 4.8,
        "specialty": "Ban & Velg",
        "plate": "B 1234 XYZ",
        "phone": "+6281234567801",
        "lat": -6.2050,
        "lng": 106.8500,
    },
    {
        "name": "Budi Prasetyo",
        "photo": "https://ui-avatars.com/api/?name=Budi+Prasetyo&background=DC2626&color=fff&size=128",
        "distance": 1.2,
        "rating": 4.6,
        "specialty": "Mesin",
        "plate": "B 5678 ABC",
        "phone": "+6281234567802",
        "lat": -6.2120,
        "lng": 106.8400,
    },
    {
        "name": "Cahyo Wibowo",
        "photo": "https://ui-avatars.com/api/?name=Cahyo+Wibowo&background=DC2626&color=fff&size=128",
        "distance": 1.5,
        "rating": 4.9,
        "specialty": "Kelistrikan",
        "plate": "B 9012 DEF",
        "phone": "+6281234567803",
        "lat": -6.2000,
        "lng": 106.8380,
    },
    {
        "name": "Dedi Kurniawan",
        "photo": "https://ui-avatars.com/api/?name=Dedi+Kurniawan&background=DC2626&color=fff&size=128",
        "distance": 2.0,
        "rating": 4.3,
        "specialty": "Umum",
        "plate": "B 3456 GHI",
        "phone": "+6281234567804",
        "lat": -6.2150,
        "lng": 106.8520,
    },
    {
        "name": "Eko Saputra",
        "photo": "https://ui-avatars.com/api/?name=Eko+Saputra&background=DC2626&color=fff&size=128",
        "distance": 2.3,
        "rating": 4.7,
        "specialty": "Derek & Towing",
        "plate": "B 7890 JKL",
        "phone": "+6281234567805",
        "lat": -6.1980,
        "lng": 106.8550,
    },
    {
        "name": "Fajar Rahman",
        "photo": "https://ui-avatars.com/api/?name=Fajar+Rahman&background=DC2626&color=fff&size=128",
        "distance": 3.1,
        "rating": 4.5,
        "specialty": "Ban & Mesin",
        "plate": "B 2345 MNO",
        "phone": "+6281234567806",
        "lat": -6.2200,
        "lng": 106.8350,
    },
]


def seed_db() -> None:
    """Insert the default set of mechanics if the table is empty."""
    conn = _get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM mechanics")
    count: int = cursor.fetchone()[0]

    if count == 0:
        cursor.executemany(
            """
            INSERT INTO mechanics (name, photo, distance, rating, specialty, plate, phone, lat, lng)
            VALUES (:name, :photo, :distance, :rating, :specialty, :plate, :phone, :lat, :lng)
            """,
            _SEED_MECHANICS,
        )
        conn.commit()

    conn.close()


# ---------------------------------------------------------------------------
# Query helpers
# ---------------------------------------------------------------------------

def get_all_mechanics() -> list[dict]:
    """Return every mechanic row as a plain dictionary."""
    conn = _get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mechanics ORDER BY distance ASC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def get_mechanic_by_id(mechanic_id: int) -> Optional[dict]:
    """Return a single mechanic by primary key, or ``None`` if not found."""
    conn = _get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mechanics WHERE id = ?", (mechanic_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def create_order(
    mechanic_id: int,
    service_type: str,
    description: str,
    estimated_cost_min: int,
    estimated_cost_max: int,
) -> int:
    """Insert a new order and return the generated ``order_id``."""
    conn = _get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO orders (mechanic_id, service_type, description, estimated_cost_min, estimated_cost_max)
        VALUES (?, ?, ?, ?, ?)
        """,
        (mechanic_id, service_type, description, estimated_cost_min, estimated_cost_max),
    )
    conn.commit()
    order_id: int = cursor.lastrowid  # type: ignore[assignment]
    conn.close()
    return order_id


# ---------------------------------------------------------------------------
# Auto-initialise on import
# ---------------------------------------------------------------------------
init_db()
seed_db()
