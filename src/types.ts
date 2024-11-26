
export interface UserInfo {
   id?: string;
   name?: string;
   picture?: string;
   scope?: string;
   authenticated: boolean;
}

export interface Meeting {
   scheduledEndTime: string;
   name: string;
   userId: string;
   uri: string;
}

