# No Meeting Overtime

## What This Project Does

No Meeting Overtime is a web application designed to help you manage your Google Meet meetings more effectively. It allows you to set a predefined end time for your meetings, ensuring they conclude on schedule and helping you avoid meetings that run over. Users can sign in with their Google account to create and manage these timed meetings.

## Technologies Used

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (React Framework)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Services:**
    *   Google Meet APIs
    *   Google Cloud Firestore
*   **Development & Testing:**
    *   [Playwright](https://playwright.dev/) (for component testing)
    *   [Vitest](https://vitest.dev/) (for unit testing)
*   **Package Manager:**
    *   [pnpm](https://pnpm.io/) (deduced from `pnpm-lock.yaml`)

## How to Start the Project

To get the project running locally for development, follow these steps:

1.  **Install dependencies:**
    It's recommended to use `pnpm` as indicated by the `pnpm-lock.yaml` file.
    ```bash
    pnpm install
    ```
    *(If you prefer npm or yarn, you can try `npm install` or `yarn install`, but `pnpm` is preferred for consistency with the lock file.)*

3.  **Set up environment variables:**
    The google cloud libraries use ADC (application default credentials) for authentication: https://cloud.google.com/docs/authentication/application-default-credentials

4.  **Run the development server:**
    ```bash
    pnpm run dev
    ```
    This will start the Next.js development server
---

## Build and deploy locally

- Authenticate to the docker repository: https://cloud.google.com/artifact-registry/docs/docker/pushing-and-pulling#auth
- Make sure that your current configuration has an account linked: `gcloud config configuration list`
- Build: `docker build . -t europe-west1-docker.pkg.dev/no-meeting-overtime/repo/no-meeting-overtime:latest`
- Push: `docker push europe-west1-docker.pkg.dev/no-meeting-overtime/repo/no-meeting-overtime:latest`