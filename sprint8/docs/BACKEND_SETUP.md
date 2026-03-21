# 🐍 Backend Setup Guide — Sprint 8

The backend is a **Python FastAPI** app that handles:
- Server-side PDF text extraction (PyMuPDF)
- OCR for scanned documents (Tesseract)
- Text chunking (LangChain)
- Local embeddings (sentence-transformers — free, no API)
- Vector storage (Pinecone free tier)
- Background task queue (Celery + Redis)

---

## Prerequisites

- Python 3.11+ → https://python.org/downloads
- Redis (choose one):
  - **Local**: https://github.com/microsoftarchive/redis/releases (Windows)
  - **Free cloud**: https://upstash.com (no install needed)
- Pinecone free account → https://pinecone.io
- Docker Desktop (optional, for running everything together)

---

## Step 1 — Create Pinecone Index

1. Go to **https://pinecone.io** → Sign up free
2. Create a new index:
   - **Name**: `sarkar-sahayak`
   - **Dimensions**: `384`
   - **Metric**: `cosine`
   - **Cloud**: AWS, Region: us-east-1 (free tier)
3. Copy your **API key** from the dashboard

---

## Step 2 — Set up Python environment

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

First install takes ~5 minutes — sentence-transformers pulls PyTorch.

---

## Step 3 — Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard)
- `PINECONE_API_KEY` (from Pinecone dashboard)
- `REDIS_URL` (local or Upstash)

---

## Step 4 — Start Redis

**Option A — Local Redis (Windows):**
```bash
# Download from https://github.com/microsoftarchive/redis/releases
redis-server
```

**Option B — Docker:**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Option C — Upstash (free cloud, no install):**
- Sign up at https://upstash.com
- Create a Redis database (free tier)
- Copy the connection URL to REDIS_URL in .env

---

## Step 5 — Start the backend services

Open **3 separate terminal windows**:

**Terminal 1 — FastAPI server:**
```bash
cd backend
venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Celery worker:**
```bash
cd backend
venv\Scripts\activate  # Windows
celery -A celery_app worker --loglevel=info --queues=documents
```

**Terminal 3 — Your Next.js app (as usual):**
```bash
cd sarkar-sahayak
npm run dev
```

---

## Step 6 — Index all 20 schemes to Pinecone

Run once after setup:

```bash
cd backend
venv\Scripts\activate
python ../scripts/index_schemes.py
```

Takes ~2 minutes. You'll see each scheme indexed with vector count.

---

## Step 7 — Verify everything works

```bash
# Backend health check
curl http://localhost:8000/health/

# Readiness check (checks Redis + Pinecone)
curl http://localhost:8000/health/ready
```

---

## OR: Use Docker Compose (easiest)

```bash
cd backend
cp .env.example .env
# Fill in PINECONE_API_KEY and SUPABASE keys in .env

docker compose up --build
```

This starts Redis, FastAPI, and Celery worker together.

---

## Add backend URL to Next.js .env.local

```
BACKEND_URL=http://localhost:8000
```

---

## Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| Pinecone | 1 index, 100K vectors, 1GB |
| Upstash Redis | 10K commands/day, 256MB |
| sentence-transformers | Unlimited (runs locally) |
| PyMuPDF | Unlimited (runs locally) |
| Tesseract OCR | Unlimited (runs locally) |
