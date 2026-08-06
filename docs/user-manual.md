# 📖 User Manual

![User Manual Placeholder](screenshots/user-manual.png)

---

## 1. Getting Started

### Registration

1. Open the application in your browser
2. Click **"Get Started"** or navigate to **Register**
3. Fill in the registration form:
   - **Username** — 3-50 characters
   - **Email** — valid email address
   - **Password** — minimum 8 characters
   - **Confirm Password** — must match
4. Click **Register**
5. You'll be redirected to the login page

### Login

1. Enter your username and password
2. Click **Login**
3. You'll be redirected to your **Dashboard**

---

## 2. Dashboard

The dashboard provides an overview of all your scanning activity:

- **Total Scans** — total URLs analyzed
- **Safe URLs** — legitimate websites detected
- **Phishing URLs** — malicious websites detected
- **Suspicious URLs** — borderline cases
- **Pie Chart** — risk distribution visualization
- **Bar Chart** — weekly scan trends
- **Recent Activity** — latest scan results

---

## 3. Scanning a URL

1. Click **Scanner** in the navigation bar
2. Enter a URL in the input field
   - Examples: `https://www.google.com`, `http://192.168.1.1/login.php`
3. Click **"Scan URL"**
4. Wait for the ML model to analyze (1-3 seconds)
5. View the results page with:
   - **Prediction** — Safe / Suspicious / Phishing
   - **Confidence** — model certainty percentage
   - **Risk Score** — 0-100 security score
   - **Detected Problems** — flagged issues
   - **Recommendations** — security advice
   - **Feature Values** — extracted URL features

---

## 4. Viewing Scan History

1. Click **History** in the navigation bar
2. All your past scans are displayed in a table
3. Use the **search box** to find specific URLs
4. Use the **filter dropdown** to filter by prediction type
5. Click **Export CSV** to download all history
6. Use **pagination** at the bottom to navigate pages

### Understanding History Columns

| Column | Description |
|--------|-------------|
| URL | The scanned website address |
| Prediction | Safe / Suspicious / Phishing |
| Confidence | Model confidence (%) |
| Risk Score | Security score (0-100) |
| Date | When the scan was performed |
| Actions | View details / Download PDF |

---

## 5. Downloading PDF Reports

1. From a **scan result page**, click **"Download PDF Report"**
2. The PDF will be saved to your downloads folder
3. The report includes:
   - URL analyzed
   - Prediction and confidence
   - Risk score
   - Date of analysis
   - Feature analysis table
   - Security recommendations

---

## 6. Dark Mode

1. Click the **moon/sun icon** in the top navigation bar
2. The entire interface will toggle between light and dark themes
3. Your preference is saved for future visits

---

## 7. Admin Panel

> **Requires admin privileges**

1. Navigate to **Admin Dashboard**
2. View system-wide statistics:
   - Total users
   - Total scans
   - Scans today
   - Classification distribution
3. Manage users:
   - **Activate/Deactivate** — enable/disable accounts
   - **Make Admin/Remove Admin** — grant/revoke admin roles

---

## 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Check caps lock and verify credentials |
| Scan takes long | Model may be retraining — wait and retry |
| PDF won't download | Check browser pop-up blocker |
| Charts not showing | Refresh the page |
| Dark mode reset | Allow browser localStorage |
| 401 error | Session expired — login again |

---

## 9. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter (on scanner) | Submit URL |
| Esc (on forms) | Clear input |
| Ctrl/Cmd + D | Dark mode toggle |