import { ArrowUpRight, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoProject } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

const accentStyles = {
  fern: "from-[#b8d6a7] to-[#eff5e9]",
  clay: "from-[#e9b493] to-[#fbede4]",
  sun: "from-[#f4d672] to-[#fff7d2]",
} satisfies Record<DemoProject["accent"], string>;

export function ProjectCard({ project }: { project: DemoProject }) {
  return (
    <Card className="group overflow-hidden">
      <div className={cn("relative h-32 bg-gradient-to-br", accentStyles[project.accent])}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.75),transparent_35%)]" />
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-5 text-5xl font-black tracking-[-0.08em] text-foreground/70"
        >
          {String(project.progress).padStart(2, "0")}
        </span>
        <Badge variant="outline" className="absolute right-4 top-4 bg-background/80 backdrop-blur">
          Sample project
        </Badge>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {project.status}
            </p>
            <CardTitle className="mt-2">{project.title}</CardTitle>
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{project.item}</p>
        <div className="mt-5" aria-label={`${project.progress}% illustrative progress`}>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span>Example progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 border-t border-border/70 pt-5 text-xs text-muted-foreground">
        <Clock3 aria-hidden="true" className="size-3.5" />
        {project.updatedLabel}
      </CardFooter>
    </Card>
  );
}
