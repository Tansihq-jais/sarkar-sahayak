# Phase 2 Setup — AI Chat

## 1. Install new dependency (react-dropzone was already in Phase 1, but verify)

```powershell
cd sarkar-sahayak
npm install
```

## 2. Add your Anthropic API key

Open `.env.local` and add:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> Get your key at: https://console.anthropic.com/settings/keys
> New accounts get $5 free credit — more than enough for development.

## 3. Run the dev server

```powershell
npm run dev
```

## 4. Test the chat

1. Open http://localhost:3000/upload
2. Click **"+ Add"** next to any preloaded scheme (e.g. PM-KISAN)
3. Open http://localhost:3000/chat
4. Select the scheme from the dropdown in the header
5. Type: **"Am I eligible?"**
6. The AI will ask follow-up questions and eventually give a verdict

## What's working in Phase 2

| Feature | Status |
|---------|--------|
| Streaming AI responses | ✅ |
| Session cookie management | ✅ |
| Rate limiting (20 queries/hr) | ✅ |
| Scheme selector in chat | ✅ |
| Document sidebar with toggle | ✅ |
| Verdict card (Eligible / Not Eligible) | ✅ |
| Results page | ✅ |
| Auto-scroll to latest message | ✅ |
| Stop streaming button | ✅ |
| Quick question chips | ✅ |

## Without an API key?

The chat page still works as UI — it will show a toast error
"API key not configured" when you try to send a message.
All other pages (home, schemes, upload) work fine without a key.
