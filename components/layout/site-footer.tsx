import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-foreground text-background">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] lg:px-10">
        <div className="flex max-w-lg items-start gap-3">
          <BrandMark className="text-accent" />
          <div>
            <p className="font-semibold">Repair & Reuse Designer</p>
            <p className="mt-1 text-sm leading-6 text-background/70">
              A decision-support concept for giving damaged things a thoughtful next chapter.
            </p>
          </div>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link className="footer-link" href="/">
            Home
          </Link>
          <Link className="footer-link" href="/demo">
            Demo
          </Link>
          <Link className="footer-link" href="/sign-in">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
