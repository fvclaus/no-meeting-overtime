import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.headers.get("X-Forwarded-Host");
  if (url !== null && url.startsWith("www.")) {
    return NextResponse.redirect(`https://${url.replace("www.", "")}`);
  }
  const response = NextResponse.next();
  response.headers.set("Link", `<${request.url}>; rel="canonical"`);
  return response;
}
