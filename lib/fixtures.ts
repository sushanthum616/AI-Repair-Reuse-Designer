export type DemoProject = {
  id: string;
  title: string;
  item: string;
  status: "Exploring" | "Plan ready" | "In progress";
  progress: number;
  accent: "fern" | "clay" | "sun";
  updatedLabel: string;
  isFixture: true;
};

export const demoProjects = [
  {
    id: "demo-chair",
    title: "Cane chair refresh",
    item: "Dining chair · split seat weave",
    status: "Plan ready",
    progress: 35,
    accent: "fern",
    updatedLabel: "Illustrative update · today",
    isFixture: true,
  },
  {
    id: "demo-planter",
    title: "Terracotta planter reuse",
    item: "Planter · cracked rim",
    status: "Exploring",
    progress: 12,
    accent: "clay",
    updatedLabel: "Illustrative update · yesterday",
    isFixture: true,
  },
  {
    id: "demo-lamp",
    title: "Lamp shade redesign",
    item: "Fabric shade · torn panel",
    status: "In progress",
    progress: 68,
    accent: "sun",
    updatedLabel: "Illustrative update · 3 days ago",
    isFixture: true,
  },
] satisfies DemoProject[];
