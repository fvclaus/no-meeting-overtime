# Pretty Colors: Next.js Add-on

TODO Fix Readme

This is a [Meet Add-on](https://developers.google.com/meet/add-ons/guides/overview) built in [Next.js](https://nextjs.org/). This add-on displays an animation that is intended to create a simple "shimmer" effect based on the color that each call participant selects. This add-on only exists to show more features of Google Meet Add-ons than can be found at [googleworkspace/meet/addons-web-sdk/samples/hello-world-next-js](https://github.com/googleworkspace/meet/tree/main/addons-web-sdk/samples/hello-world-next-js). If you find anything about the configuration confusing, please see that more basic example.

This add-on is deployed with GitHub pages, so that you can view the live versions of its [Side Panel](https://googleworkspace.github.io/meet/animation-next-js/sidepanel), [Main Stage](https://googleworkspace.github.io/meet/animation-next-js/mainstage), and all other routes. The screensharing promotion at the [index.html](https://googleworkspace.github.io/meet/animation-next-js/) will not fully work until this add-on is published.


## Environment Configuration

`PROJECT_ID` is the Google Cloud Project id

### Cloud Task configuration

- **Go to the [Google Cloud Console](https://console.cloud.google.com/).**
- **Select your project**
- Go to **IAM & Admin > Service Accounts**.
- Find the service account (e.g., `backend-app@no-meeting-overtime.iam.gserviceaccount.com`) and store it as `CLOUD_TASKS_SERVICE_ACCOUNT`
- Go to the **"Keys"** tab and create a new key and store the path to the service account key file in `KEY_FILE`
- Store the region of the queue in `QUEUE_LOCATION` (this is an input variable to terraform), its name is hardcoded in the terraform configuration
- The local dev server needs to be publicly available for Google Cloud Tasks to reach it (e.g. using ngrok). The public url must be stored in `SITE_BASE_CLOUD_TASKS`

### Google OAuth configuration

3. In the left sidebar, go to **APIs & Services > Credentials**.
4. Under **OAuth 2.0 Client IDs**, find your client (or create a new one by clicking **Create Credentials > OAuth client ID**).
5. Click on the client name to view details.
6. Copy the **Client ID** and **Client Secret** and paste them into your .env.local file as `CLIENT_ID` and `CLIENT_SECRET`.


## E2E Tests

They are a bit special, because they require an active Google login. An automated login is usually not possible, because of 2FA. Open a browser with `google-chrome-stable --remote-debugging-port=9222`. Make sure it doesn't respond with `Opening in existing browser session.`, meaning that a browser instance is already open. Login to a Google Account and set the email as env variable `GMAIL_USER`.
The tests cannot be started with the Playwright extension in vscode, because they always open a new browser window. Instead there are launch configurations.
For the tests to properly work, it is necesary to remove the check for a minimum meeting time with
```
NEXT_PUBLIC_MEETING_END_MINUTES_OFFSET="0"
```


Don't install glcoud from snap. You won't let you install the terraform extension
terraform can be installed from snap


`terraform plan`

`storage: object doesn't exist`? -> `gcloud auth application-default set-quota-project no-meeting-overtime`

`oauth2: "invalid_grant" "Token has been expired or revoked."`? -> `gcloud auth application-default login`

`failed precondition: due to quota restrictions, cannot run builds in this region, see https://cloud.google.com/build/docs/locations#restricted_regions_for_some_projects ` when building. Go to Quota > Cloud Build API > Concurrent Build CPUs (Regional Public Pool) per region per build_origin and request a value > 0