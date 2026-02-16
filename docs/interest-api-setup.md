# Interest Notification API — Setup Guide

The interest notification system lets visitors send you a message directly from your CV site. When someone fills out the form, an email is delivered to your inbox via your SMTP server.

## Architecture

```
[CV Site on GitHub Pages]  →  POST /api/send-interest  →  [Vercel Serverless Function]  →  [Your SMTP Server]  →  [Your Inbox]
```

- **Frontend**: React form component (`InterestForm`) that POSTs JSON to the Vercel endpoint
- **Backend**: Vercel serverless function (`api/api/send-interest.ts`) that validates input and sends email via SMTP using nodemailer

## Frontend Setup

1. Create a `.env` file in the project root (copy from `.env.example`):

   ```
   VITE_INTEREST_API_URL=https://tool-till-tees.vercel.app/api/send-interest
   ```

2. The form appears automatically in the Contact section. If `VITE_INTEREST_API_URL` is not set, the form gracefully tells visitors the feature is unavailable.

## Vercel Deployment

### 1. Connect to Vercel

From the `api/` directory (this is the Vercel project root):

```bash
cd api
npx vercel
```

When prompted:
- **Set up and deploy?** Yes
- **Which scope?** Your Vercel account
- **Link to existing project?** No (first time) or Yes (subsequent)
- **Project name:** `see-veo-api` (or your preference)
- **Directory where code is located:** `./` (the `api/` directory is the project root)

### 2. Configure environment variables

Add your SMTP configuration in the Vercel dashboard under **Settings > Environment Variables**, or via the CLI:

```bash
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_SECURE
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add SMTP_FROM
vercel env add RECIPIENT_EMAIL
vercel env add ALLOWED_ORIGINS
```

| Variable | Required | Description |
|---|---|---|
| `SMTP_HOST` | Yes | Your SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_SECURE` | No | Use TLS (`true` for port 465, default: `false`) |
| `SMTP_USER` | No | SMTP username (omit if no auth required) |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | Yes | Sender address, e.g. `CV Site <noreply@example.com>` |
| `RECIPIENT_EMAIL` | Yes | Where interest emails are delivered |
| `ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins, e.g. `https://devmade-ai.github.io` |

### 3. Deploy to production

```bash
vercel --prod
```

### 4. Verify

```bash
curl https://tool-till-tees.vercel.app/api/health
# → {"status":"ok"}
```

### 5. Update the frontend

Set `VITE_INTEREST_API_URL` in your `.env` to the Vercel production URL:

```
VITE_INTEREST_API_URL=https://tool-till-tees.vercel.app/api/send-interest
```

Rebuild and deploy the frontend to GitHub Pages.

## Security

- **CORS**: Only origins listed in `ALLOWED_ORIGINS` can submit the form
- **Input validation**: Name (max 100 chars), email (max 254 chars, format-checked), message (max 2000 chars)
- **Honeypot**: Frontend includes a hidden field that catches automated spam bots
- **Vercel infrastructure**: Automatic DDoS protection and edge network security

## Rate Limiting

The serverless function does not include application-level rate limiting because in-memory state does not persist across invocations. For a personal CV site, CORS restrictions plus the honeypot field provide adequate protection. If you need stricter rate limiting, add [Vercel KV](https://vercel.com/docs/storage/vercel-kv) or [Upstash Redis](https://upstash.com/) as a backing store.
