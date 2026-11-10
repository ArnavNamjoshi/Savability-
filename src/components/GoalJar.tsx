import { formatPercent } from "@/lib/money";

/** Glass jar filled with glowing yellow liquid; a soft wave rolls on top and rises with savings. */
export function GoalJar({ pct }: { pct: number }) {
  const h = Math.max(0, Math.min(100, pct));
  const wave = "M0 10 Q 25 0 50 10 T 100 10 T 150 10 T 200 10 V 20 H 0 Z";
  return (
    <div className="flex w-40 shrink-0 flex-col items-center">
      <div className="h-4 w-28 rounded-b-sm rounded-t-lg border-4 border-foreground bg-peach" />
      <div className="h-3 w-24 border-x-4 border-foreground bg-card/60" />
      <div
        className="relative h-52 w-40 overflow-hidden rounded-b-[2.75rem] rounded-t-[1.5rem] border-4 border-foreground bg-card/70"
        style={h > 0 ? { boxShadow: "0 0 28px 4px var(--honey-glow)" } : undefined}
      >
        <div className="animate-liquid absolute inset-x-0 bottom-0 transition-[height] duration-1000 ease-out" style={{ height: `${h}%` }}>
          {h > 0 && h < 100 && (
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute -top-[11px] left-0 h-3 w-[200%] animate-wave fill-honey" aria-hidden>
              <path d={wave} />
            </svg>
          )}
          <div className="h-full w-full bg-gradient-to-t from-honey-deep via-honey to-honey-light shadow-[inset_0_0_24px_var(--honey-glow)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,var(--honey-light)_0,transparent_45%)] opacity-70" />
        </div>
        <div className="pointer-events-none absolute left-3 top-4 h-24 w-2 rounded-full bg-card/80" />
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 text-center">
          <span className="inline-block whitespace-nowrap rounded-full bg-card/90 px-2 py-0.5 font-display text-sm font-bold">
            {formatPercent(pct)}%
          </span>
        </div>
      </div>
    </div>
  );
}
