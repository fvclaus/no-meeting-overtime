import { NextResponse, type NextRequest } from "next/server";

function getApexHost(): string | null {
  const siteBase = process.env.SITE_BASE;
  if (!siteBase) {
    return null;
  }
  try {
    return new URL(siteBase).host;
  } catch {
    return null;
  }
}

const apexHost = getApexHost();

export function proxy(request: NextRequest) {
  if (apexHost === null) {
    return NextResponse.next();
  }

  const incomingHost =
    request.headers.get("X-Forwarded-Host") ?? request.nextUrl.host;

  if (incomingHost === `www.${apexHost}`) {
    const redirectUrl = new URL(request.nextUrl);
    redirectUrl.protocol = "https:";
    redirectUrl.host = apexHost;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}
