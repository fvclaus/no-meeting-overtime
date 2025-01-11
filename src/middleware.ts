import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.replace("www.", "");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
