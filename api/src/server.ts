// Requirement: Receive email notifications when visitors express interest via the CV site
// Approach: Standalone Node.js HTTP server with nodemailer for SMTP delivery
// Alternatives considered:
//   - Express.js: Rejected — single endpoint doesn't justify a framework dependency
//   - Platform-specific SDK (Vercel/Lambda): Rejected — locks deployment to one platform
//   - Raw TCP/SMTP proxy: Rejected — unnecessary complexity for simple form submissions
//
// Deployment: runs as a standalone Node.js process. Can be containerised, run via
// systemd/PM2, or adapted to any serverless platform by wrapping handleRequest().

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createTransport } from 'nodemailer'

// --- Configuration via environment variables ---

const SMTP_HOST = process.env.SMTP_HOST ?? ''
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '587', 10)
const SMTP_USER = process.env.SMTP_USER ?? ''
const SMTP_PASS = process.env.SMTP_PASS ?? ''
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
const SMTP_FROM = process.env.SMTP_FROM ?? ''
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL ?? ''
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const PORT = parseInt(process.env.PORT ?? '3001', 10)

// --- Validation ---

if (!SMTP_HOST) {
  console.error('Missing required environment variable: SMTP_HOST')
  process.exit(1)
}
if (!RECIPIENT_EMAIL) {
  console.error('Missing required environment variable: RECIPIENT_EMAIL')
  process.exit(1)
}
if (!SMTP_FROM) {
  console.error('Missing required environment variable: SMTP_FROM')
  process.exit(1)
}

// --- SMTP transport ---

const transporter = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  ...(SMTP_USER ? { auth: { user: SMTP_USER, pass: SMTP_PASS } } : {}),
})

// --- Types ---

interface InterestPayload {
  name: string
  email: string
  message: string
}

// --- Helpers ---

function getCorsHeaders(origin: string | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }

  // If no origins configured, reject all cross-origin requests.
  // If the incoming origin matches an allowed one, reflect it back.
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}

function respond(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
  origin?: string
) {
  const corsHeaders = getCorsHeaders(origin)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...corsHeaders,
  })
  res.end(JSON.stringify(body))
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    const MAX_BODY = 10_000 // 10 KB — more than enough for name + email + message

    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY) {
        req.destroy()
        reject(new Error('Body too large'))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

function validatePayload(data: unknown): InterestPayload | null {
  if (typeof data !== 'object' || data === null) return null

  const { name, email, message } = data as Record<string, unknown>

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) return null
  if (typeof email !== 'string' || email.length > 254) return null
  if (typeof message !== 'string' || message.length > 2000) return null

  // Basic email format check — not exhaustive, the SMTP server will ultimately validate
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email.trim())) return null

  return {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  }
}

// --- In-memory rate limiting ---
// Requirement: Prevent abuse without external dependencies
// Approach: Simple sliding window per IP, stored in memory
// Alternatives considered:
//   - Redis: Rejected — adds infrastructure dependency for a low-traffic endpoint
//   - No rate limiting: Rejected — leaves the endpoint open to spam

const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5 // max submissions per window per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) ?? []

  // Remove entries outside the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent)
    return true
  }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

// Clean up stale entries every 10 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (recent.length === 0) {
      rateLimitMap.delete(ip)
    } else {
      rateLimitMap.set(ip, recent)
    }
  }
}, 10 * 60 * 1000)

// --- Request handler ---

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    respond(res, 200, { status: 'ok' }, origin)
    return
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    respond(res, 204, {}, origin)
    return
  }

  // Only accept POST to /send-interest
  if (req.method !== 'POST' || req.url !== '/send-interest') {
    respond(res, 404, { error: 'Not found' }, origin)
    return
  }

  // Rate limiting
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    'unknown'

  if (isRateLimited(clientIp)) {
    respond(res, 429, { error: 'Too many requests. Please try again later.' }, origin)
    return
  }

  // Parse and validate
  let body: string
  try {
    body = await readBody(req)
  } catch {
    respond(res, 413, { error: 'Request body too large' }, origin)
    return
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    respond(res, 400, { error: 'Invalid JSON' }, origin)
    return
  }

  const payload = validatePayload(parsed)
  if (!payload) {
    respond(res, 400, { error: 'Invalid or missing fields. Name and a valid email are required.' }, origin)
    return
  }

  // Send email
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: RECIPIENT_EMAIL,
      replyTo: payload.email,
      subject: `Interest from ${payload.name}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        '',
        payload.message ? `Message:\n${payload.message}` : '(No message provided)',
      ].join('\n'),
    })

    respond(res, 200, { success: true }, origin)
  } catch (err) {
    console.error('SMTP send failed:', err)
    respond(res, 500, { error: 'Failed to send email. Please try again later.' }, origin)
  }
}

// --- Start server ---

const server = createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error('Unhandled error:', err)
    respond(res, 500, { error: 'Internal server error' })
  })
})

server.listen(PORT, () => {
  console.log(`Interest API listening on port ${PORT}`)
})
