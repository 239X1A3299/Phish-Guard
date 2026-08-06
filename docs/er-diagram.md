# 📊 ER Diagram

![ER Diagram Placeholder](screenshots/er-diagram.png)

## Entity Relationship Diagram

```
┌───────────────────────┐        ┌───────────────────────────┐
│        USERS          │        │          SCANS            │
├───────────────────────┤        ├───────────────────────────┤
│ PK │ id (INT)         │        │ PK │ id (INT)             │
│    │ username (VARCHAR)│        │ FK │ user_id (INT)        │
│    │ email (VARCHAR)  │───────►│    │ url (VARCHAR)         │
│    │ hashed_password  │  1   N │    │ prediction (VARCHAR)  │
│    │ is_active (BOOL) │        │    │ confidence (FLOAT)    │
│    │ is_admin (BOOL)  │        │    │ risk_score (INT)      │
│    │ created_at (DATETIME)     │    │ detected_problems     │
│    │ updated_at (DATETIME)     │    │ recommendations       │
└───────────────────────┘        │    │ features (JSON)       │
                                 │    │ created_at (DATETIME) │
                                 └───────────────────────────┘
```

## Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| Users → Scans | One-to-Many | A user can have many scans; each scan belongs to exactly one user |

## Table Definitions

### USERS Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | User's display name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| hashed_password | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| is_active | BOOLEAN | NOT NULL, DEFAULT True | Whether the account is active |
| is_admin | BOOLEAN | NOT NULL, DEFAULT False | Whether the user is an admin |
| created_at | DATETIME | NOT NULL | Registration timestamp |
| updated_at | DATETIME | NOT NULL | Last update timestamp |

### SCANS Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique scan ID |
| user_id | INTEGER | FOREIGN KEY → USERS.id | Owner of the scan |
| url | VARCHAR(2048) | NOT NULL | URL that was analyzed |
| prediction | VARCHAR(20) | NOT NULL | Safe / Suspicious / Phishing |
| confidence | FLOAT | NOT NULL | Model confidence (0–1) |
| risk_score | INTEGER | NOT NULL | Security score (0–100) |
| detected_problems | TEXT | NULL | Pipe-separated problem list |
| recommendations | TEXT | NULL | Pipe-separated recommendations |
| features | JSON | NULL | Extracted feature dictionary |
| created_at | DATETIME | NOT NULL | Scan timestamp |

## Sample Queries

```sql
-- All scans for a user
SELECT * FROM scans WHERE user_id = 1 ORDER BY created_at DESC;

-- Count phishing scans
SELECT COUNT(*) FROM scans WHERE prediction = 'Phishing';

-- Most active users
SELECT u.username, COUNT(s.id) as scan_count
FROM users u
LEFT JOIN scans s ON s.user_id = u.id
GROUP BY u.id
ORDER BY scan_count DESC;

-- Daily scan counts
SELECT DATE(created_at) as day, COUNT(*) as count
FROM scans
GROUP BY DATE(created_at);
```

## Design Decisions

1. **SQLite** chosen for simplicity — zero-config, file-based, ideal for academic projects
2. **JSON column** for features allows flexible storage without schema migration
3. **Pipe-separated strings** for problems/recommendations simplify storage and retrieval
4. **Indexed foreign keys** for efficient user-scans joins