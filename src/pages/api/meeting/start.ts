import { getCredentials } from "@/session-store";
import { createOauth2Client, KEY_FILE, PROJECT_ID } from "@/shared/server_constants";
import { google, meet_v2 } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import {Firestore} from '@google-cloud/firestore';

const db = new Firestore({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE,
});


// TODO Typing
type Response =  meet_v2.Schema$Space | {
    error: unknown;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    const oauthClient = await getCredentials(req);

    if (oauthClient === undefined) {
        res.status(403).end("No credentials in session");
    }

    try {
        const space = await google.meet('v2')
            .spaces.create({
                auth: oauthClient
            });
        const docRef = db.collection("users").doc("alovelace");
        // Add document data  with id "alovelace" using a hashmap
        await docRef.set({
            first: 'Ada',
            last: 'Lovelace',
            born: 1815
        });
        return res.json(
            space.data
        );
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: 'Creation failed'
        })
    }
    
 
}