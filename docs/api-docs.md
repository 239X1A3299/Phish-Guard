# 🔌 API Documentation

Base URL: `http://localhost:8000/api`
Interactive Docs: `http://localhost:8000/api/docs` (Swagger UI)

---

## Authentication

All protected endpoints require header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### POST /register
Create a new user account.

```json
// Request
{
  "username": "john",
  "email": "john@example.com",
  "password": "secure123"
}

// Response: 201 Created
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "role": "user"
}
```

| Field | Type | Rules |
|-------|------|-------|
| username | string | 3-50 chars, unique |
| email | string | valid email, unique |
| password | string | min 8 chars |

---

### POST /login
Authenticate and receive JWT.

```json
// Request
{
  "username": "john",
  "password": "secure123"
}

// Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### POST /scan
Analyze a URL for phishing.

```json
// Request (protected)
{
  "url": "http://192.168.1.1/login.php"
}

// Response: 200 OK
{
  "id": 42,
  "url": "http://192.168.1.1/login.php",
  "prediction": "phishing",
  "confidence": 0.96,
  "risk_score": 8,
  "risk_level": "High",
  "problems": ["URL uses IP address instead of domain name"],
  "recommendations": ["Do not enter personal information"],
  "features": { "url_length": 27, "contains_ip": 1, "uses_https": 0 },
  "created_at": "2026-08-03T18:30:00"
}
```

| Prediction | Meaning |
|------------|---------|
| safe | Legitimate website |
| suspicious | Possible risk, verify carefully |
| phishing | Malicious website |

---

### GET /scan/{id}
Get details of a specific scan.

```json
// Response: 200 OK
{
  "id": 42,
  "url": "http://192.168.1.1/login.php",
  "prediction": "phishing",
  "confidence": 0.96,
  "risk_score": 8,
  "problems": ["..."],
  "recommendations": ["..."],
  "features": {...},
  "created_at": "..."
}
```

---

### GET /history
Get paginated scan history.

```
Query params:
?page=1&page_size=10&search=google&prediction=phishing
```

```json
// Response
{
  "items": [ { "id": 42, "url": "...", "prediction": "phishing", "confidence": 0.96, "risk_score": 8, "created_at": "..." } ],
  "total": 100,
  "page": 1,
  "page_size": 10,
  "pages": 10
}
```

| Param | Type | Description |
|-------|------|-------------|
| page | int | Page number (default 1) |
| page_size | int | Items per page (default 10, max 100) |
| search | string | Search URLs |
| prediction | string | safe / suspicious / phishing |

---

### GET /history/export
Download scan history as CSV.

```
GET /api/history/export
Response: text/csv attachment
```

---

### GET /dashboard
Get dashboard statistics.

```json
// Response: 200 OK
{
  "total_scans": 100,
  "safe_count": 40,
  "phishing_count": 35,
  "suspicious_count": 25,
  "risk_distribution": { "safe": 40, "suspicious": 25, "phishing": 35 },
  "recent_scans": [ { "id": 42, "url": "...", "prediction": "...", "created_at": "..." } ]
}
```

---

### GET /report/{id}
Download scan report as PDF.

```
GET /api/report/42
Response: application/pdf attachment
```

---

### GET /admin/stats
Get system-wide statistics (admin only).

```json
{
  "total_users": 15,
  "active_users": 12,
  "total_scans": 100,
  "scans_today": 8,
  "safe_percent": 40,
  "phishing_percent": 35,
  "suspicious_percent": 25
}
```

---

### PATCH /admin/users/{id}
Update user role/status (admin only).

```json
// Request
{
  "is_active": false,
  "role": "admin"
}
```

---

## Error Responses

| Code | Body |
|------|------|
| 400 | `{"detail": "Username already exists"}` |
| 401 | `{"detail": "Could not validate credentials"}` |
| 403 | `{"detail": "Not authorized"}` |
| 404 | `{"detail": "Scan not found"}` |
| 422 | `{"detail": "...validation errors..."}` |

---

## Rate Limits

- Auth endpoints: 20 requests/minute
- Scan endpoint: 60 requests/minute
- History endpoints: 120 requests/minute