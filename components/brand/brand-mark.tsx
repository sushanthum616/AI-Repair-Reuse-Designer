import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={cn("size-9", className)} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="14" fill="currentColor" className="text-primary" />
      <path
        d="M11 25.5c5.6.2 9.8-2.5 12.6-8.1 2.1 1.7 3.9 4.1 5.4 7.2"
        stroke="currentColor"
        className="text-primary-foreground"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M12.5 25.3c1.2-6.2 4.5-10 9.8-11.4"
        stroke="currentColor"
        className="text-primary-foreground"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="28.6" cy="13" r="2.2" fill="currentColor" className="text-accent" />
    </svg>
  );
}
