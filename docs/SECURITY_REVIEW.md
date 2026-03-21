# 🔒 Security Review Checklist — Sarkar Sahayak MVP

Complete before production launch. All items are achievable with free tools.

---

## 1. Dependency Scan

Run with `npm audit` (built into npm, no account needed):

```bash
npm audit
# Fix any HIGH or CRITICAL issues:
npm audit fix --legacy-peer-deps
```

Target: **zero HIGH or CRITICAL vulnerabilities**.

---

## 2. Secret / Key Exposure

Verify no secrets are accidentally committed:

```bash
# Check git history for leaked keys
git log --all --full-history -- "**/.env*"

# Search codebase for accidental key inclusion
grep -r "sk-or-" src/
grep -r "OPENROUTER_API_KEY=" src/
```

Expected: **zero results** in `src/`.

Verify `.gitignore` includes:
```
.env
.env.local
.env.production
.env*.local
```

---

## 3. Security Headers

After deployment, check headers at https://securityheaders.com

Enter your Vercel URL. Target grade: **A or A+**

Expected headers (already configured in `next.config.ts`):
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Strict-Transport-Security`
- ✅ `Referrer-Policy`
- ✅ `Permissions-Policy`
- ✅ `Content-Security-Policy` (production only)
- ✅ `X-Powered-By` header removed

---

## 4. Client Bundle — No Secret Keys

Verify the API key is never sent to the browser:

```bash
npm run build
# Then search the build output:
grep -r "sk-or-" .next/static/ 2>/dev/null
```

Expected: **zero results**.

The API key is only used in `src/app/api/chat/route.ts` (server-side) — never in client components.

---

## 5. API Route Protection

Verify `/api/chat` has rate limiting:
- Returns `429` after 20 requests/hour per session
- Session cookie is `httpOnly` (not readable by JS)
- Request body is validated with Zod before processing

---

## 6. No PII in Share URLs

The share URL encodes only: `verdict`, `schemeName`, `reason` — no names, phone numbers, or Aadhaar numbers. Verified in `src/lib/shareResult.ts`.

---

## 7. OWASP Top 10 Quick Check

| Risk | Status | Notes |
|------|--------|-------|
| A01 Broken Access Control | ✅ | No auth in MVP — all routes public |
| A02 Cryptographic Failures | ✅ | No sensitive data stored |
| A03 Injection | ✅ | Zod validates all API inputs |
| A04 Insecure Design | ✅ | No PII collected or stored |
| A05 Security Misconfiguration | ✅ | Headers set, powered-by removed |
| A06 Vulnerable Components | ⚠️ | Run `npm audit` before launch |
| A07 Auth Failures | ✅ | No auth in MVP |
| A08 Software Integrity | ✅ | Lockfile committed |
| A09 Logging Failures | ⚠️ | Add Sentry in Phase 5 |
| A10 SSRF | ✅ | Only calls OpenRouter API |

---

## Sign-off

- [ ] `npm audit` — zero HIGH/CRITICAL
- [ ] No secrets in `src/` or git history
- [ ] securityheaders.com grade A or above
- [ ] Build output has no API keys
- [ ] Share URLs contain no PII
