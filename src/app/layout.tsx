import "./styles.css";
import { loadUserInfo } from "./loadUserInfo";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Footer } from "./Footer";
import UserMenu from "./UserMenu";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userinfo = await loadUserInfo();

  return (
    <html lang="en">
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
        <main className="mt-10 mb-10">{children}</main>
        <Footer></Footer>
      </body>
    </html>
  );
}
