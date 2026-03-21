# 🏛️ Sarkar Sahayak — Government Policy Navigator

AI-powered platform to check eligibility for 500+ Indian government schemes.

## Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Git

### 1. Clone & Install

```bash
git clone https://github.com/your-username/sarkar-sahayak.git
cd sarkar-sahayak
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:
- `ANTHROPIC_API_KEY` — get from [console.anthropic.com](https://console.anthropic.com)
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` — from Vercel KV (or skip for local dev without rate limiting)

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run type-check` | TypeScript check |
| `npm test` | Run Vitest tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Coverage report |
| `npm run storybook` | Component explorer |

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages + API routes
│   ├── api/          # Server-side API endpoints
│   ├── chat/         # Chat page
│   ├── schemes/      # Scheme browser
│   ├── upload/       # Document upload
│   └── results/      # Eligibility results
├── components/       # React components
│   ├── layout/       # NavBar, Layout, Footer
│   ├── ui/           # Reusable UI primitives
│   ├── chat/         # Chat-specific components
│   ├── schemes/      # Scheme cards, filters
│   ├── upload/       # Upload zone, doc list
│   └── results/      # Verdict, checklist, steps
├── store/            # Zustand global state
│   ├── documentStore.ts
│   ├── chatStore.ts
│   └── sessionStore.ts
├── lib/              # Utility functions
│   ├── parsePdf.ts   # PDF.js text extraction
│   ├── parseDocx.ts  # Mammoth DOCX parsing
│   ├── chunker.ts    # Text chunking
│   ├── promptBuilder.ts  # Claude system prompt
│   ├── verdictParser.ts  # Extract verdict from response
│   └── rateLimiter.ts    # Rate limit middleware
├── hooks/            # Custom React hooks
│   └── useChat.ts    # SSE streaming hook
├── data/             # Static data
│   └── schemes.ts    # 20 preloaded schemes
├── types/            # TypeScript type definitions
└── styles/           # Global CSS + design tokens
```

---

## Build Sequence

See `docs/implementation-plan.md` for the full 83-task build sequence.

**Phase 0 ✅** — Foundation (you are here)  
**Phase 1** — MVP Core (schemes + upload)  
**Phase 2** — AI Chat (Claude integration)  
**Phase 3** — Results & Polish  
**Phase 4** — MVP Launch  
**Phase 5** — Scale (RAG, auth, history)  

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.4 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4.5 |
| AI | Anthropic Claude (claude-sonnet-4) |
| Testing | Vitest + Playwright |
| Deployment | Vercel |

---

## Contributing

1. Branch from `staging`: `git checkout -b feature/your-feature`
2. Make changes, ensure CI passes locally: `npm run lint && npm run type-check && npm test`
3. Open PR to `staging`
4. Merge to `main` only via release PRs

---

*Sarkar Sahayak is an unofficial tool. Always verify eligibility at official government portals.*
