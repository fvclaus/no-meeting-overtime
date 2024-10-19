'use client';

import { meet_v2 } from "googleapis";
import { useForm } from "react-hook-form";
import { Meeting } from "./types";
import { set } from "date-fns";
import { Button, FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";

type FormValues = {
    endTime: string;
  };

export default function CreateMeeting({meetingCreated}: {meetingCreated: (space: Meeting) => void}) {

    const { register, handleSubmit, formState: { errors, isValid  } } = useForm<FormValues>();
  
    // TODO
    // Force new session, because we can't distinguish between different Google Accounts in one browser.
  
    async function createMeeting(data: FormValues) {
        const url = `/api/meeting/start/`
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
    
          const json = await response.json() as meet_v2.Schema$Space;
          console.log(json);
          const date = new Date();
          const [hours, minutes] = data.endTime.split(":").map(s => parseInt(s));
          const endTime = set(new Date(), {hours, minutes, seconds: 0, milliseconds: 0} );
          meetingCreated({
            ...json,
            scheduledEndTime: endTime
          });
        } catch (error) {
          console.error(error);
        }
  
        return false;
    }
  
    return (
        <>

          <form onSubmit={handleSubmit(createMeeting)}>
            <FormControl>
          <FormLabel>
            Create a new meeting with end time
          </FormLabel>
          <Input
            type="time"
            {...register("endTime", {
                required: true
            })}
            />
            {errors.endTime && <FormErrorMessage>This is a required field</FormErrorMessage>}
            </FormControl>
          <Button
          disabled= {!isValid}
          >Create meeting</Button>
          
          </form>
        </>
      );
}