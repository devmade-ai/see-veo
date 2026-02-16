# Interest Notification API — Setup Guide

The interest notification system lets visitors send you a message directly from your CV site. When someone fills out the form, an email is delivered to your inbox via your SMTP server.

## Architecture

```
[CV Site on GitHub Pages]  →  POST /send-interest  →  [API Server]  →  [Your SMTP Server]  →  [Your Inbox]
```

- **Frontend**: React form component (`InterestForm`) that POSTs JSON to an API endpoint
- **Backend**: Standalone Node.js HTTP server (`api/`) that validates input and sends email via SMTP

## Frontend Setup

1. Create a `.env` file in the project root (copy from `.env.example`):

   ```
   VITE_INTEREST_API_URL=https://your-api-domain.com/send-interest
   ```

2. The form appears automatically in the Contact section. If `VITE_INTEREST_API_URL` is not set, the form gracefully tells visitors the feature is unavailable.

## API Server Setup

### 1. Install dependencies

```bash
cd api
npm install
```

### 2. Configure environment

Copy `api/.env.example` to `api/.env` and fill in your SMTP details:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `SMTP_HOST` | Yes | Your SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_SECURE` | No | Use TLS (`true` for port 465, default: `false`) |
| `SMTP_USER` | No | SMTP username (omit if no auth required) |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | Yes | Sender address, e.g. `"CV Site <noreply@example.com>"` |
| `RECIPIENT_EMAIL` | Yes | Where interest emails are delivered |
| `ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins for CORS |
| `PORT` | No | HTTP port (default: 3001) |

### 3. Build and run

```bash
npm run build
npm start
```

### 4. Verify

```bash
curl http://localhost:3001/health
# → {"status":"ok"}
```

## Deployment Options

The API is a plain Node.js HTTP server. Deploy it however suits your infrastructure:

- **Directly on a VPS**: Run with `pm2`, `systemd`, or `supervisord`
- **Docker**: Add a Dockerfile, `FROM node:22-slim`, copy `dist/` and `node_modules/`, run `node dist/server.js`
- **Serverless**: Wrap the `handleRequest()` function for your platform (AWS Lambda, Vercel, Cloudflare Workers, etc.)

## Security

- **CORS**: Only origins listed in `ALLOWED_ORIGINS` can submit the form
- **Rate limiting**: 5 submissions per IP per hour (in-memory)
- **Input validation**: Name (max 100 chars), email (max 254 chars, format-checked), message (max 2000 chars)
- **Body size limit**: 10 KB max request body
- **Honeypot**: Frontend includes a hidden field that catches automated spam bots

## Rate Limiting

The in-memory rate limiter is suitable for single-instance deployments. If you scale to multiple instances behind a load balancer, replace the in-memory store with Redis or a shared cache.
