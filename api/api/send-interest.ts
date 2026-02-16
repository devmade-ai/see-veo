// Requirement: Receive email notifications when visitors express interest via the CV site
// Approach: Vercel serverless function with nodemailer for SMTP delivery
// Alternatives considered:
//   - Standalone Node.js server: Rejected — user wants Vercel hosting
//   - Third-party form services (Formspree, Web3Forms): Rejected — user has own SMTP server
//   - Cloudflare Workers: Rejected — limited SMTP support via raw TCP sockets

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createTransport } from 'nodemailer'

// --- Types ---

interface InterestPayload {
  name: string
  email: string
  message: string
}

// --- Helpers ---

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
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

// --- Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate required env vars at runtime
  const { SMTP_HOST, SMTP_FROM, RECIPIENT_EMAIL } = process.env
  if (!SMTP_HOST || !SMTP_FROM || !RECIPIENT_EMAIL) {
    console.error('Missing required environment variables: SMTP_HOST, SMTP_FROM, RECIPIENT_EMAIL')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  // Validate payload
  const payload = validatePayload(req.body)
  if (!payload) {
    return res.status(400).json({
      error: 'Invalid or missing fields. Name and a valid email are required.',
    })
  }

  // Send email via SMTP
  const transporter = createTransport({
    host: SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    ...(process.env.SMTP_USER
      ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? '' } }
      : {}),
  })

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

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('SMTP send failed:', err)
    return res.status(500).json({ error: 'Failed to send email. Please try again later.' })
  }
}
