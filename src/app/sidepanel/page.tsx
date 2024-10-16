'use client';

import { useEffect, useState } from 'react';
import {
  meet,
  MeetSidePanelClient,
} from '@googleworkspace/meet-addons/meet.addons';
import {
  ACTIVITY_SIDE_PANEL_URL,
  CLOUD_PROJECT_NUMBER,
  MAIN_STAGE_URL,
  REDIRECT_TO_AUTHORIZATION_API_URL,
} from '../../shared/constants';
import { setTimeout } from 'timers';
import { differenceInSeconds, formatISO, set, setHours, setMinutes } from 'date-fns';
import {authenticate} from '@google-cloud/local-auth';

/**
 * @see {@link https://developers.google.com/meet/add-ons/guides/overview#side-panel}
 */
export default function Page() {
  const [sidePanelClient, setSidePanelClient] = useState<MeetSidePanelClient>();
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);

  /**
   * Starts the add-on activity and passes the selected color to the Main Stage,
   * as part of the activity starting state.
   */
  async function startCollaboration(e: unknown) {
    // if (!sidePanelClient) {
    //   throw new Error('Side Panel is not yet initialized!');
    // }

    const endTime = (
      document.getElementById('starting-color')! as HTMLInputElement
    ).value;
    console.log(`Setting endTime to ${endTime}`);
    const date = new Date();
    const [hours, minutes] = endTime.split(":").map(s => parseInt(s));
    setEndTime(set(new Date(), {hours, minutes} ));
    // await sidePanelClient.startActivity({
    //   mainStageUrl: MAIN_STAGE_URL,
    //   sidePanelUrl: ACTIVITY_SIDE_PANEL_URL,
    //   // Pass the selected color to customize the initial display.
    //   additionalData: `{\"endTime\": \"${endTime}\"}`,
    // });
    // var searchParams = new URLSearchParams(window.location.search);
    // searchParams.set("endTime", endTime);
    // console.log(searchParams, searchParams.toString());
    // window.location.search = searchParams.toString();
    // window.location.replace(ACTIVITY_SIDE_PANEL_URL + window.location.search);
  }

  const [timeRemaining, setTimeRemaining] = useState<number|undefined>(undefined);

  const formatTimeRemaining = (timeRemaining: number): string => {
    let remaining = timeRemaining;
    const hours = Math.floor(remaining / (60 * 60));
    remaining = remaining - (hours * 60 * 60);
    const minutes = Math.floor(remaining / 60);
    remaining = remaining - (minutes * 60);
    const seconds = remaining;
    return [hours, minutes, seconds].map(n => n.toString().padStart(2, '0')).join(":");
  }

  useEffect(() => {
    console.log("Starting interval");
    const timerInterval = setInterval(() => {
      console.log(`Looking at ${endTime}`);
      if (endTime !== undefined) {
        const diff = differenceInSeconds(endTime!, new Date());
        setTimeRemaining(diff);

        if (diff % 10 == 0) {
          console.log("Sending alert");
          alert('another minutes has elapsed');
        }

        console.log(`Setting diff to ${diff}`);
      }
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timerInterval);

  }, [endTime]);



  useEffect(() => {
    /**
     * Initializes the Add-on Side Panel Client.
     * https://developers.google.com/meet/add-ons/reference/websdk/addon_sdk.meetsidepanelclient
     */
    async function initializeSidePanelClient() {
      const session = await meet.addon.createAddonSession({
        cloudProjectNumber: CLOUD_PROJECT_NUMBER,
      });
      const client = await session.createSidePanelClient();
      setSidePanelClient(client);
    }
    initializeSidePanelClient();

  }, []);

  if (endTime == undefined)  {
    return (
      <>
        <label htmlFor="starting-color">
          Pick when this meeting should end
        </label>
        <input
          aria-label="Color picker for animation in main stage"
          type="time"
          id="starting-color"
          name="starting-color"
        />
        <br />
        <a href={REDIRECT_TO_AUTHORIZATION_API_URL} target="_blank">Permissions abholen</a>
        <button
          aria-label="Launch activity for all participants"
          onClick={startCollaboration}
        >
          Start timer
        </button>
      </>
    );
  } else if (endTime !== undefined && timeRemaining !== undefined) {
    return (
      <>
        <span> Meeting will end in { formatTimeRemaining(timeRemaining) } at { formatISO(endTime) } </span>
      </>
    )
    // TODO Loading spinner

  }
}
