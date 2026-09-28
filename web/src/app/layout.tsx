import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Currents", template: "%s · Currents" },
  description: "Curated timelines of primary sources that explain the history behind current events.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="logo">
              Curr<span>e</span>nts
            </Link>
            <nav className="nav" aria-label="Main">
              <Link href="/">Browse</Link>
              {user ? (
                <>
                  <Link href="/timelines/new">New timeline</Link>
                  <Link href="/dashboard">Dashboard</Link>
                  <form action={logout}>
                    <button type="submit" className="secondary">
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Log in</Link>
                  <Link href="/signup" className="btn">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main>
          <div className="container">{children}</div>
        </main>
      </body>
    </html>
  );
}
