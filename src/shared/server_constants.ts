import {google} from "googleapis";
import { GET_TOKEN_API_URL } from "./constants";
export const CLIENT_ID = process.env.CLIENT_ID!;
if (CLIENT_ID === undefined) {
  throw new Error('Missing CLIENT_ID');
}
export const CLIENT_SECRET = process.env.CLIENT_SECRET!;
if (CLIENT_SECRET == undefined) {
  throw new Error('Missing CLIENT_SECRET');
}

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */


export const createOauth2Client = () => new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    // TODO Necessary?
    GET_TOKEN_API_URL
);
