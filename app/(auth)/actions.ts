"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { runAccountDeletion } from "@/server/account/delete-account";
import { createSupabaseDeletionRepository } from "@/server/account/supabase-deletion-repository";
import { safeInternalPath } from "@/server/auth/redirect";
import {
  createRecoveryIntent,
  PASSWORD_RECOVERY_COOKIE,
  verifyRecoveryProof,
} from "@/server/auth/recovery-proof";
import { getApplicationOrigin } from "@/server/env";
import { createAdminSupabaseClient } from "@/server/supabase/admin";
import { createServerSupabaseClient } from "@/server/supabase/server";

const emailSchema = z.email().max(320);
const passwordSchema = z.string().min(8).max(72);

export async function signIn(formData: FormData) {
  const parsed = z
    .object({ email: emailSchema, password: passwordSchema })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect(withMessage("/sign-in", "error", "Enter a valid email and password."));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(withMessage("/sign-in", "error", "Email or password is incorrect."));

  redirect(safeInternalPath(formData.get("next")?.toString()));
}

export async function signUp(formData: FormData) {
  const parsed = z
    .object({
      displayName: z.string().trim().min(1).max(80),
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(withMessage("/sign-in", "error", "Check the registration fields."));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${getApplicationOrigin()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) redirect(withMessage("/sign-in", "error", "Registration could not be completed."));
  redirect(withMessage("/sign-in", "notice", "Check your email to confirm the account."));
}

export async function requestPasswordReset(formData: FormData) {
  const email = emailSchema.safeParse(formData.get("email"));
  if (email.success) {
    const supabase = await createServerSupabaseClient();
    const callback = new URL("/auth/callback", getApplicationOrigin());
    callback.searchParams.set("next", "/update-password");
    callback.searchParams.set("recovery", createRecoveryIntent());
    await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: callback.toString(),
    });
  }
  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const parsed = z
    .object({ password: passwordSchema, confirmPassword: passwordSchema })
    .refine((values) => values.password === values.confirmPassword)
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect(
      withMessage(
        "/update-password",
        "error",
        "Passwords must match and use at least 8 characters.",
      ),
    );

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const cookieStore = await cookies();
  if (!verifyRecoveryProof(cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value, user.id)) {
    redirect("/dashboard");
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error)
    redirect(withMessage("/update-password", "error", "The password could not be updated."));
  cookieStore.delete(PASSWORD_RECOVERY_COOKIE);
  redirect(withMessage("/dashboard", "notice", "Password updated."));
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const parsed = z
    .object({
      displayName: z.string().trim().min(1).max(80),
      locale: z.enum(["en", "en-US", "en-GB", "en-CA", "en-AU"]),
      skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(withMessage("/settings", "error", "Check the profile fields."));

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      locale: parsed.data.locale,
      skill_level: parsed.data.skillLevel,
    })
    .eq("id", user.id);
  if (error) redirect(withMessage("/settings", "error", "Profile changes could not be saved."));
  redirect(withMessage("/settings", "notice", "Profile saved."));
}

export async function deleteAccount(formData: FormData) {
  const parsed = z
    .object({ confirmation: z.literal("DELETE"), currentPassword: passwordSchema })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect(withMessage("/settings", "error", "Enter your current password and the word DELETE."));

  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user?.email) redirect("/sign-in");
  const { error: reauthenticationError } = await userClient.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (reauthenticationError)
    redirect(withMessage("/settings", "error", "Current password verification failed."));

  const repository = createSupabaseDeletionRepository(userClient, createAdminSupabaseClient());
  try {
    await runAccountDeletion(repository, user.id);
  } catch {
    redirect(
      withMessage(
        "/settings",
        "error",
        "Deletion is paused safely. Sign in again to retry; no new work can be created.",
      ),
    );
  }
  await userClient.auth.signOut();
  redirect("/?accountDeleted=1");
}

function withMessage(path: string, kind: "error" | "notice", message: string) {
  return `${path}?${new URLSearchParams({ [kind]: message }).toString()}`;
}
