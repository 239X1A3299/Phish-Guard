# 🏛️ Class Diagram

![Class Diagram Placeholder](screenshots/class-diagram.png)

## Backend Classes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND CLASSES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │         User (Model)         │    │          Scan (Model)            │  │
│  ├──────────────────────────────┤    ├──────────────────────────────────┤  │
│  │ - id: int                    │    │ - id: int                       │  │
│  │ - username: str              │    │ - user_id: int (FK)             │  │
│  │ - email: str                 │    │ - url: str                      │  │
│  │ - hashed_password: str       │    │ - prediction: str               │  │
│  │ - is_active: bool            │    │ - confidence: float             │  │
│  │ - is_admin: bool             │    │ - risk_score: int               │  │
│  │ - created_at: datetime       │    │ - detected_problems: str        │  │
│  │ - updated_at: datetime       │    │ - recommendations: str          │  │
│  ├──────────────────────────────┤    │ - features: JSON                │  │
│  │ + verify_password()          │    │ - created_at: datetime          │  │
│  │ + to_dict()                  │    ├──────────────────────────────────┤  │
│  └──────────────────────────────┘    │ + to_result() -> ScanResult     │  │
│                                      └──────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │    FeatureExtractor          │    │         Predictor                │  │
│  ├──────────────────────────────┤    ├──────────────────────────────────┤  │
│  │ - FEATURE_NAMES: list        │    │ - model: object                 │  │
│  │ - extract(url) -> dict       │    │ - feature_names: list           │  │
│  │ - _extract_*() methods       │    │ - load_model()                  │  │
│  └──────────────────────────────┘    │ - predict(url) -> dict          │  │
│                                      └──────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │      AuthService             │    │      ReportGenerator             │  │
│  ├──────────────────────────────┤    ├──────────────────────────────────┤  │
│  │ + create_access_token()      │    │ + generate_pdf(scan, path)       │  │
│  │ + verify_token()             │    │ - _build_styles()                │  │
│  │ + get_current_user()         │    │ - _build_tables()                │  │
│  └──────────────────────────────┘    └──────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │      Database                 │    │      Security                    │  │
│  ├──────────────────────────────┤    ├──────────────────────────────────┤  │
│  │ + get_db() -> Session        │    │ + hash_password()                │  │
│  │ + init_db()                  │    │ + verify_password()              │  │
│  └──────────────────────────────┘    └──────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Frontend Classes (React Components)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REACT COMPONENTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │         App                  │    │         Navbar                   │  │
│  ├──────────────────────────────┤    ├──────────────────────────────────┤  │
│  │ - routes: Route[]            │    │ - isAuthenticated: bool          │  │
│  │ + render()                   │    │ - isDark: bool                   │  │
│  └──────────────────────────────┘    │ + toggleTheme()                  │  │
│                                      │ + handleLogout()                 │  │
│                                      └──────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │      AuthContext             │    │      ThemeContext                │  │
│  ├──────────────────────────────┤    ├──────────────────────────────────┤  │
│  │ - user: object               │    │ - isDark: bool                   │  │
│  │ - token: string              │    │ + toggle()                       │  │
│  │ + login()                    │    └──────────────────────────────────┘  │
│  │ + register()                 │                                          │
│  │ + logout()                   │    ┌──────────────────────────────────┐  │
│  └──────────────────────────────┘    │      ProtectedRoute              │  │
│                                      ├──────────────────────────────────┤  │
│  ┌──────────────────────────────┐    │ - requireAdmin: bool             │  │
│  │      ScannerPage             │    │ + render()                       │  │
│  ├──────────────────────────────┤    └──────────────────────────────────┘  │
│  │ - url: string                │                                          │
│  │ - result: object             │    ┌──────────────────────────────────┐  │
│  │ - scanning: bool             │    │      DashboardPage               │  │
│  │ + handleSubmit()             │    ├──────────────────────────────────┤  │
│  │ + handleDownloadPdf()        │    │ - stats: object                  │  │
│  └──────────────────────────────┘    │ + fetchStats()                   │  │
│                                      └──────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │      HistoryPage              │    │      AdminPage                  │  │
│  ├──────────────────────────────┤    ├──────────────────────────────────┤  │
│  │ - scans: array                │    │ - stats: object                 │  │
│  │ - page: int                   │    │ + toggleUserActive()            │  │
│  │ + fetchHistory()              │    │ + toggleUserAdmin()             │  │
│  │ + exportCSV()                 │    └──────────────────────────────────┘  │
│  └──────────────────────────────┘                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Relationships

| Class | Relationship | Description |
|-------|-------------|-------------|
| User → Scan | 1 → N | One user has many scans |
| Scan → ScanResult | 1 → 1 | Each scan maps to a result schema |
| Predictor → FeatureExtractor | Uses | Predictor uses extractor for features |
| AuthService → User | Uses | Auth validates against User model |
| ReportGenerator → Scan | Uses | Generates PDF from scan data |
| App → All Pages | Composes | App renders all page components |
| AuthContext → All Pages | Provides | Provides auth state to all pages |