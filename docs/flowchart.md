# 🔀 Flowchart

![Flowchart Placeholder](screenshots/flowchart.png)

## URL Scanning Flowchart

```
                     ┌──────────────┐
                     │    START     │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ User enters  │
                     │    a URL     │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Validate    │
                     │  URL format  │
                     └──────┬───────┘
                            │
                     ┌──────▼──────┐
                     │ Is URL      │
                     │ valid?      │
                     └──────┬──────┘
                    Yes      │      No
                    ┌────────▼──────┐
                    │  Normalize    │
                    │  the URL      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌───────────────┐
                    │   Extract     │
                    │   Features    │
                    │  (30+ / 60+)  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌───────────────┐
                    │  Load ML      │
                    │  Model        │
                    └──────┬───────┘
                           │
                           ▼
                    ┌───────────────┐
                    │  Predict      │
                    │  Probability  │
                    └──────┬───────┘
                           │
              ┌────────────┼─────────────┐
              │            │             │
        ┌─────▼─────┐ ┌────▼─────┐ ┌─────▼─────┐
        │ prob < 40 │ │ 40-69    │ │ ≥ 70      │
        │   SAFE    │ │SUSPICIOUS│ │PHISHING   │
        └─────┬─────┘ └────┬─────┘ └─────┬─────┘
              │            │             │
              └────────────┼─────────────┘
                           │
                           ▼
                    ┌───────────────┐
                    │ Calculate     │
                    │ Risk Score    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌───────────────┐
                    │ Generate      │
                    │ Problems &    │
                    │ Recommendations│
                    └──────┬───────┘
                           │
                           ▼
                    ┌───────────────┐
                    │  Store in DB  │
                    └──────┬───────┘
                           │
                           ▼
              ┌───────────────────────┐
              │ Display to user with  │
              │ charts & PDF download │
              └──────────┬────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │     END      │
                  └──────────────┘
```

## User Authentication Flowchart

```
 START
   │
   ▼
 User submits credentials
   │
   ▼
 Validate input format ──No──► Show error
   │
  Yes
   ▼
 Check if user exists ──No──► Register new user
   │                            │
  Yes                           ▼
   ▼                    Hash password with bcrypt
 Verify password              │
   │                          ▼
  Match? ──No──► Error    Save to database
   │                        │
  Yes                       ▼
   ▼                     Redirect to login
 Generate JWT token          │
   │                         ▼
   ▼                      START (login flow)
 Return token to client
   │
   ▼
 Store in localStorage
   │
   ▼
 Redirect to dashboard