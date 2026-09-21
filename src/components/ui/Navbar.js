"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch {
      // silent
    }
    setMenuOpen(false);
    setMobileMenuOpen(false);
  };

  if (pathname.startsWith("/f/")) {
    return null;
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="FormCraft Home">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white text-xs font-bold tracking-tight" aria-hidden="true">
              F
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">FormCraft</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="FormCraft Home">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white text-xs font-bold tracking-tight" aria-hidden="true">
            F
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">FormCraft</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <div className="hidden md:flex md:items-center md:gap-1">
            {user ? (
              <>
                <Link
                  href="/forms"
                  className="px-3 py-1.5 text-[13px] font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-muted transition-colors"
                >
                  My Forms
                </Link>
                <Link
                  href="/forms/new"
                  className="ml-1 rounded-md bg-foreground px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-foreground/90"
                >
                  New Form
                </Link>
                <div className="relative ml-2">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <span className="hidden sm:block truncate max-w-[120px]">{user.name}</span>
                    <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                      />
                      <div className="absolute right-0 mt-1.5 w-52 rounded-lg border border-border bg-white shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-[13px] font-medium truncate">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:bg-muted"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-[13px] font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="ml-1 rounded-md bg-foreground px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-foreground/90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-white animate-in slide-in-from-top duration-150"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-5 py-4 space-y-1">
            {user ? (
              <>
                <div className="px-2 py-2 mb-2 border-b border-border">
                  <p className="text-[13px] font-medium">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <Link
                  href="/forms"
                  className="block px-3 py-2 rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Forms
                </Link>
                <Link
                  href="/forms/new"
                  className="block px-3 py-2 rounded-md text-[13px] font-medium text-foreground bg-foreground/5 hover:bg-foreground/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  New Form
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-[13px] font-medium text-foreground bg-foreground/5 hover:bg-foreground/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
