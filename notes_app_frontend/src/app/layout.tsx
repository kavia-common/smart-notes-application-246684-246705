import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Notes",
  description: "A modern notes application with search and tags.",
};

// PUBLIC_INTERFACE
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /** Global root layout for the Next.js application. */
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
