export interface UserInfo {
  id?: string;
  name?: string;
  picture?: string;
  scope?: string;
  authenticated: boolean;
  hasAcceptedPrivacyPolicy: boolean;
}

export interface Meeting {
  scheduledEndTime: string;
  name: string;
  userId: string;
  uri: string;
}
