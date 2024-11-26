import { deleteSession } from "@/session-store";
import { SITE_BASE } from "@/shared/constants";
import { db } from "@/shared/server_constants";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    await deleteSession(req, res);
    res.redirect(SITE_BASE);
  }