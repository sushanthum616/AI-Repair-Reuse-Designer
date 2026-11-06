import Link from "next/link";
import { ArrowLeft, Download, ShieldAlert } from "lucide-react";

import { deleteAccount, updateProfile } from "@/app/(auth)/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireUser } from "@/server/auth/user";

export const metadata = { title: "Account settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name,locale,skill_level,account_state,deletion_requested_at")
    .eq("id", user.id)
    .single();
  if (profileError) throw profileError;
  const message = await searchParams;
  const deleting = profile.account_state === "deleting";

  return (
    <main id="main-content" className="min-h-screen bg-[#f1f3ec] px-5 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to dashboard
        </Link>
        <p className="eyebrow mt-8">Private account</p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-[-0.05em]">
          Settings and privacy
        </h1>
        <p className="mt-3 text-muted-foreground">Signed in as {user.email}</p>
        {(message.error || message.notice) && (
          <div
            role={message.error ? "alert" : "status"}
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${message.error ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
          >
            {message.error ?? message.notice}
          </div>
        )}

        <div className="mt-8 grid gap-6">
          <Card>
            <CardHeader>
              <h2 className="font-display text-2xl font-bold">Profile</h2>
              <p className="text-sm text-muted-foreground">
                These are the only profile fields the authenticated role may update directly.
              </p>
            </CardHeader>
            <CardContent>
              <form action={updateProfile} className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    defaultValue={profile.display_name ?? ""}
                    required
                    disabled={deleting}
                  />
                </div>
                <SelectField
                  id="locale"
                  name="locale"
                  label="Locale"
                  defaultValue={profile.locale}
                  options={["en", "en-US", "en-GB", "en-CA", "en-AU"]}
                  disabled={deleting}
                />
                <SelectField
                  id="skillLevel"
                  name="skillLevel"
                  label="Skill level"
                  defaultValue={profile.skill_level ?? "beginner"}
                  options={["beginner", "intermediate", "advanced"]}
                  disabled={deleting}
                />
                <Button
                  className="sm:col-span-2 sm:justify-self-start"
                  type="submit"
                  disabled={deleting}
                >
                  Save profile
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-2xl font-bold">Export your data</h2>
              <p className="text-sm text-muted-foreground">
                Download a versioned JSON export of your profile and every owned project record.
              </p>
            </CardHeader>
            <CardContent>
              <a href="/api/account/export" className={buttonVariants({ variant: "outline" })}>
                <Download aria-hidden="true" className="size-4" /> Download account export
              </a>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldAlert aria-hidden="true" className="size-6 text-red-700" />
                <h2 className="font-display text-2xl font-bold">Delete account</h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Deletion first locks the account, removes application data, and only then removes
                the Auth identity. A failed cleanup remains retryable and blocks new writes.
              </p>
            </CardHeader>
            <CardContent>
              {deleting && (
                <div
                  role="alert"
                  className="mb-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950"
                >
                  Deletion began{" "}
                  {profile.deletion_requested_at
                    ? new Date(profile.deletion_requested_at).toLocaleString()
                    : "previously"}
                  . Re-enter your password to retry the same operation.
                </div>
              )}
              <form action={deleteAccount} className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmation">Type DELETE</Label>
                  <Input id="confirmation" name="confirmation" autoComplete="off" required />
                </div>
                <Button
                  className="bg-red-700 text-white hover:bg-red-800 sm:col-span-2 sm:justify-self-start"
                  type="submit"
                >
                  {deleting ? "Retry account deletion" : "Permanently delete account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function SelectField({
  id,
  name,
  label,
  defaultValue,
  options,
  disabled,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  options: string[];
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
