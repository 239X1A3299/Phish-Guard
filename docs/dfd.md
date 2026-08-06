# 🔄 Data Flow Diagram (DFD)

![DFD Placeholder](screenshots/dfd.png)

## Level 0 — Context Diagram

```
                    ┌─────────────────────────────┐
                    │   PhishShield System        │
   ┌───────┐        │                             │        ┌──────────┐
   │ User  │───────►│   AI-Based Phishing         │───────►│ Database │
   │       │        │   Detection System          │        └──────────┘
   └───────┘◄───────│                             │
        │           └─────────────────────────────┘
        │                        │
        │                        ▼
        │           ┌─────────────────────────┐
        │           │    ML Model Pipeline    │
        │           └─────────────────────────┘
```

## Level 1 — Main Processes

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PhishShield System                          │
│                                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌────────┐  │
│  │ 1.0         │   │ 2.0         │   │ 3.0         │   │ 4.0    │  │
│  │ User Auth   │──►│ URL Scanner │──►│ ML Engine   │──►│ Report │  │
│  │             │   │             │   │             │   │ Gen    │  │
│  └─────┬───────┘   └──────┬──────┘   └──────┬──────┘   └────────┘  │
│        │                  │                │         │              │
│        ▼                  ▼                ▼         ▼              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    D1: SQLite Database                       │   │
│  │  Users Table  |  Scans Table  |  Features (JSON)            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              D2: ML Models (.joblib files)                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Level 2 — Detailed Process Flows

### Process 1.0: User Authentication

```
User Input ──► Validate (Pydantic) ──► Hash Password (bcrypt)
     │                                        │
     ▼                                        ▼
JWT Token ◄─── Verify Credentials ◄─── Store in Users Table
```

### Process 2.0: URL Scanner

```
User URL ──► Validate Format ──► Add Scheme if missing
     │
     ▼
Normalize URL ──► Pass to Feature Extractor
```

### Process 3.0: ML Engine

```
Raw URL ──► Feature Extraction (30+ features)
     │
     ▼
Feature Vector ──► Load Best Model ──► Predict Probability
     │
     ├──► Safe (probability < 0.4)
     ├──► Suspicious (0.4 ≤ probability < 0.7)
     └──► Phishing (probability ≥ 0.7)
     │
     ▼
Calculate Risk Score (0-100) ──► Generate Problems & Recommendations
```

### Process 4.0: Report Generation

```
Scan Result ──► Fetch from DB ──► Build PDF (ReportLab)
     │
     ▼
Save to reports/ ──► Stream to browser as download
```

## Data Dictionary

| Data Store | Description |
|-----------|-------------|
| D1 — Users | Registration data, credentials, roles |
| D2 — Scans | URL scan results, predictions, features |
| D3 — Models | Trained ML model files (Random Forest, etc.) |
| D4 — Reports | Generated PDF security reports |

## External Entities

| Entity | Description |
|--------|-------------|
| User | End user interacting with the system |
| Admin | Privileged user managing system |
| ML Pipeline | Internal ML training/inference components |

## Data Flow Descriptions

| Flow | Source → Destination | Data |
|------|---------------------|------|
| Register | User → 1.0 | username, email, password |
| Login | User → 1.0 | username, password |
| Scan URL | User → 2.0 | URL string |
| Features | 2.0 → 3.0 | Extracted feature vector |
| Prediction | 3.0 → 4.0 | label, confidence, risk score |
| Save Scan | 3.0 → D2 | Complete scan record |
| Report | 4.0 → User | PDF file |