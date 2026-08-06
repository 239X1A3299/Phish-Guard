# 👤 Use Case Diagram

![Use Case Diagram Placeholder](screenshots/use-case.png)

## Use Case Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │          PhishShield System                 │
                    │                                             │
  ┌─────────┐       │  ┌────────────────────┐  ┌──────────────┐  │
  │         │       │  │  Register          │  │  Login       │  │
  │  User   │◄──────│──│  Account           │  │  (JWT Auth)  │  │
  │         │       │  └────────────────────┘  └──────────────┘  │
  └─────────┘       │  ┌────────────────────┐  ┌──────────────┐  │
       │            │  │  Scan URL          │  │  View Scan   │  │
       │            │  │  (ML Prediction)   │  │  Result      │  │
       │            │  └────────────────────┘  └──────────────┘  │
       │            │  ┌────────────────────┐  ┌──────────────┐  │
       │            │  │  View Dashboard    │  │  View Scan   │  │
       │            │  │  Statistics        │  │  History     │  │
       │            │  └────────────────────┘  └──────────────┘  │
       │            │  ┌────────────────────┐  ┌──────────────┐  │
       │            │  │  Export History    │  │  Download    │  │
       │            │  │  (CSV)             │  │  PDF Report  │  │
       │            │  └────────────────────┘  └──────────────┘  │
       │            │  ┌────────────────────┐                     │
       │            │  │  Toggle Dark Mode  │                     │
       │            │  └────────────────────┘                     │
       │            └─────────────────────────────────────────────┘
       │
       │                 ┌─────────────────────────────────────────┐
       │                 │        Admin (extends User)             │
       │                 │  ┌────────────────┐  ┌───────────────┐  │
       └────────────────▶  │  View System    │  │  Manage       │  │
                           │  Statistics     │  │  Users        │  │
                           └────────────────┘  └───────────────┘  │
                           ┌────────────────┐  ┌───────────────┐  │
                           │  Activate/     │  │  Grant/Revoke │  │
                           │  Deactivate    │  │  Admin Role   │  │
                           └────────────────┘  └───────────────┘  │
                           └─────────────────────────────────────────┘
```

## Actor Descriptions

### User
- Can register and login
- Can scan URLs for phishing detection
- Can view results, history, and dashboard statistics
- Can export history and download PDF reports
- Can manage preferences (dark mode)

### Admin
- All User capabilities
- View system-wide statistics
- Manage all user accounts
- Activate/deactivate users
- Grant/revoke admin privileges

## Use Case Descriptions

| Use Case | Actor | Description | Precondition |
|---------|-------|-------------|--------------|
| Register Account | User | Create a new account | Not logged in |
| Login | User | Authenticate with credentials | Account exists |
| Scan URL | User | Submit URL for ML analysis | Logged in |
| View Result | User | See prediction & features | Scan completed |
| View Dashboard | User | See aggregate statistics | At least 1 scan |
| View History | User | Browse past scans | At least 1 scan |
| Export CSV | User | Download history as CSV | At least 1 scan |
| Download PDF | User | Download security report | Scan exists |
| Manage Users | Admin | View & edit user status | Admin role |
| View System Stats | Admin | See global statistics | Admin role |

## Relationships

### Include:
- **Scan URL** includes *Feature Extraction* and *ML Prediction*
- **View Dashboard** includes *Query Statistics*

### Extend:
- **Admin** extends **User**
- **Download PDF** extends **View Result**
- **Export History** extends **View History**