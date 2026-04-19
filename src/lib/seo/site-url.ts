export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (raw) {
    return raw.replace(/\/$/, "")
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000"
  }

  return "http://localhost:3000"
}
