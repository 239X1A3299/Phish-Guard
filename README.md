# PhishGuard AI

AI-powered phishing website detection. Combines machine learning with rule-based heuristics to produce a transparent, evidence-based risk score for any URL.

---

## Architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────────┐
│  React Frontend │ ────────────► │  FastAPI Backend      │
│  (Vite + TW)    │               │  - URL scanning       │
└─────────────────┘               │  - ML inference       │
                                  │  - Risk scoring       │
┌─────────────────┐               │  - PDF reports        │
│ Chrome Extension│ ────────────► │  - Auth (JWT)         │
│  (MV3)          │               └──────────┬───────────┘
└─────────────────┘                          │
                                  ┌──────────▼───────────┐
                                  │  SQLite / PostgreSQL  │
                                  └──────────────────────┘
```

**Risk Score Formula:** `0.70 × model_probability × 100 + 0.30 × heuristic_score`

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React 18, Vite, Tailwind CSS, Chart.js |
| Backend    | Python 3.11+, FastAPI, SQLAlchemy |
| ML         | scikit-learn, XGBoost, joblib |
| Database   | SQLite (dev) / PostgreSQL (prod) |
| Auth       | JWT (python-jose), bcrypt |
| PDF        | ReportLab |
| Extension  | Chrome MV3 (JS) |
| Deploy     | Docker, Docker Compose, Nginx |

---

## Quick Start (Local Dev)

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone & configure
```bash
git clone <repo-url>
cd sample
cp .env.example .env
# Edit .env — set SECRET_KEY to a random string
```

### 2. Backend setup
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Generate dataset & train model
```bash
python -m backend.dataset.generate_dataset
python -m backend.ml.model_training
```
This creates `dataset/url_dataset.csv` and `model/best_model.pkl`.

> **Note:** The model trains on synthetic URL data. It captures structural phishing patterns but has artificially high accuracy on the synthetic test set. The heuristic scoring engine provides meaningful real-world signals.

### 4. Start backend
```bash
uvicorn backend.main:app --reload
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/api/docs
```

### 5. Frontend setup
```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

---

## Docker Deployment

```bash
cp .env.example .env
# Edit .env with production values

docker-compose up --build -d
# Frontend at http://localhost:80
# Backend at http://localhost:8000
```

---

## Browser Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder
4. Click the PhishGuard AI icon in your toolbar
5. Go to **Settings** → paste your JWT token from the web app

The extension works with Microsoft Edge too (same steps).

---

## Running Tests

```bash
# Delete stale test DB first (important!)
del test_phishguard.db 2>nul

python -m pytest backend/tests/ -v
```

Expected: **105 tests pass**.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/health` | — | Health check |
| GET  | `/api/ready`  | — | Model readiness |
| POST | `/api/register` | — | Register user |
| POST | `/api/login` | — | Login, get JWT |
| GET  | `/api/me` | ✓ | Current user |
| POST | `/api/scan` | ✓ | Scan a URL |
| GET  | `/api/scan/{id}` | ✓ | Get scan result |
| GET  | `/api/history` | ✓ | Paginated scan history |
| GET  | `/api/history/export` | ✓ | CSV export |
| GET  | `/api/report/{scan_id}` | ✓ | Download PDF report |
| GET  | `/api/dashboard` | ✓ | Dashboard statistics |
| GET  | `/api/model/info` | — | Model metadata |
| GET  | `/api/model/evaluation` | — | Evaluation report |
| POST | `/api/reports` | ✓ | Submit phishing report |
| GET  | `/api/reports` | ✓ | List reports |
| GET  | `/api/reports/{id}` | ✓ | Get report detail |
| PATCH| `/api/reports/{id}/status` | Admin | Update report status |
| POST | `/api/feedback` | ✓ | Submit scan feedback |
| GET  | `/api/admin/stats` | Admin | Admin statistics |
| PATCH| `/api/admin/users/{id}` | Admin | Manage users |

Full interactive docs: `http://localhost:8000/api/docs`

---

## Risk Score Bands

| Score | Category | Classification |
|-------|----------|---------------|
| 0–24  | Low Risk | Likely Safe |
| 25–49 | Moderate Risk | Suspicious |
| 50–74 | High Risk | Likely Phishing |
| 75–100| Critical Risk | Likely Phishing |

A low score **does not guarantee** a site is safe.

---

## ML Model

- **Algorithm:** Logistic Regression / Random Forest / Gradient Boosting (best selected by CV F1)
- **Features:** 34 offline lexical/structural URL features
- **Training data:** Synthetic URL dataset (5,000 samples, balanced)
- **Evaluation:** 20% held-out test set, never used for selection
- **Known limitation:** Trained on synthetic data — accuracy metrics reflect synthetic patterns, not real-world prevalence. The heuristic component adds real-world signal.

To retrain with new data:
```bash
python -m backend.dataset.generate_dataset  # or replace with real dataset
python -m backend.ml.model_training
```

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire after 24 hours
- All protected endpoints require `Authorization: Bearer <token>`
- Admin endpoints require `is_admin=True`
- Rate limiting: implement via Nginx or a FastAPI middleware in production
- CORS: restrict `CORS_ORIGINS` in `.env` for production
- SSRF: URL scanning does not fetch page content — only DNS/SSL/WHOIS metadata
- Never commit `.env` — use `.env.example` as a template

---

## Project Structure

```
sample/
├── backend/
│   ├── api/           # FastAPI routers (auth, scan, dashboard, report)
│   ├── database/      # SQLAlchemy models + session
│   ├── ml/            # Feature extractor, predictor, training pipeline
│   ├── utils/         # Security (bcrypt + JWT)
│   ├── tests/         # Pytest test suite (105 tests)
│   ├── config.py      # Central configuration
│   └── main.py        # App entry point
├── frontend/
│   ├── src/
│   │   ├── pages/     # React pages (Scanner, Dashboard, History, etc.)
│   │   ├── components/# Navbar, Footer, ProtectedRoute
│   │   ├── context/   # AuthContext, ThemeContext
│   │   └── services/  # axios API client
│   └── Dockerfile.frontend
├── extension/         # Chrome MV3 browser extension
│   ├── manifest.json
│   ├── popup.html / popup.js
│   ├── background.js
│   ├── content.js
│   └── icons/
├── model/             # Trained model artifact + metrics
├── dataset/           # URL dataset CSV
├── reports/           # Generated PDF reports
├── docker-compose.yml
├── Dockerfile.backend
├── requirements.txt
├── .env.example
└── README.md
```

---

## Known Limitations

1. ML model trained on synthetic data — not validated on real-world phishing URLs
2. WHOIS lookups can be slow or blocked — results marked "unavailable" when they fail
3. No real-time threat intelligence feed (Google Safe Browsing key not configured)
4. External phishing reporting (PhishTank, Netcraft) requires manual submission via provided links
5. Browser extension auto-scan may slow page loads — disabled by default
6. Production deployment requires HTTPS and proper SECRET_KEY rotation

---

## License

MIT
