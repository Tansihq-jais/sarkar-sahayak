# 🗄️ Supabase Setup Guide — Sprint 7

Everything here is **100% free**. No credit card required.

---

## Step 1 — Create Supabase Project

1. Go to **https://supabase.com** → Sign up free (GitHub login works)
2. Click **New Project**
3. Fill in:
   - **Name**: `sarkar-sahayak`
   - **Database Password**: choose a strong password (save it!)
   - **Region**: `Southeast Asia (Singapore)` — closest to India
4. Click **Create new project** — takes ~2 minutes

---

## Step 2 — Run Database Migrations

1. In your Supabase dashboard → click **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the contents of `supabase/migrations/001_initial.sql`
4. Paste and click **Run**
5. You should see: `Success. No rows returned`
6. Repeat for `supabase/migrations/002_rls.sql`

---

## Step 3 — Enable Phone Auth (for OTP)

1. Go to **Authentication → Providers**
2. Find **Phone** and enable it
3. For **SMS Provider** select **Twilio** (or leave as "none" for testing)

> **For local development without Twilio:**
> Supabase has a built-in OTP test mode. Go to:
> **Authentication → Users** → you can manually confirm users
> Or use the Supabase dashboard to see OTPs in the logs

---

## Step 4 — Get Your API Keys

1. Go to **Project Settings → API** (gear icon in sidebar)
2. Copy these three values into your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

⚠️ **Never commit `SUPABASE_SERVICE_ROLE_KEY` to Git** — it has admin access.
It's already in `.gitignore` via `.env.local`.

---

## Step 5 — Verify Setup

Restart your dev server and visit:
```
http://localhost:3000/auth
```

You should see the phone number login page. Enter your number to test OTP flow.

---

## Free Tier Limits

| Feature | Free Limit |
|---------|-----------|
| Database | 500MB storage |
| Auth | Unlimited users |
| API requests | 2M rows read/month |
| Realtime | 200 concurrent connections |

More than enough for MVP and early users.

---

## Viewing Your Data

In Supabase dashboard → **Table Editor** — you can see all tables and rows visually.
Useful for debugging during development.
