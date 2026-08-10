// HumanOS Worker — serves the static site (via the ASSETS binding) and
// handles the /api/feedback endpoint used by the site's "Feedback" modal.
// Everything that isn't /api/feedback falls straight through to the
// prebuilt static site in `public/`, unchanged.

interface D1Result {
  success: boolean
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  run(): Promise<D1Result>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface Fetcher {
  fetch(request: Request): Promise<Response>
}

export interface Env {
  ASSETS: Fetcher
  FEEDBACK_DB: D1Database
}

const ALLOWED_CATEGORIES = new Set([
  "error",
  "improvement",
  "topic",
  "unclear",
  "general",
])

const MAX_MESSAGE_LENGTH = 5000
const MAX_EMAIL_LENGTH = 320
const MAX_URL_LENGTH = 500

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

async function handleFeedback(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405)
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ error: "Invalid request body" }, 400)
  }

  // Honeypot: a hidden field real users never fill in. Bots that
  // auto-fill every field trip this — we quietly pretend success so they
  // don't learn to skip it, rather than storing their junk.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true }, 200)
  }

  const category = String(body.category ?? "").trim()
  const message = String(body.message ?? "").trim()
  const emailRaw = body.email ? String(body.email).trim() : ""
  const pageUrl = body.pageUrl ? String(body.pageUrl).trim().slice(0, MAX_URL_LENGTH) : null

  if (!ALLOWED_CATEGORIES.has(category)) {
    return json({ error: "Please choose a feedback type." }, 400)
  }
  if (message.length < 3) {
    return json({ error: "Please write a bit more detail." }, 400)
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: "Message is too long." }, 400)
  }
  if (emailRaw.length > MAX_EMAIL_LENGTH) {
    return json({ error: "Email is too long." }, 400)
  }

  const email = emailRaw === "" ? null : emailRaw

  try {
    await env.FEEDBACK_DB.prepare(
      "INSERT INTO feedback (category, message, email, page_url) VALUES (?, ?, ?, ?)",
    )
      .bind(category, message, email, pageUrl)
      .run()
  } catch (err) {
    return json({ error: "Could not save feedback. Please try again." }, 500)
  }

  return json({ ok: true }, 200)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === "/api/feedback") {
      return handleFeedback(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}
