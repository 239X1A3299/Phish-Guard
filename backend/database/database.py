"""
Database setup and session management using SQLAlchemy.
Creates the SQLite database and provides a session dependency.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from backend.config import DATABASE_URL, BASE_DIR
import os

# Ensure the database directory exists
os.makedirs(BASE_DIR / "database", exist_ok=True)

# SQLAlchemy engine - check_same_thread=False is required for SQLite with FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables on startup."""
    import backend.database.models  # Import models to register them
    Base.metadata.create_all(bind=engine)