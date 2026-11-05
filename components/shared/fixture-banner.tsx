import { FlaskConical } from "lucide-react";

export function FixtureBanner() {
  return (
    <aside
      aria-label="Demonstration data notice"
      className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
    >
      <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong>Public product preview.</strong> Every project and result on this page is
        illustrative fixture data. Accounts, uploads, and AI analysis arrive in later milestones.
      </p>
    </aside>
  );
}
