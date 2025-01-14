import { Title } from "@/components/ui/title";
import "./style.css";
import Link from "../Link";
import {
  SESSION_ID_NAME,
  MEETINGS_URL,
  SETTINGS_URL,
} from "@/shared/constants";
import { Shield } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Title
        title="Privacy Policy"
        subtitle="Information on data collection, usage, and protection practices"
        icons={[Shield]}
      />
      <div className="w-full bg-blue-50 py-16 text-gray-600">
        <article
          id="privacy-policy"
          className="mx-auto rounded-lg w-full max-w-screen-lg bg-white rounded-2xl shadow-xl p-8"
        >
          <p>
            This website is a hobby project to learn some new technologies. It
            is developed and provided by me as an individual:
          </p>
          <p>Frederik Claus, f.v.claus@googlemail.com</p>
          <section>
            <h2>What data is collected?</h2>
            <ul>
              <li>
                <p>
                  Personal identification information provided by Google login
                  including first- and last name, profile picture and unique
                  user id
                </p>
              </li>
              <li>
                <p>
                  Data about Google Meet conferences started through this
                  website. Including the meeting code and the scheduled end
                  time.
                </p>
              </li>
              <li>
                <p>
                  Log Data that include your IP address, device information,
                  browser type, and settings. This information is not connected
                  with your account
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2>When is your data collected?</h2>
            <ul>
              <li>
                <p>
                  When you use the "Sign in with Google" social media login.
                </p>
              </li>
              <li>
                <p>
                  When you interact with the website in general and specifically
                  when you create conferences
                </p>
              </li>
            </ul>
          </section>
          <section>
            <h2>How is your data used?</h2>
            <p>
              Your data is used create and manage meetings on your behalf. The
              log data is used to identify problems with the website.
            </p>
          </section>

          <section>
            <h2>How and where is your data stored?</h2>
            <p>
              The data is stored in a Google Firestore in the eur3 region which
              includes data centers in Belgium and the Netherlands. See the{" "}
              <Link
                target="_blank"
                href="https://firebase.google.com/docs/firestore/locations"
              >
                official documentation
              </Link>{" "}
              for more details. Google Cloud Firestore encrypts data both{" "}
              <Link
                href="https://firebase.google.com/support/privacy#data_encryption"
                target="_blank"
              >
                in transit and at rest
              </Link>
              . The data is kept as long as you have an account with us.
            </p>
          </section>
          <section>
            <h2>Is my data transferred or disclosed to third parties?</h2>
            <p>
              No, your data is not transferred or disclosed to third parties for
              purposes other than the ones provided.
            </p>
          </section>
          <section>
            <h2>How can I access/rectify/erase/restrict my data?</h2>
            <p>
              You can <Link href={MEETINGS_URL}>access</Link> and{" "}
              <Link href={SETTINGS_URL}>delete</Link> your data at any time.
            </p>
          </section>
          <section>
            <h2>What cookies are used?</h2>
            <p>
              A session cookie called "{SESSION_ID_NAME}" is used to
              authenticate you as a user.
            </p>
          </section>
          <section>
            <h2>Changes to the privacy policy</h2>
            <p>
              The privacy policy is kept under regular review. This privacy
              policy was last updated on 14 January 2025.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
