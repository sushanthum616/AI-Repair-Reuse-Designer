import Link from "next/link";
import { PackageOpen } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState() {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-border bg-background/70 p-8 text-center">
      <PackageOpen aria-hidden="true" className="mx-auto size-8 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">No projects here yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        This is the empty state real accounts will see after authentication is implemented in M3.
      </p>
      <Link
        href="/#how-it-works"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5")}
      >
        See how projects will work
      </Link>
    </section>
  );
}
