import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark />
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-[-0.02em]">Repair & Reuse</span>
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              AI design studio
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="order-3 w-full sm:order-none sm:w-auto">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground sm:justify-center">
            <li>
              <Link className="nav-link" href="/#how-it-works">
                How it works
              </Link>
            </li>
            <li>
              <Link className="nav-link" href="/#safety">
                Safety
              </Link>
            </li>
            <li>
              <Link className="nav-link" href="/dashboard">
                Demo dashboard
              </Link>
            </li>
          </ul>
        </nav>

        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
