# -------------------------------
# PhishShield - AI-Based Website Phishing Detection System
# Multi-stage Docker build
# -------------------------------

# -------------------------------
# Stage 1: Build React Frontend
# -------------------------------
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build the React app
RUN npm run build

# -------------------------------
# Stage 2: Python Backend + Static Frontend
# -------------------------------
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/
COPY model/ ./model/
COPY dataset/ ./dataset/
COPY reports/ ./reports/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create non-root user
RUN useradd -m phishshield && chown -R phishshield:phishshield /app
USER phishshield

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start the FastAPI server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]