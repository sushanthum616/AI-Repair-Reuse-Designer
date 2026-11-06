import Link from "next/link";
import { FolderPlus, Settings, Sparkles } from "lucide-react";

import { signOut } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireUser } from "@/server/auth/user";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: projects, error }] = await Promise.all([
    supabase.from("profiles").select("display_name,account_state").eq("id", user.id).single(),
    supabase
      .from("projects")
      .select("id,title,status,item_type,updated_at")
      .order("updated_at", { ascending: false }),
  ]);
  if (error) throw error;
  const { notice } = await searchParams;

  return (
    <div className="min-h-screen bg-[#f1f3ec]">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark /> Repair & Reuse
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {profile?.display_name ?? user.email}
            </span>
            <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Settings aria-hidden="true" className="size-4" /> Settings
            </Link>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14"
      >
        {notice && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            {notice}
          </div>
        )}
        {profile?.account_state === "deleting" && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          >
            Account deletion is paused or awaiting retry. New work is blocked by the database. Open
            settings to retry safely.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Private workspace</p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">
              Your repair projects
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Only records authorized for your verified account can appear here.
            </p>
          </div>
          <Button size="lg" disabled>
            <FolderPlus aria-hidden="true" className="size-4" /> New project arrives in M4
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="mt-10 border-dashed bg-background/70">
            <CardContent className="py-14 text-center">
              <Sparkles aria-hidden="true" className="mx-auto size-8 text-primary" />
              <h2 className="mt-4 font-display text-2xl font-bold">
                Your private workspace is ready
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                M3 established the account and authorization boundary. Project creation and secure
                image uploads arrive in M4.
              </p>
              <Link href="/demo" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
                Explore the public demo
              </Link>
            </CardContent>
          </Card>
        ) : (
          <section aria-labelledby="owned-projects" className="mt-10">
            <h2 id="owned-projects" className="text-lg font-bold">
              Owned projects
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      {project.status}
                    </p>
                    <h3 className="font-display text-xl font-bold">{project.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {project.item_type ?? "Item details pending"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
