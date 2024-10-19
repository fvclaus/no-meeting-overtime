'use client';


import { getMissingScopes, REDIRECT_TO_AUTHORIZATION_API_URL } from "@/shared/constants";
import { formatISO, set } from "date-fns";
import { meet_v2 } from "googleapis";
import { FormEvent, useState } from "react";
import { useForm } from "react-hook-form";
import CreateMeeting from "./meeting-creation";
import { MeetingList } from "./meeting-list";
import { Meeting, UserInfo } from "./types";
import { Text, Avatar, Button, Stack, Flex } from "@chakra-ui/react";


export default function MeetingAdministration({userInfo}: {userInfo: UserInfo}) {
    const [currentMeetingSpace, setCurrentMeetingSpace] = useState<Meeting | undefined>();

    function meetingCreated(space: Meeting) {
      setCurrentMeetingSpace(space);
    }

    function endedMeeting(meeting: Meeting) {
      setCurrentMeetingSpace(undefined);
      alert(`Meeting ${meeting.meetingCode} ended at ${formatISO(meeting.actualEndTime!)}`);
    }

    const missingScopes = userInfo.scope !== undefined? getMissingScopes(userInfo.scope) : [];

    function authenticate() {
      window.location.href = REDIRECT_TO_AUTHORIZATION_API_URL;
    }
  
    if (!userInfo.authenticated || missingScopes.length > 0) {
      return <>
          {missingScopes.length > 0 &&
           <p>The following scopes are missing, but required: 
            <ul>
            {missingScopes.map(scope => <li>{scope}</li>)}
            </ul>
           </p>
          }
          <Stack spacing={6} direction={'row'}>
          <Button
            rounded={'full'}
            px={6}
            colorScheme={'orange'}
            onClick={authenticate}
            bg={'orange.400'}
            _hover={{ bg: 'orange.500' }}>
            Sign in with Google to get started
          </Button>
        </Stack>
      </>;
    } else if (currentMeetingSpace !== undefined) {
      return (<>
          <MeetingList newMeeting={currentMeetingSpace} endedMeeting={endedMeeting}></MeetingList>
        </>
      );
    } else {
      return (       <>
      <Flex>
       {userInfo.name && 
          <Text fontSize='3xl'>Welcome, {userInfo.name}!</Text>
        }
        {userInfo.picture &&
        <Avatar src={userInfo.picture} size="lg" />
        }
        </Flex>
      <CreateMeeting meetingCreated={meetingCreated}></CreateMeeting>
      </>);
    }
    // else if (endTime !== undefined && timeRemaining !== undefined) {
    //   return (
    //     <>
    //       <p> Meeting will end in { formatTimeRemaining(timeRemaining) } at { formatISO(endTime) } </p>
    //       {meetingInfo?.isOwner && 
    //       <p>Because you are the owner, we will end the meeting for everyone</p>
    //       }
    //       {!meetingInfo?.isOwner && 
    //       <p>Because you are not the owner or there is some technical problem, we will just close the tab.</p>
    //       }
    //     </>
    //   )
    //   // TODO Loading spinner
  
    // }
}