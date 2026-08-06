"""
PhishShield - AI-Based Website Phishing Detection System
Main FastAPI application entry point.
"""
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Fix Unicode encoding issues on Windows (Korean path characters)
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Add project root to path (for running directly from backend/)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import CORS_ORIGINS, MODEL_PATH
from backend.database.database import init_db
from backend.database import models  # noqa: F401 - ensure models are registered
from backend.api import auth, scan, dashboard, report

# ------------------- Application Setup -------------------

# Ensure the model file exists before importing predictor
model_exists = MODEL_PATH.exists()

from backend.ml.predictor import predictor  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan - runs on startup and shutdown.
    Initializes the database and ensures the ML model is ready.
    """
    # Initialize database tables
    init_db()

    # Train model on first run if no saved model exists
    if not model_exists:
        print("[STARTUP] No pre-trained model found. Training model on built-in dataset...")
        try:
            from backend.ml.model_training import main as train_and_evaluate_models
            train_and_evaluate_models()
            print("[STARTUP] Model training complete.")
        except Exception as e:
            print(f"[STARTUP] Model training failed: {e}")
            print("[STARTUP] Using fallback heuristic detection until model is trained.")

    yield


# Create FastAPI app
app = FastAPI(
    title="PhishShield API",
    description="AI-Based Website Phishing Detection System - REST API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ------------------- CORS Middleware -------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- Routers -------------------
app.include_router(auth.router)
app.include_router(scan.router)
app.include_router(dashboard.router)
app.include_router(report.router)


# ------------------- Root & Health Endpoints -------------------

@app.get("/")
def root():
    """Root endpoint - basic API info."""
    return {
        "app": "PhishShield API",
        "description": "AI-Based Website Phishing Detection System",
        "version": "1.0.0",
        "docs": "/api/docs",
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "model_loaded": predictor.model is not None,
        "model_path": str(MODEL_PATH) if MODEL_PATH.exists() else "Not trained yet",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler - returns a structured error response."""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


# Run with: uvicorn backend.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)