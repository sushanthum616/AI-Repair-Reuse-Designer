export default function Loading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto min-h-screen w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10"
    >
      <p className="sr-only">Loading page</p>
      <div className="h-9 w-48 animate-pulse rounded-full bg-muted" />
      <div className="mt-10 h-16 max-w-2xl animate-pulse rounded-2xl bg-muted" />
      <div className="mt-5 h-6 max-w-xl animate-pulse rounded-xl bg-muted" />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-64 animate-pulse rounded-[1.75rem] bg-muted" />
        ))}
      </div>
    </main>
  );
}
