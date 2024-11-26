// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Identifier for the Cloud Project that is used to configure this add-on's
 * manifest and Google Workspace Marketplace listing.
 * @see {@link https://cloud.google.com/resource-manager/docs/creating-managing-projects#identifying_projects}
 */
export const SITE_BASE = inDebugMode()
  ? 'http://localhost:3000'
  // TODO Variable?
  : 'http://google-meet-timer.vercel.app';

function inDebugMode() {
  return process.env.NEXT_PUBLIC_DEBUG === '1';
}

export const START_MEETING_URL = SITE_BASE + '/meeting/start';

export const GET_TOKEN_API_URL = SITE_BASE + '/api/get-token'
export const REDIRECT_TO_AUTHORIZATION_API_URL = SITE_BASE + '/api/redirect-to-authorization';


export const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.created',
];

export function getMissingScopes(scopes: string): string[] {
  return REQUIRED_SCOPES.filter(scope => !scopes.includes(scope));
}