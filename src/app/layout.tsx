import "./styles.css";
import { loadUserInfo } from "./loadUserInfo";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Footer } from "./Footer";
import UserMenu from "./UserMenu";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { GOOGLE_ADS_ID } from "@/shared/constants";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userinfo = await loadUserInfo();

  return (
    <html lang="en">
      <head>
        <title>No Meeting Overtime</title>
        <meta
          name="description"
          content="Avoid meetings that go overtime. This app allows you to set an
                end time for your Google Meet meetings, ensuring they end on
                time."
        />
        <meta property="og:title" content="No Meeting Overtime" key="title" />
        <Script
          id="gtag-consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'security_storage': 'granted'
              });
            `,
          }}
        />
        <GoogleAnalytics gaId={GOOGLE_ADS_ID} />
      </head>
      <body className="flex-row">
        <div className="navbar bg-white border-b border-gray-100">
          <div className="flex-1">
            <Link className="btn btn-ghost text-xl" href="/">
              <Clock className="w-6 h-6 text-blue-700" />
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="font-space font-bold">No Meeting Overtime</span>
            </Link>
          </div>
          <div className="flex-none">
            {userinfo.authenticated && <UserMenu userinfo={userinfo} />}
          </div>
        </div>
        <main className="mt-10">{children}</main>
        <Footer></Footer>
      </body>
    </html>
  );
}
