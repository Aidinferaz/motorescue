FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose port
EXPOSE 8000

# Run with uvicorn (NO if __name__ block)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
