import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const response = NextResponse.redirect(new URL("/projects", request.url))
    response.cookies.set("show_splash", "1", {
      maxAge: 10,
      httpOnly: false,
      path: "/",
    })
    return response
  }
}

export const config = {
  matcher: ["/"],
}
