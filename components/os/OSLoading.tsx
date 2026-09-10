import BrandLoading from "@/components/brand/BrandLoading";

/**
 * The shared skeleton behind every loading.tsx under /c and /admin.
 *
 * Purely presentational and server-rendered — no hooks, no client bundle. It
 * ships inside the layout's chrome, so the nav stays interactive while the
 * page below it resolves.
 */
export function OSLoading({ label, lines = 4 }: { label: string; lines?: number }) {
  return (
    <main className="os-stage" aria-busy="true" aria-live="polite">
      <BrandLoading compact label={`Loading ${label}`} />
      <div className="os-skeleton" style={{ height: 38, maxWidth: 420 }} />
      <div className="os-skeleton" style={{ height: 15, maxWidth: 560, marginTop: 22 }} />
      <div style={{ marginTop: 40 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="os-skeleton"
            style={{ height: 62, maxWidth: `${100 - i * 4}%` }}
          />
        ))}
      </div>
      <span className="sr-only">Loading {label}</span>
    </main>
  );
}
