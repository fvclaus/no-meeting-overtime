import crypto from "crypto";
import { GET_TOKEN_API_URL, REQUIRED_SCOPES } from '@/shared/server_constants';
import { createOauth2Client } from "@/shared/server_constants";
import { setSessionKey } from '@/session-store';
import { NextRequest, NextResponse } from 'next/server';



// TODO Logout + Revoke?

// https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance
  
const scopes = [
    'email',
    'profile',
    'openid',
    ...REQUIRED_SCOPES
];


export async function GET(
    req: NextRequest,
  ) {
    // Generate a secure random state value.
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in the session
    await setSessionKey('state', state);
    
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
        state: state,
        // TODO Remove when missing refresh_token handling is fixed
        prompt: 'consent',
        redirect_uri: GET_TOKEN_API_URL
    });
    return NextResponse.redirect(authorizationUrl);
}