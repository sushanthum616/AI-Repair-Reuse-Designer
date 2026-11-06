import Link from "next/link";

import { requestPasswordReset } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  return (
    <main
      id="main-content"
      className="auth-shell flex min-h-screen items-center justify-center px-5 py-12"
    >
      <Card className="w-full max-w-lg">
        <CardHeader>
          <p className="eyebrow">Account recovery</p>
          <h1 className="font-display text-3xl font-bold">Reset your password</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            For privacy, the response is the same whether or not an account exists.
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div role="status" className="rounded-2xl bg-secondary p-4 text-sm leading-6">
              If an account matches that email, a recovery link has been sent. Local links appear in
              Mailpit.
            </div>
          ) : (
            <form action={requestPasswordReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email address</Label>
                <Input
                  id="recovery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <Button className="w-full" type="submit">
                Send recovery link
              </Button>
            </form>
          )}
          <Link
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
            href="/sign-in"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
