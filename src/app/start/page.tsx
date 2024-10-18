import { useEffect, useState } from 'react';
import {
  meet,
  MeetingInfo,
  MeetSidePanelClient,
} from '@googleworkspace/meet-addons/meet.addons';
import {
  ACTIVITY_SIDE_PANEL_URL,
  CLOUD_PROJECT_NUMBER,
  MAIN_STAGE_URL,
  REDIRECT_TO_AUTHORIZATION_API_URL,
} from '../../shared/constants';
import { clearInterval, setTimeout } from 'timers';
import { differenceInSeconds, formatISO, set, setHours, setMinutes } from 'date-fns';
import {authenticate} from '@google-cloud/local-auth';
import { get, getCredentials } from '@/session-store';
import { NextApiRequest } from 'next';
import { cookies } from 'next/headers';
import MeetingAdministration from './_components/meeting-admin';

interface PageData {
    isAuthenticated: boolean;
}

/**
 * @see {@link https://developers.google.com/meet/add-ons/guides/overview#side-panel}
 */
export default async function Page() {

  const oauth2Client = await getCredentials(cookies());
  // TODO Check scope
  const isAuthenticated = oauth2Client?.credentials.refresh_token !== undefined;

 
  return <>
    <MeetingAdministration isAuthenticated={isAuthenticated}></MeetingAdministration>
  </>
}

// export async function getServerSideProps({req} : {req: NextApiRequest}) {
    
//     // Pass data to the page via props
//     return { props: { isAuthenticated } }
//   }
