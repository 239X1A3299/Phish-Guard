# 🏗️ System Architecture

![Architecture Diagram Placeholder](screenshots/architecture.png)

## Overview

PhishShield follows a **3-tier client-server architecture**:

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Presentation      │     │      Application     │     │        Data         │
│       Layer         │     │         Layer        │     │        Layer        │
├─────────────────────┤     ├──────────────────────┤     ├─────────────────────┤
│ React SPA           │◄───►│  FastAPI Backend     │◄───►│  SQLite Database    │
│ • Landing Page      │ HTTP│  • Auth (JWT)        │ SQL │  • Users Table      │
│ • Dashboard         │/JSON│  • URL Scanner       │     │  • Scans Table      │
│ • Scanner           │     │  • ML Predictor      │     │                     │
│ • History           │     │  • Report Generator  │     │  Model Files (.joblib)
│ • Admin Panel       │     │  • Admin API         │     │  • Random Forest    │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                    │
                                    ▼
                          ┌────────────────────┐
                          │   Machine Learning  │
                          │      Pipeline       │
                          │ • Feature Extractor │
                          │ • Model Training    │
                          │ • Prediction Engine │
                          └────────────────────┘
```

## Component Descriptions

### 1. Frontend (React SPA)
- Built with React 18 + Vite + Tailwind CSS
- Uses React Router for client-side routing
- Communicates with backend via REST API (Axios)
- JWT tokens stored in localStorage
- Context API for auth state and theme management

### 2. Backend (FastAPI)
- RESTful API with automatic OpenAPI/Swagger docs
- SQLAlchemy ORM for database operations
- JWT-based authentication middleware
- Pydantic schemas for request/response validation
- CORS middleware for cross-origin requests

### 3. Machine Learning Engine
- **Feature Extractor**: Parses URLs and extracts 30+ features
- **Model Trainer**: Trains 5 models and evaluates with metrics
- **Predictor**: Loads best model and runs inference on new URLs
- Models persisted as `.joblib` files

### 4. Database (SQLite)
- Users table: id, username, email, hashed_password, flags, timestamps
- Scans table: id, user_id (FK), url, prediction, confidence, risk_score, features JSON, timestamps

## Data Flow

1. **Scan Flow**: User submits URL → Feature Extractor extracts features → ML model predicts → Result stored in DB → Response returned to frontend
2. **Auth Flow**: User registers/logs in → JWT issued → Token attached to subsequent requests → Protected routes validated
3. **Report Flow**: User requests report → Backend fetches scan data → PDF generated → File downloaded

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Docker Container               │
│  ┌──────────────┐    ┌──────────────────┐  │
│  │  Nginx/Static │    │   Uvicorn (ASGI)│  │
│  │  Frontend     │    │   FastAPI App   │  │
│  └──────────────┘    └──────────────────┘  │
│            ┌────────────────────┐          │
│            │   SQLite Database  │          │
│            └────────────────────┘          │
└─────────────────────────────────────────────┘