import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { signIn, signUp } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const message = await searchParams;

  return (
    <main id="main-content" className="auth-shell min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Back home
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold">
          <BrandMark className="size-8" /> Repair & Reuse
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-10 py-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <section className="max-w-lg lg:sticky lg:top-10">
          <p className="eyebrow">Private workspace</p>
          <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl">
            Your repair history, kept together.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Create a private account or return to projects protected by Supabase Auth and Row Level
            Security.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-secondary/70 p-4 text-sm leading-6">
            <LockKeyhole aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            Every authenticated query is still checked by database policy; route protection is not
            the privacy boundary.
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Want to look around first?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/demo">
              Open the public demo
            </Link>
            .
          </p>
        </section>

        <div className="space-y-5">
          {(message.error || message.notice) && (
            <div
              role={message.error ? "alert" : "status"}
              className={`rounded-2xl border px-4 py-3 text-sm ${message.error ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
            >
              {message.error ?? message.notice}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <AuthCard title="Sign in" description="Continue to your private dashboard.">
              <form action={signIn} className="space-y-4">
                <input type="hidden" name="next" value={message.next ?? "/dashboard"} />
                <Field
                  id="sign-in-email"
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
                <Field
                  id="sign-in-password"
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                />
                <Button className="w-full" type="submit">
                  Sign in
                </Button>
              </form>
              <Link
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </AuthCard>

            <AuthCard
              title="Create account"
              description="Confirm your email before the first sign-in."
            >
              <form action={signUp} className="space-y-4">
                <Field
                  id="display-name"
                  label="Display name"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                />
                <Field
                  id="register-email"
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
                <Field
                  id="register-password"
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  Use at least 8 characters with letters and numbers.
                </p>
                <Button className="w-full" type="submit">
                  Create private account
                </Button>
              </form>
            </AuthCard>
          </div>
        </div>
      </div>
    </main>
  );
}

function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-background/90 backdrop-blur">
      <CardHeader>
        <h2 className="font-display text-2xl font-semibold leading-none tracking-tight">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} required {...props} />
    </div>
  );
}
