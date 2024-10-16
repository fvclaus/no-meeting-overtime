import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from "crypto";
import { GET_TOKEN_API_URL } from '@/shared/constants';
import { CLIENT_ID, CLIENT_SECRET, createOauth2Client } from "@/shared/server_constants";
import { set } from '@/session-store';

  
const scopes = [
    'https://www.googleapis.com/auth/meetings.space.readonly'
];


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    // Generate a secure random state value.
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in the session
    set(req, res, 'state', state);
    
    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = createOauth2Client().generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        /** Pass in the scopes array defined above.
             * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        // Include the state parameter to reduce the risk of CSRF attacks.
        state: state
    });
    res.redirect(authorizationUrl);
}