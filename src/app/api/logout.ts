import { deleteSession } from "@/session-store";
import { SITE_BASE } from "@/shared/server_constants";
import { NextRequest, NextResponse } from "next/server";


export default async function handler(
    req: NextRequest,
  ) {
    await deleteSession();
    return NextResponse.redirect(SITE_BASE);
  }