import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackathon Starter",
  description: "A collaborative hackathon project starter.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">Hackathon Starter</Link>
          <nav aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/feature-1">Feature 1</Link>
            <Link href="/feature-2">Feature 2</Link>
            <Link href="/feature-3">Feature 3</Link>
            <Link href="/feature-4">Feature 4</Link>
            <Link href="/login">Profile</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
