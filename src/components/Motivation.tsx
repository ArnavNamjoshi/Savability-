import { useEffect, useState } from "react";
import { ART } from "@/lib/art";
import { cn } from "@/lib/utils";

const CHEERS = [
  { img: ART.coinPlant, title: "Grow it!", text: "Every coin you save is a tiny seed. Give it time and watch it grow." },
  { img: ART.cheerStar, title: "You've got this!", text: "Waiting one day before buying something makes you a money superhero." },
  { img: ART.rocketUp, title: "Blast off!", text: "Small saves add up to big dreams. Keep going!" },
  { img: ART.turtle, title: "Slow and steady", text: "A little bit saved every week fills the piggy bank." },
  { img: ART.piggy, title: "You're the boss", text: "Your money listens to you. Tell it to wait for something great." },
  { img: ART.party, title: "Future you says thanks", text: "Saving today means a happier you tomorrow." },
];

/** Rotating cheer-up card. Starts on a fixed card so the first paint matches the server. */
function useCheer(start: number, everyMs = 9000) {
  const [i, setI] = useState(start % CHEERS.length);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % CHEERS.length), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return CHEERS[i] ?? CHEERS[0]!;
}

export function CheerCard({ start = 0, compact = false, className }: { start?: number; compact?: boolean; className?: string }) {
  const c = useCheer(start);
  return (
    <div className={cn("flex items-center gap-3 rounded-3xl border-2 border-foreground bg-card p-4 shadow-[var(--shadow-pop)]", className)}>
      <img key={c.img} src={c.img} alt="" className={cn("shrink-0 animate-pop object-contain", compact ? "h-14 w-14" : "h-20 w-20")} />
      <div>
        <div className={cn("font-display font-bold", compact ? "text-base" : "text-xl")}>{c.title}</div>
        <p className={cn("text-muted-foreground", compact ? "text-sm" : "text-base")}>{c.text}</p>
      </div>
    </div>
  );
}

/** Row of three cheer-up cards for the open space under each page. */
export function CheerRow({ seed }: { seed: number }) {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {[0, 2, 4].map((o) => (
        <CheerCard key={o} start={seed + o} compact />
      ))}
    </div>
  );
}
