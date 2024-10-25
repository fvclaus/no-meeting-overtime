import { useEffect, useState } from 'react';
import {
  meet,
  MeetingInfo,
  MeetSidePanelClient,
} from '@googleworkspace/meet-addons/meet.addons';
import {
  ACTIVITY_SIDE_PANEL_URL,
  MAIN_STAGE_URL,
  REDIRECT_TO_AUTHORIZATION_API_URL,
} from '../../shared/constants';
import { clearInterval, setTimeout } from 'timers';
import {authenticate} from '@google-cloud/local-auth';
import { deleteKey, get, set, getCredentials, setIfSession, expire } from '@/session-store';
import { NextApiRequest } from 'next';
import { cookies } from 'next/headers';
import MeetingAdministration from './_components/meeting-admin';
import { UserInfo } from './_components/types';
import { google } from 'googleapis';

interface PageData {
    isAuthenticated: boolean;
}

/**
 * @see {@link https://developers.google.com/meet/add-ons/guides/overview#side-panel}
 */
export default async function Page() {

  const oauth2Client = await getCredentials(cookies());
  let userinfo: UserInfo = {
    authenticated: false
  }
  let errorMessage = null;
  if (oauth2Client !== undefined) {
    try {

      const name = await get(cookies(), 'name');
      if (typeof name === 'string') {
        userinfo.name = name;
      }
      const picture = await get(cookies(), 'picture');
      if (typeof picture === 'string') {
        userinfo.picture = picture;
      }

      if (userinfo.name === undefined || userinfo.picture === undefined) {
        const response = await google.oauth2('v2')
        .userinfo.get({
          auth: oauth2Client
        })
        // TODO
        console.log(response);
  
        if (response.data.name) {
          setIfSession(cookies(), 'name', response.data.name);
          // TODO Expire
          // expire()
          userinfo.name = response.data.name;
        }
  
        if (response.data.picture) {
          setIfSession(cookies(), 'picture', response.data.picture)
          userinfo.picture = response.data.picture;
        }

      }
      // TODO Missing refresh_token error handling
      userinfo.authenticated = true;
      userinfo.scope = oauth2Client.credentials.scope;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'invalid_grant') {
          // TODO Drop refresh token
          deleteKey(cookies(), 'tokens');
        } else {
          // TODO Log this somehow
          console.log(e);
          errorMessage = e.message;
        }
      }
    }
  }

 return <>
    <MeetingAdministration userInfo={userinfo}></MeetingAdministration>
  </>
}

// export async function getServerSideProps({req} : {req: NextApiRequest}) {
    
//     // Pass data to the page via props
//     return { props: { isAuthenticated } }
//   }
