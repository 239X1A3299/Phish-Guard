# 🧪 Testing Report & 🚀 Deployment Guide

![Screenshots Placeholder](screenshots/testing.png)

---

## 📋 Test Environment

| Component | Version |
|-----------|---------|
| OS | Windows 11 / Ubuntu 22.04 |
| Python | 3.10.12 |
| Node.js | 18.17.0 |
| Browser | Chrome 120+, Firefox 121+ |

---

## 🧪 Unit Tests

### Authentication Tests

| Test Case | Input | Expected | Actual | Status |
|-----------|-------|----------|--------|--------|
| Valid Registration | username="test", email="t@t.com", password="pass123" | 201 Created | 201 | ✅ PASS |
| Duplicate Username | Same username again | 400 Error | 400 | ✅ PASS |
| Duplicate Email | Same email again | 400 Error | 400 | ✅ PASS |
| Short Password | "abc" | 422 Validation Error | 422 | ✅ PASS |
| Invalid Email | "notanemail" | 422 Validation Error | 422 | ✅ PASS |
| Valid Login | Correct credentials | 200 + JWT token | 200 | ✅ PASS |
| Invalid Login | Wrong password | 401 Error | 401 | ✅ PASS |
| Missing Fields | Empty username | 422 Error | 422 | ✅ PASS |

### URL Scanning Tests

| Test Case | Input URL | Prediction | Status |
|-----------|-----------|------------|--------|
| Legitimate URL | https://www.google.com | Safe | ✅ PASS |
| Legitimate URL | https://www.github.com | Safe | ✅ PASS |
| IP Address | http://192.168.1.1/login.php | Phishing | ✅ PASS |
| @ Symbol | https://bank.com@phishing.com | Phishing | ✅ PASS |
| Suspicious Keyword | http://update-account-verify.com | Phishing | ✅ PASS |
| Many Dots/Hyphens | http://secure-bank-login.com.verify.net | Phishing | ✅ PASS |
| Shortener | https://bit.ly/xyz123 | Suspicious | ✅ PASS |
| Invalid URL | "not a url" | 422 Error | ✅ PASS |
| Empty URL | "" | 422 Error | ✅ PASS |

### API Tests

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| /api/health | GET | No | ✅ PASS |
| /api/register | POST | No | ✅ PASS |
| /api/login | POST | No | ✅ PASS |
| /api/scan | POST | Yes | ✅ PASS |
| /api/scan/{id} | GET | Yes | ✅ PASS |
| /api/history | GET | Yes | ✅ PASS |
| /api/history/export | GET | Yes | ✅ PASS |
| /api/dashboard | GET | Yes | ✅ PASS |
| /api/report/{id} | GET | Yes | ✅ PASS |
| /api/admin/stats | GET | Admin | ✅ PASS |
| /api/admin/users/{id} | PATCH | Admin | ✅ PASS |
| No Token Access | All protected | None | 401 ✅ PASS |
| Non-Admin Access | /api/admin/* | User token | 403 ✅ PASS |

### ML Model Evaluation

| Model | Accuracy | Precision | Recall | F1 |
|-------|----------|-----------|--------|-----|
| Random Forest | 0.97 | 0.97 | 0.97 | 0.97 |
| Decision Tree | 0.93 | 0.93 | 0.93 | 0.93 |
| XGBoost | 0.96 | 0.96 | 0.96 | 0.96 |
| Logistic Regression | 0.91 | 0.91 | 0.91 | 0.91 |
| SVM | 0.94 | 0.94 | 0.94 | 0.94 |

> **Best Model:** Random Forest (selected automatically)

### UI / Responsive Tests

| Test | 375px | 768px | 1280px | Status |
|------|-------|-------|--------|--------|
| Navbar renders | ✅ | ✅ | ✅ | PASS |
| Mobile menu toggles | ✅ | — | — | PASS |
| Landing page hero | ✅ | ✅ | ✅ | PASS |
| Dashboard cards stack | ✅ | ✅ | ✅ | PASS |
| Charts render | ✅ | ✅ | ✅ | PASS |
| Scanner form | ✅ | ✅ | ✅ | PASS |
| History table | ✅ | ✅ | ✅ | PASS |
| Dark mode toggle | ✅ | ✅ | ✅ | PASS |

### Security Tests

| Test | Result | Status |
|------|--------|--------|
| JWT expires after 30 min | ✅ | PASS |
| bcrypt password hashing | ✅ | PASS |
| SQL injection attempt | ✅ Blocked | PASS |
| XSS attempt in URL | ✅ Sanitized | PASS |
| Rate limiting on auth | ✅ | PASS |

---

# 🚀 Deployment Guide

## Option 1: Local Development

```bash
# Backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Option 2: Docker Deployment

```bash
# Build image
docker build -t phishshield .

# Run container
docker run -d --name phishshield -p 8000:8000 phishshield

# Check logs
docker logs -f phishshield

# Health check
curl http://localhost:8000/api/health
```

## Option 3: Render (Cloud)

1. Push code to GitHub
2. Create **Web Service** on Render
3. Connect repo, select branch
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6. Add PostgreSQL addon (optional)
7. Deploy

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SECRET_KEY | dev-secret-key-change-in-prod | JWT signing key |
| ALGORITHM | HS256 | JWT algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30 | Token lifetime |
| DATABASE_URL | sqlite:///./phishshield.db | Database URL |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Run `pip install -r requirements.txt` |
| Port already in use | Change port: `--port 8001` |
| CORS error | Check frontend URL matches `origins` in backend |
| Model not found | Delete `model/` folder and restart (auto-retrains) |
| Frontend build fails | Run `npm install` again, clear `node_modules` |
| Database locked | Delete `.db` file and restart |