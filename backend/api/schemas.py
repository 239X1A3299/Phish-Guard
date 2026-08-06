"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------- User schemas ----------
class UserRegister(BaseModel):
    """Registration request schema."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not v.isalnum() and "_" not in v:
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v


class UserLogin(BaseModel):
    """Login request schema."""
    username: str
    password: str


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------- Scan schemas ----------
class ScanRequest(BaseModel):
    """URL scan request schema."""
    url: str = Field(..., min_length=4, max_length=2048)

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        import validators
        v = v.strip()
        if not validators.url(v):
            # Try adding https:// prefix
            if not v.startswith(("http://", "https://")):
                v = "https://" + v
                if not validators.url(v):
                    raise ValueError("Invalid URL format")
            else:
                raise ValueError("Invalid URL format")
        return v


class ScanResult(BaseModel):
    """Scan result response schema."""
    id: int
    url: str
    prediction: str
    confidence: float
    risk_score: int
    detected_problems: List[str]
    recommendations: List[str]
    features: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class ScanHistoryResponse(BaseModel):
    """Pagination wrapper for scan history."""
    total: int
    page: int
    page_size: int
    scans: List[ScanResult]


# ---------- Dashboard schemas ----------
class DashboardStats(BaseModel):
    """Dashboard statistics schema."""
    total_scans: int
    safe_urls: int
    suspicious_urls: int
    phishing_urls: int
    recent_scans: List[ScanResult]
    risk_distribution: Dict[str, int]
    daily_scan_counts: List[Dict[str, Any]]


# ---------- Admin schemas ----------
class AdminStats(BaseModel):
    """Admin overview statistics."""
    total_users: int
    total_scans: int
    scans_today: int
    active_users: int
    scan_distribution: Dict[str, int]
    users: List[UserResponse]


class AdminUserUpdate(BaseModel):
    """Admin user update request."""
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


# ---------- Report schemas ----------
class ReportRequest(BaseModel):
    """Report generation request."""
    scan_id: int