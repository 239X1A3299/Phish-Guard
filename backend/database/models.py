"""
SQLAlchemy ORM models for the phishing detection system.
Defines User, Scan, and Admin tables.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.database import Base


class User(Base):
    """User account model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: one user has many scans
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    """Stores the result of each URL scan."""
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    url = Column(Text, nullable=False)
    prediction = Column(String(20), nullable=False)          # Safe / Suspicious / Phishing
    confidence = Column(Float, nullable=False)               # 0.0 - 1.0
    risk_score = Column(Integer, nullable=False)             # 0 - 100
    detected_problems = Column(JSON, default=list)           # List of issue descriptions
    recommendations = Column(JSON, default=list)             # List of security tips
    features = Column(JSON, default=dict)                    # Feature values used in prediction
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationship back to user
    user = relationship("User", back_populates="scans")


class AdminAction(Base):
    """Log of administrative actions (audit trail)."""
    __tablename__ = "admin_actions"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(200), nullable=False)
    details = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())