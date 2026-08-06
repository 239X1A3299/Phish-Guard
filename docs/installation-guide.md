# 🔧 Installation Guide

![Installation Placeholder](screenshots/installation.png)

---

## System Requirements

| Component | Minimum |
|-----------|---------|
| CPU | Dual-core 2.0 GHz |
| RAM | 4 GB |
| Storage | 1 GB free |
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| OS | Windows 10/11, macOS, or Linux |

---

## Step 1: Install Prerequisites

### Python

Download from [python.org](https://python.org) and ensure **"Add to PATH"** is checked during installation.

Verify:
```bash
python --version
# Python 3.10.x or higher
```

### Node.js & npm

Download from [nodejs.org](https://nodejs.org).

Verify:
```bash
node --version
npm --version
```

---

## Step 2: Clone / Extract Project

```bash
# If using Git
git clone https://github.com/yourusername/phishshield.git
cd phishshield

# Or unzip the project folder and open a terminal inside it
```

---

## Step 3: Backend Setup

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate on Windows (PowerShell)
venv\Scripts\Activate.ps1
# or cmd:
venv\Scripts\activate.bat

# Activate on macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Step 4: Frontend Setup

```bash
cd frontend
npm install
cd ..
```

---

## Step 5: Generate Dataset & Train Model

The backend auto-generates the dataset and trains the model on first startup. To do it manually:

```bash
# Generate sample dataset
python -m backend.dataset.generate_dataset

# Train models & save best model
python -m backend.ml.model_training
```

---

## Step 6: Run the Application

### Terminal 1 — Backend

```bash
uvicorn backend.main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in 300 ms
➜  Local:   http://localhost:5173/
```

---

## Step 7: Access the Application

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Frontend application |
| http://localhost:8000/api/docs | Swagger API docs |
| http://localhost:8000/api/health | Health check |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `pip` not found | Reinstall Python with PATH option |
| `npm` not found | Reinstall Node.js |
| Port 8000 busy | Use `--port 8001` |
| Port 5173 busy | Vite auto-picks 5174 |
| Missing packages | `pip install -r requirements.txt` |
| Model file missing | Delete `model/` and restart backend |
| CORS errors | Ensure frontend runs on 5173 |

---

## Next Steps

- See [User Manual](user-manual.md) for usage
- See [Deployment Guide](testing-deployment.md#deployment-guide) for production deploy
- See [Project Report](project-report.md) for academic details