# 🏛️ Sarkar Sahayak — Government Policy Navigator

> AI-powered platform that helps Indian citizens check eligibility for government schemes in plain language.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Database-darkgreen?logo=supabase)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📖 What is Sarkar Sahayak?

Sarkar Sahayak ("Government Helper") is a full-stack AI platform where citizens can:

- **Browse** 20+ Indian government schemes (PM Awas, Ayushman Bharat, PM Kisan, etc.)
- **Upload** policy PDFs and have them parsed instantly in the browser
- **Chat** with a local AI model to check their eligibility in simple language
- **Get** a structured eligibility report with documents needed and application steps
- **Save** their chat history and export results as PDF (requires sign in)

Built entirely with free and open-source tools — no paid AI API required.

---

## 🖥️ Screenshots

| Home | Schemes | Chat | Results |
|------|---------|------|---------|
| Landing page with How It Works | Browse all 20 schemes | AI eligibility chat | Full eligibility report |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js Frontend                       │
│  Landing · Schemes · Upload · Chat · Results · History  │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
┌─────────▼──────────┐ ┌───────▼────────────┐
│   Next.js API      │ │   FastAPI Backend   │
│   /api/chat        │ │   Port 8000         │
│   /api/auth        │ │   + Celery Worker   │
│   /api/session     │ └───────┬────────────┘
└─────────┬──────────┘         │
          │              ┌─────┴──────┐
          │              │   Redis    │
          │              │  (Broker)  │
          │              └────────────┘
    ┌─────┴──────────────────────────────┐
    │                                    │
┌───▼────┐  ┌──────────┐  ┌───────────┐ │
│ Ollama │  │ Supabase │  │ Pinecone  │ │
│ Local  │  │ Postgres │  │ Vectors   │ │
│ AI LLM │  │ + Auth   │  │ RAG Index │ │
└────────┘  └──────────┘  └───────────┘
```

---

## ⚡ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | App framework (App Router) |
| TypeScript | 5.4 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Zustand | 4.5 | State management |
| PDF.js | 4.2 | Client-side PDF parsing |
| Mammoth.js | 1.8 | DOCX parsing |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.111 | REST API |
| Celery | 5.4 | Background task queue |
| Redis | 7 | Message broker |
| PyMuPDF | 1.24 | Server-side PDF extraction |
| Tesseract | 5 | OCR for scanned PDFs |
| sentence-transformers | 3.0 | Local embeddings (free) |

### Infrastructure
| Service | Free Tier | Purpose |
|---------|-----------|---------|
| Supabase | ✅ 500MB | Database + Auth (OTP) |
| Pinecone | ✅ 100K vectors | Vector search (RAG) |
| Ollama | ✅ Local | AI model runner |
| Vercel | ✅ Hobby | Frontend hosting |
| Docker | ✅ | Backend containerization |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop
- Ollama → https://ollama.com/download/windows

### 1. Clone the repo

```bash
git clone https://github.com/Tansihq-jais/sarkar-sahayak.git
cd sarkar-sahayak
```

### 2. Install frontend dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your keys (see [Environment Variables](#-environment-variables) below).

### 4. Start the AI model

```bash
# Install Ollama, then pull the model
ollama pull gemma2:2b
ollama serve
```

### 5. Start the backend (Docker)

```bash
cd sprint8/backend
cp .env.example .env
# Fill in Supabase + Pinecone keys in .env
docker compose up --build
```

### 6. Index schemes to Pinecone

```bash
docker compose cp ../scripts/index_schemes.py api:/app/index_schemes.py
docker compose exec api python /app/index_schemes.py
```

### 7. Start the frontend

```bash
# Back in project root
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🔑 Environment Variables

Create `.env.local` in the project root:

