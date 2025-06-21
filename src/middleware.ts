import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.headers.get("X-Forwarded-Host");
  if (url !== null && url.startsWith("www.")) {
    return NextResponse.redirect(`https://${url.replace("www.", "")}`);
  }
  return NextResponse.next();
}
