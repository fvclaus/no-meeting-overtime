import { deleteSession } from "@/app/session-store";
import { SITE_BASE } from "@/shared/server_constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(SITE_BASE);
}
