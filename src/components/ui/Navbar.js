"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/f/")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">
            F
          </div>
          FormCraft
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/forms"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            My Forms
          </Link>
          <Link
            href="/forms/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            New Form
          </Link>
        </nav>
      </div>
    </header>
  );
}
