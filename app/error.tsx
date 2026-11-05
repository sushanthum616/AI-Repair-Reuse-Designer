"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-5 py-12">
      <section className="max-w-lg text-center" aria-labelledby="error-title">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
          <AlertTriangle aria-hidden="true" className="size-7" />
        </span>
        <h1 id="error-title" className="mt-6 font-display text-3xl font-bold tracking-tight">
          This page needs another try.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Nothing was submitted. Retry the page, and if the problem continues, return to the home
          screen.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </section>
    </main>
  );
}
