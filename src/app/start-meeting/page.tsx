import { deleteSessionKey, getSessionKey, getCredentials, setOrThrowSessionKey, getSessionOrThrow } from '@/session-store';
import MeetingAdministration from './_components/meeting-admin';
import { UserInfo } from './_components/types';
import { google } from 'googleapis';
import { getMissingScopes, REDIRECT_TO_AUTHORIZATION_API_URL } from '@/shared/constants';
import { loadUserInfo } from '../loadUserInfo';
import { redirect } from 'next/navigation';
/**
 * @see {@link https://developers.google.com/meet/add-ons/guides/overview#side-panel}
 */
export default async function Page() {

  const userInfo = await loadUserInfo();

  if (!userInfo.authenticatedWithRequiredScopes) {
    redirect('/');
  }

  return <>
      <MeetingAdministration userInfo={userInfo}></MeetingAdministration>
    </>
}

