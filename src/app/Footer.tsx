import React from "react";
import Link from "./Link";
import { PRIVACY_POLICY_URL, REPORT_ISSUE_URL } from "@/shared/constants";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-8">
          <Link href={PRIVACY_POLICY_URL} variant="footer">
            Privacy Policy
          </Link>
          <Link href={REPORT_ISSUE_URL} variant="footer">
            Report an Issue
          </Link>
          {/* TODO */}
          {/* <Link href="/about" variant="footer">
            About
          </Link> */}
        </div>
      </div>
    </footer>
  );
}
