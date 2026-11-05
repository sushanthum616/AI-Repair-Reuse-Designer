import { ArrowUpRight, Camera, Check, Leaf, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const suggestions = [
  {
    title: "Visible-mend weave",
    description: "Highlight the repair with a contrasting natural cord pattern.",
    icon: Sparkles,
  },
  {
    title: "Seat insert reuse",
    description: "Reuse a textile offcut as a removable upholstered panel.",
    icon: Leaf,
  },
];

export function RepairPreview() {
  return (
    <div
      className="relative mx-auto w-full max-w-xl"
      aria-label="Illustrative repair analysis preview"
    >
      <div className="absolute -inset-5 -z-10 rounded-[3rem] bg-primary/10 blur-3xl" />
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-foreground p-3 shadow-2xl shadow-foreground/20">
        <div className="rounded-[1.45rem] bg-[#f7f4ea] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="warning">Illustrative preview</Badge>
            <span className="text-xs font-semibold text-muted-foreground">No image uploaded</span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[0.82fr_1.18fr]">
            <div className="repair-object relative min-h-52 overflow-hidden rounded-2xl border border-border/70 bg-[#dce8d4]">
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <Camera aria-hidden="true" className="size-3.5" />
                Sample item
              </div>
              <div className="chair-illustration" aria-hidden="true">
                <span className="chair-back" />
                <span className="chair-seat" />
                <span className="chair-leg chair-leg-left" />
                <span className="chair-leg chair-leg-right" />
              </div>
              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-foreground/90 px-3 py-2 text-xs text-background">
                <span className="font-semibold">Observed:</span> split seat weave; frame condition
                unknown
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Example directions
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-foreground">
                    Two ways forward
                  </h2>
                </div>
                <ShieldCheck aria-hidden="true" className="size-6 text-primary" />
              </div>

              {suggestions.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <p className="flex items-center gap-1 text-sm font-bold">
                        {title}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-2 rounded-xl bg-[#eef4e8] p-3 text-xs leading-5 text-foreground">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                The real product will ask about frame stability before suggesting instructions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
