import { google } from "googleapis";
import { START_MEETING_PATH } from "./constants";
import { Firestore } from "@google-cloud/firestore";
export const CLIENT_ID = process.env.CLIENT_ID!;
if (CLIENT_ID == null) {
  throw new Error("Missing CLIENT_ID");
}
export const CLIENT_SECRET = process.env.CLIENT_SECRET!;
if (CLIENT_SECRET == null) {
  throw new Error("Missing CLIENT_SECRET");
}

export const PROJECT_ID = process.env.PROJECT_ID!;
if (PROJECT_ID == null) {
  throw new Error("Missing PROJECT_ID");
}

export const QUEUE_LOCATION = process.env.QUEUE_LOCATION!;
if (QUEUE_LOCATION == null) {
  throw new Error("Missing QUEUE_LOCATION");
}

// Not required on Cloud Run
// TODO Migration to GOOGLE_APPLICATION_CREDENTIALS
// https://cloud.google.com/docs/authentication/application-default-credentials
export const { KEY_FILE } = process.env;

export const SITE_BASE = process.env.SITE_BASE!;

if (SITE_BASE == null) {
  throw new Error("Missing SITE_BASE");
}

export let SITE_BASE_CLOUD_TASKS = process.env.SITE_BASE_CLOUD_TASKS!;

// Usage of ngrok https URL only is cumbersome, because it requires administration of OAuth redirect URLs.
if (SITE_BASE_CLOUD_TASKS == undefined) {
  if (SITE_BASE.includes("localhost")) {
    throw new Error(
      "SITE_BASE includes localhost you have to then defined a URL that can be reached by Google CloudTasks. Use ngrok for example",
    );
  }
  SITE_BASE_CLOUD_TASKS = SITE_BASE;
}

export const CLOUD_TASKS_SERVICE_ACCOUNT =
  process.env.CLOUD_TASKS_SERVICE_ACCOUNT!;

if (CLOUD_TASKS_SERVICE_ACCOUNT == undefined) {
  throw new Error("Missing CLOUD_TASKS_SERVICE_ACCOUNT");
}

export const START_MEETING_URL = SITE_BASE + START_MEETING_PATH;

export const GET_TOKEN_API_URL = `${SITE_BASE}/api/get-token`;
export const REDIRECT_TO_AUTHORIZATION_API_URL = `${SITE_BASE}/api/redirect-to-authorization`;

export const REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/meetings.space.created",
];

export function getMissingScopes(scopes: string): string[] {
  return REQUIRED_SCOPES.filter((scope) => !scopes.includes(scope));
}

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */

// Holds tokens of a user. That's why we need to create a new instance for everyone
export const createOauth2Client = () =>
  new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    // TODO Necessary?
    GET_TOKEN_API_URL,
  );

export const db = new Firestore({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE,
  databaseId: "meetings",
});
export const SESSION_ID_NAME = "session-id";
