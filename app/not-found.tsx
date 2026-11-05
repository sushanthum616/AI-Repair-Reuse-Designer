import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-5 py-12 text-center">
      <section aria-labelledby="not-found-title">
        <SearchX aria-hidden="true" className="mx-auto size-10 text-primary" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 id="not-found-title" className="mt-2 font-display text-4xl font-black tracking-tight">
          That project path is missing.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Return to the product preview or explore the public demo workspace.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className={buttonVariants()} href="/">
            Back home
          </Link>
          <Link className={buttonVariants({ variant: "outline" })} href="/dashboard">
            Open demo
          </Link>
        </div>
      </section>
    </main>
  );
}
