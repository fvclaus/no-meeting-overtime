'use client';

import { useEffect, useState } from 'react';
import {
  meet,
  MeetSidePanelClient,
} from '@googleworkspace/meet-addons/meet.addons';
import { CLOUD_PROJECT_NUMBER } from '../../shared/constants';

/**
 * This page displays in the Side Panel after the activity has started to allow
 * each call participant to modify the base color of the main stage animation.
 */
export default function Page() {
  const [sidePanelClient, setSidePanelClient] = useState<MeetSidePanelClient>();
  var searchParams = new URLSearchParams(window.location.search);
  const endTime = searchParams.get("endTime");

  /**
   * Sends a newly chosen color to the main stage, using frame-to-frame
   * messaging.
   * @param newColor Hex code of the new color.
   */
  async function updateColor(newColor: string) {
    if (!sidePanelClient) {
      throw new Error('Side Panel is not yet initialized!');
    }

    await sidePanelClient.notifyMainStage(newColor);
  }

  const [timeRemaining, setTimeRemaining] = useState<number|undefined>(undefined);


  // useEffect(() => {
  //   const timerInterval = setInterval(() => {
  //     setTimeRemaining((prevTime) => {
  //       if (prevTime === 0) {
  //         clearInterval(timerInterval);
  //         // Perform actions when the timer reaches zero
  //         console.log('Countdown complete!');
  //         return 0;
  //       } else {
  //         return prevTime - 1;
  //       }
  //     });
  //   }, 1000);

  //   // Cleanup the interval when the component unmounts
  //   return () => clearInterval(timerInterval);
  // }, []);

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

  return (
    <>
      <span> Meeting will end at { endTime } </span>
    </>
  );
}
