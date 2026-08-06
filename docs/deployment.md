# 🚀 Deployment Guide

| Method | Difficulty | Best For |
|--------|-----------|----------|
| Local | Easy | Development |
| Docker | Medium | Production consistency |
| Render | Easy | Free cloud hosting |

---

## Method 1: Local Deployment

```bash
# Backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run build
npx serve dist
```

---

## Method 2: Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose (optional)

### Option A: Dockerfile only

```bash
docker build -t phishshield .
docker run -d -p 8000:8000 --name phishshield phishshield
```

### Option B: Docker Compose

```bash
docker-compose up --build -d
docker-compose logs -f
```

### Verify

```bash
curl http://localhost:8000/api/health
# {"status":"ok"}
```

---

## Method 3: Render Cloud Deployment

### Steps

1. **Push code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/phishshield.git
git push -u origin main
```

2. **Create Web Service on Render**

   - Go to [render.com](https://render.com) → New → Web Service
   - Connect GitHub repo
   - Configure:

| Setting | Value |
|---------|-------|
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| Python Version | 3.11 |

3. **Add Environment Variables**

| Key | Value |
|-----|-------|
| SECRET_KEY | `<random secure string>` |
| FRONTEND_URL | `https://your-app.onrender.com` |

4. **Deploy** — Render auto-builds on push

---

## Method 4: Cloud Deployment (Other Options)

### AWS EC2

```bash
# SSH into instance
sudo apt update && sudo apt install -y python3 python3-pip docker.io
git clone https://github.com/yourusername/phishshield.git
cd phishshield
docker build -t phishshield .
docker run -d -p 80:8000 phishshield
```

### Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/phishshield
gcloud run deploy phishshield --image gcr.io/$GOOGLE_CLOUD_PROJECT/phishshield --platform managed --allow-unauthenticated
```

### Heroku (legacy)

```bash
heroku create phishshield
heroku config:set SECRET_KEY="your-secret"
git push heroku main
```

---

## Production Considerations

### Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=false` in config
- [ ] Use HTTPS in frontend API calls
- [ ] Add database backup strategy
- [ ] Monitor logs
- [ ] Set up rate limiting

### Performance Tips

- Use **Gunicorn** with multiple workers:
  ```bash
  gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
  ```
- Add **Redis** caching for dashboard queries
- Use PostgreSQL instead of SQLite for high concurrency

---

## Rollback Strategy

```bash
# Docker rollback
docker rollback phishshield
# or
docker-compose down
git checkout <previous-commit>
docker-compose up --build -d
```

---

## Monitoring

```bash
# Check health
curl http://localhost:8000/api/health

# View logs (Docker)
docker logs --tail 100 phishshield

# View logs (Render)
render logs your-service