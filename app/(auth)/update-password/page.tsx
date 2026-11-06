import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { updatePassword } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireUser } from "@/server/auth/user";
import { PASSWORD_RECOVERY_COOKIE, verifyRecoveryProof } from "@/server/auth/recovery-proof";

export const metadata = { title: "Choose a new password" };

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user } = await requireUser();
  const cookieStore = await cookies();
  if (!verifyRecoveryProof(cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value, user.id)) {
    redirect("/dashboard");
  }
  const { error } = await searchParams;
  return (
    <main
      id="main-content"
      className="auth-shell flex min-h-screen items-center justify-center px-5 py-12"
    >
      <Card className="w-full max-w-lg">
        <CardHeader>
          <p className="eyebrow">Recovery session</p>
          <h1 className="font-display text-3xl font-bold">Choose a new password</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The recovery link established a short-lived authenticated session.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div role="alert" className="mb-5 rounded-2xl bg-red-50 p-4 text-sm text-red-900">
              {error}
            </div>
          )}
          <form action={updatePassword} className="space-y-5">
            <PasswordField id="new-password" name="password" label="New password" />
            <PasswordField id="confirm-password" name="confirmPassword" label="Confirm password" />
            <Button className="w-full" type="submit">
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function PasswordField({ id, name, label }: { id: string; name: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
    </div>
  );
}
