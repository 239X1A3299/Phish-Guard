# 🔐 PhishShield — AI-Based Website Phishing Detection System

A production-ready, full-stack web application that detects phishing websites using Machine Learning. Built for a final-year B.Tech project.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.10+-green)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation Guide](#-installation-guide)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Machine Learning](#-machine-learning)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## ✨ Features

- **Beautiful Landing Page** — Cybersecurity-themed, responsive, animated
- **User Authentication** — Register, Login, JWT, password hashing (bcrypt)
- **Dashboard** — Total scans, safe/phishing/suspicious counts, pie & bar charts, recent activity
- **URL Scanner** — Real-time ML-based phishing detection
- **Security Score (0–100)** — Visual risk gauge
- **Risk Levels** — Safe / Suspicious / Phishing
- **Scan History** — Search, filter, pagination, CSV export
- **Admin Dashboard** — User management, system stats
- **PDF Reports** — Downloadable security reports
- **Dark Mode** — Toggleable theme
- **Responsive Design** — Mobile-first Tailwind CSS
- **Toast Notifications** — Real-time feedback
- **Loading Animations** — Professional UX

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS, Vite, React Router, Recharts |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy, Pydantic |
| **ML** | Scikit-learn, Pandas, NumPy, Joblib, XGBoost |
| **Database** | SQLite |
| **Auth** | JWT (PyJWT), bcrypt |
| **Deployment** | Docker, Render |

---

## 📁 Project Structure

```
phishshield/
├── backend/
│   ├── api/               # FastAPI route handlers
│   │   ├── auth.py        # Register/Login endpoints
│   │   ├── scan.py        # URL scanning & history
│   │   ├── dashboard.py   # Stats & admin endpoints
│   │   ├── report.py      # PDF report generation
│   │   └── schemas.py     # Pydantic models
│   ├── database/
│   │   ├── database.py    # SQLAlchemy setup
│   │   └── models.py      # User & Scan models
│   ├── ml/
│   │   ├── feature_extractor.py  # URL feature extraction
│   │   ├── predictor.py          # ML inference
│   │   └── model_training.py     # Train & evaluate models
│   ├── utils/
│   │   ├── auth.py        # JWT helpers
│   │   └── security.py    # Password hashing
│   ├── dataset/
│   │   └── generate_dataset.py   # Sample dataset generator
│   ├── config.py          # Configuration
│   └── main.py            # FastAPI entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar, Footer, ProtectedRoute
│   │   ├── pages/         # Landing, Login, Register, Dashboard, Scanner, History, Admin
│   │   ├── context/       # Auth & Theme contexts
│   │   ├── services/      # API client
│   │   ├── App.jsx        # Routes
│   │   └── main.jsx       # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── model/                 # Saved ML models
├── dataset/               # Training datasets
├── reports/               # Generated PDF reports
├── docs/                  # Project documentation
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 🚀 Installation Guide

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/phishshield.git
cd phishshield
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run the Application

**Backend (terminal 1):**
```bash
# From project root
uvicorn backend.main:app --reload --port 8000
```

**Frontend (terminal 2):**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

> The backend will automatically train the ML model on first startup if no saved model exists.

---

## 🖥 Usage

1. **Register** a new account
2. **Login** to access the dashboard
3. Go to **Scanner** and enter a URL
4. View the **risk score**, **prediction**, and **feature analysis**
5. Download the **PDF report**
6. View **scan history** with search/filter/export
7. Admin users can manage users from the **Admin Dashboard**

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Register a new user | No |
| POST | `/api/login` | Login & get JWT | No |
| POST | `/api/scan` | Scan a URL | Yes |
| GET | `/api/scan/{id}` | Get a single scan | Yes |
| GET | `/api/history` | Paginated scan history | Yes |
| GET | `/api/history/export` | Export history as CSV | Yes |
| GET | `/api/dashboard` | Dashboard statistics | Yes |
| GET | `/api/report/{id}` | Download PDF report | Yes |
| GET | `/api/admin/stats` | Admin statistics | Admin |
| PATCH | `/api/admin/users/{id}` | Update user status | Admin |
| GET | `/api/health` | Health check | No |

Interactive API docs available at **http://localhost:8000/api/docs**

---

## 🤖 Machine Learning

The system trains and compares **5 models**:

1. **Random Forest**
2. **Decision Tree**
3. **XGBoost**
4. **Logistic Regression**
5. **SVM**

Metrics displayed: **Accuracy, Precision, Recall, F1 Score, Confusion Matrix**

The **best-performing model** is automatically saved to `model/` and used for predictions.

### URL Features Extracted (30+)

- URL length, dots, hyphens, slashes, digits, special chars
- HTTPS usage, IP address, @ symbol, hyphen
- Subdomain count, suspicious keywords
- Suspicious TLD, URL shortener
- Domain age, DNS record, SSL certificate, WHOIS
- Path length, query params, hex/encoded chars
- TLD length, domain length, underscores, percent, ampersands, etc.

---

## 🐳 Deployment

### Docker

```bash
# Build
docker build -t phishshield .

# Run
docker run -p 8000:8000 phishshield
```

### Render

1. Push the repo to GitHub
2. Create a new **Web Service** on Render
3. Connect the repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6. Deploy!

---

## 📚 Documentation

Full documentation is in the [`docs/`](docs/) folder:

- [Architecture Diagram](docs/architecture.md)
- [ER Diagram](docs/er-diagram.md)
- [DFD](docs/dfd.md)
- [Flowchart](docs/flowchart.md)
- [Use Case Diagram](docs/use-case.md)
- [Sequence Diagram](docs/sequence.md)
- [Class Diagram](docs/class-diagram.md)
- [Testing Report](docs/testing.md)
- [Deployment Guide](docs/deployment.md)
- [User Manual](docs/user-manual.md)
- [Project Report](docs/project-report.md)
- [Presentation](docs/presentation.md)

---

## 📸 Screenshots

> Add screenshots here:
> - `docs/screenshots/landing.png`
> - `docs/screenshots/dashboard.png`
> - `docs/screenshots/scanner.png`
> - `docs/screenshots/history.png`

---

## 📝 License

MIT License — free to use for academic and educational purposes.

---

## 👨‍💻 Author

**Your Name** — Final Year B.Tech Student# Phish-Guard
