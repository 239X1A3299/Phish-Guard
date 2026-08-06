"""
Scan API endpoints - URL scanning, history retrieval, filtering, export.
"""
import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database.models import User, Scan
from backend.utils.auth import get_current_user
from backend.api.schemas import ScanRequest, ScanResult, ScanHistoryResponse
from backend.ml.predictor import predictor

router = APIRouter(prefix="/api", tags=["Scanner"])


@router.post("/scan", response_model=ScanResult)
def scan_url(
    scan_request: ScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Scan a URL using the ML model and store the result."""
    url = scan_request.url.strip()

    # Run prediction
    result = predictor.predict(url)

    # Store in database
    scan = Scan(
        user_id=current_user.id,
        url=url,
        prediction=result["prediction"],
        confidence=result["confidence"],
        risk_score=result["risk_score"],
        detected_problems="||".join(result["detected_problems"]),
        recommendations="||".join(result["recommendations"]),
        features={
            "values": result["features"],
            "names": predictor.feature_names,
        },
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    return ScanResult(
        id=scan.id,
        url=scan.url,
        prediction=scan.prediction,
        confidence=scan.confidence,
        risk_score=scan.risk_score,
        detected_problems=result["detected_problems"],
        recommendations=result["recommendations"],
        features=result["features"],
        created_at=scan.created_at,
    )


@router.get("/scan/{scan_id}", response_model=ScanResult)
def get_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single scan result by ID (only for the owner)."""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

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


@router.get("/history", response_model=ScanHistoryResponse)
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str = Query("", description="Search by URL"),
    status: str = Query("", description="Filter by prediction: Safe, Suspicious, Phishing"),
):
    """Get paginated scan history with optional search and filter."""
    query = db.query(Scan).filter(Scan.user_id == current_user.id)

    if search:
        query = query.filter(Scan.url.ilike(f"%{search}%"))
    if status:
        query = query.filter(Scan.prediction.ilike(f"%{status}%"))

    total = query.count()
    scans = (
        query.order_by(Scan.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    scan_results = []
    for scan in scans:
        scan_results.append(
            ScanResult(
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
        )

    return ScanHistoryResponse(total=total, page=page, page_size=page_size, scans=scan_results)


@router.get("/history/export")
def export_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    format: str = Query("csv"),
):
    """Export scan history as CSV."""
    scans = db.query(Scan).filter(Scan.user_id == current_user.id).order_by(Scan.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "URL", "Prediction", "Confidence", "Risk Score", "Date"])
    for scan in scans:
        writer.writerow([
            scan.id,
            scan.url,
            scan.prediction,
            scan.confidence,
            scan.risk_score,
            scan.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        ])

    output.seek(0)
    filename = f"scan_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )