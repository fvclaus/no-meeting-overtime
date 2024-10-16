import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from "crypto";
import {google} from "googleapis";
import { GET_TOKEN_API_URL } from '@/shared/constants';
import { CLIENT_ID, CLIENT_SECRET } from "@/shared/server_constants";

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    GET_TOKEN_API_URL
);
  
const scopes = [
    'https://www.googleapis.com/auth/meetings.space.readonly'
];


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    // Generate a secure random state value.
    const state = crypto.randomBytes(32).toString('hex');
    
    // TODO Session
    // Store state in the session
    // req.session.state = state;
    
    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
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