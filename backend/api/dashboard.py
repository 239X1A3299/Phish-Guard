"""
Dashboard API - aggregate statistics and visualizations for the user.
"""
from datetime import datetime, timedelta
from collections import Counter
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database.database import get_db
from backend.database.models import User, Scan
from backend.utils.auth import get_current_user, get_current_admin
from backend.api.schemas import (
    ScanResult,
    DashboardStats,
    AdminStats,
    UserResponse,
    AdminUserUpdate,
)

router = APIRouter(prefix="/api", tags=["Dashboard"])


def _scan_to_result(scan: Scan) -> ScanResult:
    """Convert a Scan ORM object to a ScanResult schema."""
    return ScanResult(
        id=scan.id,
        url=scan.url,
        prediction=scan.prediction,
        confidence=scan.confidence,
        risk_score=scan.risk_score,
        detected_problems=scan.detected_problems.split("||") if scan.detected_problems else [],
        recommendations=scan.recommendations.split("||") if scan.recommendations else [],
        features=scan.features.get("values", {}) if scan.features else {},
        created_at=scan.created_at,
    )


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics for the current user."""
    # Query all scans for this user
    scans = db.query(Scan).filter(Scan.user_id == current_user.id).all()
    total = len(scans)

    # Count by prediction type
    safe = sum(1 for s in scans if s.prediction == "Safe")
    suspicious = sum(1 for s in scans if s.prediction == "Suspicious")
    phishing = sum(1 for s in scans if s.prediction == "Phishing")

    # Recent 10 scans
    recent = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .limit(10)
        .all()
    )

    # Risk distribution (score buckets)
    risk_distribution = {
        "0-20": sum(1 for s in scans if s.risk_score <= 20),
        "21-40": sum(1 for s in scans if 21 <= s.risk_score <= 40),
        "41-60": sum(1 for s in scans if 41 <= s.risk_score <= 60),
        "61-80": sum(1 for s in scans if 61 <= s.risk_score <= 80),
        "81-100": sum(1 for s in scans if 81 <= s.risk_score <= 100),
    }

    # Daily scan counts for last 7 days
    daily_counts = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = (
            db.query(Scan)
            .filter(Scan.user_id == current_user.id)
            .filter(Scan.created_at >= day_start, Scan.created_at < day_end)
            .count()
        )
        daily_counts.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "count": count,
        })

    return DashboardStats(
        total_scans=total,
        safe_urls=safe,
        suspicious_urls=suspicious,
        phishing_urls=phishing,
        recent_scans=[_scan_to_result(s) for s in recent],
        risk_distribution=risk_distribution,
        daily_scan_counts=daily_counts,
    )


# ---------------- Admin endpoints ----------------

@router.get("/admin/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get admin-level statistics for all users and scans."""
    total_users = db.query(User).count()
    total_scans = db.query(Scan).count()
    active_users = db.query(User).filter(User.is_active == True).count()  # noqa: E712

    # Scans today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    scans_today = db.query(Scan).filter(Scan.created_at >= today_start).count()

    # Distribution across all scans
    all_scans = db.query(Scan).all()
    scan_distribution = {
        "Safe": sum(1 for s in all_scans if s.prediction == "Safe"),
        "Suspicious": sum(1 for s in all_scans if s.prediction == "Suspicious"),
        "Phishing": sum(1 for s in all_scans if s.prediction == "Phishing"),
    }

    # All users
    users = db.query(User).order_by(User.created_at.desc()).all()

    return AdminStats(
        total_users=total_users,
        total_scans=total_scans,
        scans_today=scans_today,
        active_users=active_users,
        scan_distribution=scan_distribution,
        users=[UserResponse.model_validate(u) for u in users],
    )


@router.patch("/admin/users/{user_id}", response_model=UserResponse)
def update_user_status(
    user_id: int,
    update: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update a user's active/admin status (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent deactivating yourself
    if user.id == current_user.id and update.is_active is False:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")

    if update.is_active is not None:
        user.is_active = update.is_active
    if update.is_admin is not None:
        user.is_admin = update.is_admin

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)