```env
# Ollama (local AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (free — https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Pinecone (free — https://pinecone.io)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=sarkar-sahayak

# Backend
BACKEND_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
sarkar-sahayak/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── schemes/            # Scheme browser + detail
│   │   ├── upload/             # Document upload
│   │   ├── chat/               # AI eligibility chat
│   │   ├── results/            # Eligibility report
│   │   ├── history/            # Chat history (auth required)
│   │   ├── auth/               # Email OTP sign in
│   │   ├── admin/              # Admin dashboard
│   │   └── api/                # API routes
│   │       ├── chat/           # Ollama streaming
│   │       ├── auth/           # OTP send + verify
│   │       └── results/        # PDF export
│   ├── components/             # React components
│   │   ├── layout/             # NavBar, Footer, PageLayout
│   │   ├── ui/                 # Button, Card, Badge, Toast...
│   │   ├── chat/               # ChatMessage, VerdictCard...
│   │   └── results/            # CriteriaBreakdown, Checklist...
│   ├── store/                  # Zustand stores
│   ├── lib/                    # Utilities
│   ├── hooks/                  # useChat, useSession
│   └── data/                   # 20 preloaded schemes
├── sprint8/
│   └── backend/                # FastAPI + Celery pipeline
│       ├── main.py
│       ├── services/
│       │   ├── extractor.py    # PyMuPDF text extraction
│       │   ├── ocr.py          # Tesseract OCR fallback
│       │   ├── chunker.py      # LangChain text splitter
│       │   ├── embedder.py     # sentence-transformers
│       │   └── vectorstore.py  # Pinecone upsert + query
│       ├── tasks/
│       │   └── process_document.py  # Full pipeline task
│       └── docker-compose.yml
├── supabase/
│   └── migrations/
│       ├── 001_initial.sql     # 7 tables + indexes
│       └── 002_rls.sql         # Row Level Security
├── scripts/
│   └── index_schemes.py        # Bulk index 20 schemes
├── docs/
│   ├── DEPLOYMENT.md           # Deploy to Vercel guide
│   ├── SUPABASE_SETUP.md       # Supabase setup guide
│   ├── BACKEND_SETUP.md        # FastAPI setup guide
│   └── SECURITY_REVIEW.md      # Security checklist
└── tests/
    └── e2e/                    # Playwright E2E tests
```

---

## 🎯 Features

### MVP (Phases 0–4)
- ✅ Browse 20 government schemes with search and category filters
- ✅ Upload PDF, DOCX, or TXT policy documents
- ✅ Client-side document parsing (no server upload needed)
- ✅ Streaming AI chat with local Ollama model
- ✅ Structured eligibility verdict (ELIGIBLE / NOT ELIGIBLE / LIKELY / NEED MORE INFO)
- ✅ Full eligibility report with document checklist and application steps
- ✅ Share results via URL (no PII encoded)
- ✅ Print/export report
- ✅ Custom 404 and error pages
- ✅ Mobile responsive

### Phase 5 (Auth + RAG + History)
- ✅ Email OTP authentication (free via Supabase)
- ✅ Chat history saved to Supabase
- ✅ RAG pipeline — Pinecone vector search for relevant policy chunks
- ✅ Server-side document processing with OCR support
- ✅ PDF export of eligibility results
- ✅ Admin dashboard for scheme management

---

## 🏛️ Supported Schemes (20)

| Category | Schemes |
|----------|---------|
| 🏠 Housing | PM Awas Yojana Urban, PM Awas Yojana Gramin |
| 🏥 Health | Ayushman Bharat PM-JAY |
| 🌾 Agriculture | PM Kisan Samman Nidhi, PM Fasal Bima Yojana |
| 💰 Finance | PM MUDRA, Atal Pension, Jan Dhan, PMJJBY, PMSBY, Stand Up India |
| 🎓 Education | National Scholarship Portal, Skill India (PMKVY) |
| 🔥 Energy | PM Ujjwala Yojana |
| 👧 Women & Children | Sukanya Samriddhi Yojana |
| 🌐 Digital | Digital India CSC, e-Shram, One Nation One Ration |
| 🏗️ Sanitation | Swachh Bharat Mission Gramin |
| 🍚 Food Security | PM Garib Kalyan Anna Yojana |

---

## 📜 Database Schema

7 tables in Supabase PostgreSQL:

- **users** — registered users (phone/email, location)
- **chat_sessions** — each eligibility check session
- **messages** — individual chat messages
- **documents** — uploaded policy documents
- **eligibility_results** — structured verdict + criteria
- **schemes** — scheme metadata
- **otp_requests** — OTP rate limiting

Full schema in `supabase/migrations/001_initial.sql`

---

## 🧪 Testing

```bash
# Unit tests (Vitest)
npm test

# E2E tests (Playwright)
npx playwright install chromium
npm run test:e2e

# View E2E report
npm run test:e2e:report
```

---

## 🚢 Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for full instructions.

Quick summary:
1. Push to GitHub ✅
2. Connect repo to Vercel (free hobby plan)
3. Set environment variables in Vercel dashboard
4. Deploy backend to Render (free tier)
5. Update `BACKEND_URL` in Vercel env vars

---

## ⚠️ Disclaimer

Sarkar Sahayak is an unofficial tool for informational purposes only. Always verify eligibility and requirements at official government portals before applying for any scheme.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ to make government schemes accessible to every Indian citizen.*