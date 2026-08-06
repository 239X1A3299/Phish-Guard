"""
Configuration settings for the AI-Based Website Phishing Detection System.
Centralizes all environment variables and application constants.
"""
import os
from pathlib import Path

# Base directory of the backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key for JWT signing - in production use a secure environment variable
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-9f8e7d6c5b4a")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'database' / 'phishing_detector.db'}")

# Model configuration paths
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "best_model.pkl"
VECTORIZER_PATH = MODEL_DIR / "feature_names.pkl"
MODEL_METRICS_PATH = MODEL_DIR / "model_metrics.json"
DATASET_PATH = BASE_DIR / "dataset" / "url_dataset.csv"

# Report storage
REPORTS_DIR = BASE_DIR / "reports"

# CORS origins - allow frontend dev server and production
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://phishshield-frontend.onrender.com",
    "https://phishshield-backend.onrender.com",
    "*",  # Allow all for demo purposes - restrict in production
]

# Scoring thresholds for risk levels
SAFE_THRESHOLD = 0.30          # Score below this → Safe
SUSPICIOUS_THRESHOLD = 0.65    # Score below this → Suspicious, else Phishing

# Feature extraction constants
SUSPICIOUS_KEYWORDS = [
    "login", "verify", "account", "update", "bank", "secure",
    "signin", "wallet", "password", "confirm", "webscr", "auth",
    "paypal", "ebay", "free", "bonus", "click", "win", "prize",
    "offer", "rewards", "gift", "0", "token", "session",
]

# Suspicious TLDs often used in phishing
SUSPICIOUS_TLDS = [
    "tk", "ml", "ga", "cf", "gq", "xyz", "top", "club", "work",
    "loan", "men", "download", "racing", "review", "stream",
]

# URL shortening services (often used to hide phishing URLs)
URL_SHORTENERS = [
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd",
    "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "rb.gy",
]