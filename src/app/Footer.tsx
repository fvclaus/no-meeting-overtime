import React from "react";
import Link from "./Link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-8">
          <Link href="/privacy-policy" variant="footer">
            Privacy Policy
          </Link>
          <Link href="/report" variant="footer">
            Report an Issue
          </Link>
          <Link href="/about" variant="footer">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
