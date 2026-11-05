import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Sign in preview",
};

export default function SignInPage() {
  return (
    <main id="main-content" className="auth-shell min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back home
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold">
          <BrandMark className="size-8" />
          Repair & Reuse
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center gap-12 py-12 lg:grid-cols-[1fr_0.82fr]">
        <section className="max-w-xl">
          <p className="eyebrow">Account preview</p>
          <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl">
            Your repair history, kept together.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Authentication arrives in M3. This page demonstrates the intended layout without
            sending, saving, or validating credentials.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-secondary/70 p-4 text-sm leading-6">
            <LockKeyhole aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            Private projects, images, plans, and conversations will be protected by Supabase Auth
            and Row Level Security before account access is enabled.
          </div>
        </section>

        <Card className="bg-background/90 backdrop-blur">
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">M2 shell</p>
            <h2 className="font-display text-2xl font-semibold leading-none tracking-tight">
              Sign in
            </h2>
            <p id="auth-unavailable" className="text-sm leading-6 text-muted-foreground">
              Controls are disabled because authentication is not connected yet.
            </p>
          </CardHeader>
          <CardContent>
            <div aria-describedby="auth-unavailable" aria-labelledby="sign-in-fields" role="group">
              <p id="sign-in-fields" className="sr-only">
                Disabled sign-in fields
              </p>
              <fieldset disabled className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <Button className="w-full" size="lg" disabled>
                  Authentication arrives in M3
                </Button>
              </fieldset>
            </div>
            <p className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
              Want to explore now?{" "}
              <Link
                className="font-semibold text-primary underline-offset-4 hover:underline"
                href="/dashboard"
              >
                Open the public demo
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
