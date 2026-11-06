import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GitCompareArrows,
  ImagePlus,
  Leaf,
  MessageCircleQuestion,
  PencilRuler,
  ShieldAlert,
  WandSparkles,
} from "lucide-react";

import { RepairPreview } from "@/components/landing/repair-preview";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Show the damage",
    description:
      "Add a clear photo and tell us what the item means to you, what tools you have, and what outcome you want.",
    icon: ImagePlus,
  },
  {
    number: "02",
    title: "Compare directions",
    description:
      "Review practical repairs, creative redesigns, uncertainty, and tradeoffs before choosing a direction.",
    icon: GitCompareArrows,
  },
  {
    number: "03",
    title: "Shape your plan",
    description:
      "Adjust style, budget, skill level, and materials, then follow a versioned plan at your own pace.",
    icon: PencilRuler,
  },
];

const promises = [
  "Options with tradeoffs, not a single verdict",
  "Clear uncertainty and stop conditions",
  "Plans shaped around your tools and skills",
  "Private projects and images by default",
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />
      <main id="main-content">
        <section className="relative isolate">
          <div className="hero-grid absolute inset-0 -z-20" aria-hidden="true" />
          <div className="absolute -left-40 top-16 -z-10 size-[30rem] rounded-full bg-secondary/55 blur-3xl" />
          <div className="absolute -right-40 top-0 -z-10 size-[28rem] rounded-full bg-accent/30 blur-3xl" />

          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-28">
            <div>
              <Badge variant="outline" className="bg-background/80">
                Thoughtful repair starts with better options
              </Badge>
              <h1 className="mt-7 max-w-3xl font-display text-5xl font-black leading-[0.97] tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
                See what your broken things could become.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Explore grounded repair and reuse directions shaped around the item, your skills,
                and your taste—while you stay in control of every decision.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" className={cn(buttonVariants({ size: "lg" }), "group")}>
                  Explore the product demo
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="#how-it-works"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  See how it works
                </Link>
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                M2 product preview · no account or image upload required
              </p>
            </div>
            <RepairPreview />
          </div>
        </section>

        <section className="border-y border-border/70 bg-foreground text-background">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[0.62fr_1.38fr] md:items-center lg:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                Our principle
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.04em]">
                AI suggests. You decide.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {promises.map((promise) => (
                <div key={promise} className="flex items-start gap-2 text-sm text-background/80">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                  {promise}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p className="eyebrow">A considered path</p>
              <h2 className="section-title">From damage to a direction worth trying.</h2>
              <p className="section-lede">
                The product is designed as a decision studio: it gathers context, makes uncertainty
                visible, and lets you refine a plan before any instruction begins.
              </p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {steps.map(({ number, title, description, icon: Icon }) => (
                <Card key={number} className="relative overflow-hidden bg-card/80">
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-1 font-display text-7xl font-black text-primary/70"
                  >
                    {number}
                  </span>
                  <CardHeader>
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <CardTitle className="mt-5">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#e8efe2] py-20 sm:py-28">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
            <div className="relative min-h-[25rem] overflow-hidden rounded-[2.25rem] border border-primary/15 bg-primary p-7 text-primary-foreground shadow-2xl shadow-primary/20">
              <div className="absolute -right-16 -top-16 size-64 rounded-full border-[40px] border-accent/20" />
              <div className="absolute -bottom-24 -left-16 size-72 rounded-full border-[48px] border-background/10" />
              <Badge className="relative bg-accent text-accent-foreground">
                Customization preview
              </Badge>
              <div className="relative mt-20 max-w-md">
                <WandSparkles aria-hidden="true" className="size-9 text-accent" />
                <p className="mt-5 font-display text-4xl font-bold leading-tight tracking-[-0.045em]">
                  Practical can still feel personal.
                </p>
                <p className="mt-4 leading-7 text-primary-foreground/75">
                  Choose subtle or expressive, reversible or permanent, salvaged or new. The plan
                  changes with the choices you make.
                </p>
              </div>
            </div>
            <div>
              <p className="eyebrow">A studio, not a verdict</p>
              <h2 className="section-title">Compare, remix, and keep the history.</h2>
              <p className="section-lede">
                Future milestones will preserve each idea and plan version, so a creative detour
                never erases the direction that came before it.
              </p>
              <div className="mt-8 space-y-5">
                <FeatureLine
                  icon={MessageCircleQuestion}
                  title="Ask why"
                  text="Understand assumptions, tradeoffs, and what the photo cannot reveal."
                />
                <FeatureLine
                  icon={PencilRuler}
                  title="Tune the constraints"
                  text="Adapt recommendations to time, budget, tools, materials, and confidence."
                />
                <FeatureLine
                  icon={Leaf}
                  title="Prefer what already exists"
                  text="Surface salvage and reuse opportunities before suggesting new purchases."
                />
              </div>
            </div>
          </div>
        </section>

        <section id="safety" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-10">
            <div>
              <Badge variant="warning">Safety is a product boundary</Badge>
              <h2 className="section-title mt-5">Some repairs should stop before they start.</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <ShieldAlert aria-hidden="true" className="size-7 text-amber-700" />
                  <CardTitle className="mt-4">High-risk work gets referred</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Electrical, gas, structural, battery, chemical, pressure, and similar hazards do
                    not receive procedural DIY instructions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <MessageCircleQuestion aria-hidden="true" className="size-7 text-primary" />
                  <CardTitle className="mt-4">Uncertainty stays visible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">
                    A photograph cannot prove hidden conditions are safe. The product asks,
                    explains, and recommends qualified help when evidence is incomplete.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-[2.25rem] bg-accent px-7 py-10 text-accent-foreground sm:px-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em]">Product preview</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Step inside the sample workspace.
              </h2>
              <p className="mt-3 text-sm leading-6 text-accent-foreground/75">
                Explore the dashboard shell and clearly labeled fixture projects built for M2.
              </p>
            </div>
            <Link
              href="/demo"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "shrink-0 bg-foreground text-background hover:bg-foreground/90",
              )}
            >
              Open demo dashboard
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function FeatureLine({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Leaf;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
