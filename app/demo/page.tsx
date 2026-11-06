import Link from "next/link";
import { ArrowLeft, FolderPlus, LayoutGrid, ListFilter, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { ProjectCard } from "@/components/dashboard/project-card";
import { FixtureBanner } from "@/components/shared/fixture-banner";
import { buttonVariants } from "@/components/ui/button";
import { demoProjects } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

export const metadata = { title: "Public product demo" };

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f1f3ec]">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link
            href="/"
            aria-label="Repair & Reuse home"
            className="flex items-center gap-3 rounded-lg font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark />
            Repair & Reuse
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-900">
              Public demo
            </span>
            <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to overview
        </Link>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Workspace preview</p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">
              Your repair projects
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              A future home for ideas, plan versions, progress, and the questions that come up along
              the way.
            </p>
          </div>
          <button
            type="button"
            disabled
            aria-describedby="create-project-note"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <FolderPlus aria-hidden="true" className="size-4" />
            New project in M4
          </button>
        </div>
        <p id="create-project-note" className="mt-2 text-xs text-muted-foreground lg:text-right">
          Project creation is unavailable in this public preview.
        </p>

        <div className="mt-8">
          <FixtureBanner />
        </div>

        <section aria-labelledby="sample-projects" className="mt-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LayoutGrid aria-hidden="true" className="size-5 text-primary" />
              <h2 id="sample-projects" className="text-lg font-bold">
                Illustrative projects
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">
              <ListFilter aria-hidden="true" className="size-3.5" />
              Showing all sample states
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {demoProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[2rem] bg-foreground px-6 py-8 text-background sm:px-8 sm:py-10">
          <div className="grid items-center gap-7 md:grid-cols-[auto_1fr_auto]">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Sparkles aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.03em]">
                What becomes real next
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-background/70">
                M3 adds private accounts and authorization. M4 turns this shell into project
                creation and secure image upload.
              </p>
            </div>
            <Link
              href="/#how-it-works"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-background/30 bg-transparent text-background hover:bg-background/10",
              )}
            >
              Review the flow
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
