"""
Report API - generate and download PDF security reports for scans.
"""
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from backend.database.database import get_db
from backend.database.models import User, Scan
from backend.utils.auth import get_current_user
from backend.config import REPORTS_DIR

router = APIRouter(prefix="/api", tags=["Reports"])


def _generate_pdf(scan: Scan, output_path: str) -> str:
    """
    Generate a professional PDF security report for a given scan.
    Returns the path to the generated PDF file.
    """
    # Ensure reports directory exists
    os.makedirs(REPORTS_DIR, exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        title=f"Security Report - {scan.url}",
    )

    # Custom styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=22,
        textColor=colors.HexColor("#0a0f1e"),
        spaceAfter=4,
    )
    heading_style = ParagraphStyle(
        "HeadingStyle",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#0a0f1e"),
        spaceBefore=10,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["BodyText"],
        fontSize=10,
        textColor=colors.HexColor("#333333"),
        spaceAfter=4,
    )
    label_style = ParagraphStyle(
        "LabelStyle",
        parent=styles["BodyText"],
        fontSize=10,
        textColor=colors.HexColor("#666666"),
        spaceAfter=2,
    )
    small_style = ParagraphStyle(
        "SmallStyle",
        parent=styles["BodyText"],
        fontSize=8.5,
        textColor=colors.HexColor("#888888"),
    )

    # Determine risk color
    risk_color = {
        "Safe": colors.HexColor("#10b981"),
        "Suspicious": colors.HexColor("#f59e0b"),
        "Phishing": colors.HexColor("#ef4444"),
    }.get(scan.prediction, colors.HexColor("#6366f1"))

    story = []

    # ------------------- Header -------------------
    story.append(Paragraph("🔐 PhishShield", title_style))
    story.append(Paragraph("AI-Based Website Phishing Detection System", label_style))
    story.append(Paragraph(
        f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        small_style,
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0a0f1e")))
    story.append(Spacer(1, 12))

    # ------------------- Scan Summary -------------------
    story.append(Paragraph("Scan Summary", heading_style))

    summary_data = [
        ["Scanned URL", scan.url],
        ["Prediction", scan.prediction],
        ["Confidence", f"{scan.confidence:.2%}"],
        ["Risk Score", f"{scan.risk_score}/100"],
        ["Scan Date", scan.created_at.strftime("%Y-%m-%d %H:%M:%S")],
    ]
    summary_table = Table(summary_data, colWidths=[1.5 * inch, 4.5 * inch])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f3f4f6")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#333333")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#333333")),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(summary_table)

    # Prediction banner
    story.append(Spacer(1, 10))
    banner_style = ParagraphStyle(
        "BannerStyle",
        parent=styles["Heading3"],
        fontSize=14,
        textColor=colors.white,
        alignment=1,  # CENTER
        backColor=risk_color,
        borderPadding=8,
    )
    story.append(Paragraph(f"VERDICT: {scan.prediction.upper()}", banner_style))
    story.append(Spacer(1, 8))

    # ------------------- Risk Score Bar -------------------
    story.append(Paragraph("Risk Score", heading_style))
    # Draw a simple visual bar using a table
    bar_table = Table(
        [[f"Score: {scan.risk_score}/100"]],
        colWidths=[6 * inch],
        rowHeights=[0.35 * inch],
    )
    bar_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), risk_color),
        ("TEXTCOLOR", (0, 0), (0, 0), colors.white),
        ("FONTNAME", (0, 0), (0, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (0, 0), 12),
        ("ALIGN", (0, 0), (0, 0), "CENTER"),
        ("VALIGN", (0, 0), (0, 0), "MIDDLE"),
    ]))
    story.append(bar_table)
    story.append(Spacer(1, 12))

    # ------------------- Detected Problems -------------------
    story.append(Paragraph("Detected Problems", heading_style))
    problems = scan.detected_problems.split("||") if scan.detected_problems else ["No major issues detected"]
    for i, problem in enumerate(problems, 1):
        story.append(Paragraph(f"•  {problem}", body_style))

    story.append(Spacer(1, 8))

    # ------------------- Security Recommendations -------------------
    story.append(Paragraph("Security Recommendations", heading_style))
    recs = scan.recommendations.split("||") if scan.recommendations else ["Keep browsing safely"]
    for i, rec in enumerate(recs, 1):
        story.append(Paragraph(f"{i}.  {rec}", body_style))

    story.append(Spacer(1, 8))

    # ------------------- Feature Analysis -------------------
    story.append(Paragraph("Feature Analysis", heading_style))

    # Build feature table from stored JSON
    feature_rows = []
    if scan.features:
        feat_values = scan.features.get("values", {})
        named_features = scan.features.get("names", [])

        # Map short names to human-readable labels
        readable_labels = {
            "url_length": "URL Length",
            "num_dots": "Number of Dots",
            "num_hyphens": "Number of Hyphens",
            "num_slashes": "Number of Slashes",
            "num_digits": "Number of Digits",
            "num_special_chars": "Special Characters",
            "uses_https": "Uses HTTPS",
            "has_ip": "Contains IP Address",
            "has_at_symbol": "Contains @ Symbol",
            "has_dash": "Contains Hyphen (-)",
            "num_subdomains": "Number of Subdomains",
            "suspicious_keywords": "Suspicious Keywords Count",
            "domain_age_days": "Domain Age (days)",
            "has_dns_record": "Has DNS Record",
            "is_ssl_valid": "Valid SSL Certificate",
            "is_url_shortened": "URL Shortener",
            "suspicious_tld": "Suspicious TLD",
            "tld_length": "TLD Length",
        }

        for f in named_features:
            label = readable_labels.get(f, f.replace("_", " ").title())
            value = feat_values.get(f, "N/A")
            # Format booleans nicely
            if isinstance(value, bool):
                display = "Yes" if value else "No"
            elif isinstance(value, (int, float)) and not isinstance(value, bool):
                display = f"{value:.0f}" if value == int(value) else f"{value:.3f}"
            else:
                display = str(value)
            feature_rows.append([label, display])

    if feature_rows:
        feat_table = Table(feature_rows, colWidths=[3 * inch, 3 * inch])
        feat_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#eef2ff")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#c7d2fe")),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(feat_table)
    else:
        story.append(Paragraph("No feature data available for this scan.", body_style))

    story.append(Spacer(1, 16))

    # ------------------- Footer -------------------
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#d1d5db")))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "This report was generated automatically by PhishShield - AI-Based Website Phishing Detection System. "
        "The analysis is based on machine learning models and URL feature analysis, and should not be treated "
        "as definitive legal or security advice.",
        small_style,
    ))

    # Build PDF
    doc.build(story)
    return output_path


@router.get("/report/{scan_id}")
def get_report(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate and download a PDF report for a specific scan.
    Users can only access their own scan reports.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    filename = f"phishshield_report_{scan.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    output_path = os.path.join(REPORTS_DIR, filename)

    _generate_pdf(scan, output_path)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=filename,
    )