# 🚀 Sarkar Sahayak — Deployment Guide

Everything here is **100% free** — no credit card required.

---

## Prerequisites

- GitHub account (free) → https://github.com
- Vercel account (free Hobby plan) → https://vercel.com
- OpenRouter account (free) → https://openrouter.ai

---

## Step 1 — Push to GitHub

```bash
# In your project folder (sarkar-sahayak)
git init
git add .
git commit -m "feat: initial sarkar sahayak MVP"

# Create a new repo at github.com/new (keep it public or private, both work)
git remote add origin https://github.com/YOUR_USERNAME/sarkar-sahayak.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy to Vercel (free)

1. Go to https://vercel.com → **Sign up with GitHub** (free, no card)
2. Click **Add New Project**
3. Import your `sarkar-sahayak` GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**

That's it. Your app gets a free URL like `sarkar-sahayak-xyz.vercel.app`

---

## Step 3 — Set Environment Variables in Vercel

In your Vercel project dashboard → **Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `OPENROUTER_API_KEY` | `sk-or-your-key-here` |
| `OPENROUTER_MODEL` | `meta-llama/llama-3.3-70b-instruct:free` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

Then go to **Deployments** and click **Redeploy** so the new vars take effect.

---

## Step 4 — Smoke Test Checklist

Run through these on your live Vercel URL:

- [ ] Home page loads — hero, stats, How It Works visible
- [ ] `/schemes` — all 20 scheme cards visible, search works
- [ ] `/schemes/pm-awas-yojana` — detail page loads
- [ ] `/upload` — dropzone visible, preloaded library shows
- [ ] Upload a PDF — shows "Indexed" status
- [ ] `/chat` — type a question, response streams back
- [ ] Chat produces a verdict card (ELIGIBLE / NOT ELIGIBLE)
- [ ] `/results` — full report shows with documents checklist
- [ ] Share button copies a link
- [ ] `/anything-fake` — shows custom 404 page
- [ ] Check mobile view at 375px width — no horizontal scroll

---

## Free Tier Limits (what you get for free)

| Service | Free Limit |
|---------|-----------|
| Vercel Hobby | 100GB bandwidth/month, unlimited deploys |
| Vercel Functions | 100GB-hours compute/month |
| OpenRouter | Free models (Llama 3.3 70B) — rate limited but free |
| GitHub | Unlimited public/private repos |

---

## Custom Domain (optional, also free)

Vercel gives you a free `.vercel.app` subdomain. If you have your own domain:
1. Vercel Dashboard → **Settings → Domains**
2. Add your domain and follow the DNS instructions
3. SSL certificate is auto-provisioned (free via Let's Encrypt)

---

## Automatic Deploys

Every `git push` to `main` triggers a new Vercel deployment automatically. No manual steps needed after initial setup.

```bash
git add .
git commit -m "fix: update scheme data"
git push
# → Vercel auto-deploys in ~60 seconds
```
