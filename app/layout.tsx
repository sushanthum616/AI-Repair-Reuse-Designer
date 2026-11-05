import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Repair & Reuse Designer",
    template: "%s · Repair & Reuse Designer",
  },
  description:
    "Explore thoughtful repair and reuse directions for damaged everyday items. AI suggests. You decide.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
