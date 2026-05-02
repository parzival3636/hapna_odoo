import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Auth callback is no longer needed with Django JWT auth.
  // Redirect to login page.
  return NextResponse.redirect(new URL("/login", request.url));
}
