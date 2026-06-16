import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.headers.get("X-Forwarded-Host");
  if (url !== null && url.startsWith("www.")) {
    return NextResponse.redirect(`https://${url.replace("www.", "")}`);
  }
  return NextResponse.next();
}
