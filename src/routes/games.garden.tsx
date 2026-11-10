import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarCheck, Target, Lock, Check } from "lucide-react";
import { useStore, GARDEN_COSMETICS } from "@/lib/store";
import { GOAL_MILESTONES, plantView, savingDays, STAGES, XP_PER_GROWTH } from "@/lib/garden";
import { PLANTS } from "@/lib/art";
import { play } from "@/lib/sound";
import { PageTitle } from "@/components/AppShell";
import { BackToGames } from "@/components/BackToGames";
import { GearIcon } from "@/components/Avatar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games/garden")({
  head: () => ({
    meta: [
      { title: "Growth Garden — Savability" },
      { name: "description", content: "Grow a plant with every saving day and goal milestone, and unlock plant gear." },
      { property: "og:title", content: "Growth Garden — Savability" },
      { property: "og:description", content: "Your savings make your garden grow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Garden,
});

const SEEN_KEY = "savability-garden-seen";
const STAGE_LABEL = { seed: "Seed", sprout: "Sprout", bud: "Bud", bloom: "Bloom" } as const;

function Garden() {
  const { state } = useStore();
  const view = plantView(state.gardenPoints);
  const days = savingDays(state.txns);
  const [grew, setGrew] = useState(false);

  // Celebrate if the plant grew since the last visit.
  useEffect(() => {
    const seen = Number(localStorage.getItem(SEEN_KEY) ?? "0");
    if (state.gardenPoints > seen) {
      setGrew(true);
      setTimeout(() => play("grow"), 250);
    }
    localStorage.setItem(SEEN_KEY, String(state.gardenPoints));
  }, [state.gardenPoints]);

  const goal = state.goal;
  const reached = (m: number) => !!goal && state.gardenMilestones.includes(`${goal.name}:${goal.price}:${m}`);

  return (
    <div className="space-y-5">
      <BackToGames />
      <PageTitle title="Growth Garden" sub="Your plant grows a little every time you save." />

      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div className="card-soft flex flex-col items-center gap-3 bg-mint text-center">
          <div className="relative flex h-56 w-56 items-end justify-center rounded-full border-4 border-foreground bg-sunny">
            <img key={view.stage + state.gardenPoints} src={PLANTS[view.stage]} alt={`Your plant: ${STAGE_LABEL[view.stage]}`} className="h-48 w-48 animate-pop object-contain" />
          </div>
          <h2 className="text-2xl font-bold">{STAGE_LABEL[view.stage]}</h2>
          <div className="flex gap-2" aria-label="Growth stages">
            {STAGES.map((s, i) => (
              <span key={s} className={cn("h-3.5 w-10 rounded-full border-2 border-foreground", i <= STAGES.indexOf(view.stage) ? "bg-foreground" : "bg-card")} />
            ))}
          </div>
          <p className="font-semibold">
            {view.stepsToNext === 1 ? "1 more step and a new plant starts!" : `${view.stepsToNext - 1} more step${view.stepsToNext - 1 === 1 ? "" : "s"} until it blooms.`}
          </p>
          {grew && <p className="rounded-full border-2 border-foreground bg-card px-3 py-1 text-sm font-bold">Your plant grew! +{XP_PER_GROWTH} XP per step</p>}
        </div>

        <div className="space-y-4">
          <div className="card-soft space-y-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarCheck className="h-5 w-5" /> Saving days: {days}</h2>
            <p className="text-sm text-muted-foreground">A saving day is a day you added money and didn't buy anything you "just wanted". Each one grows your plant one step.</p>
          </div>
          <div className="card-soft space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Target className="h-5 w-5" /> Goal milestones</h2>
            {goal ? (
              <div className="grid grid-cols-4 gap-2">
                {GOAL_MILESTONES.map((m) => (
                  <div key={m} className={cn("flex flex-col items-center rounded-2xl border-2 p-2 font-display font-bold", reached(m) ? "border-foreground bg-lemon" : "border-foreground/20 bg-muted")}>
                    {reached(m) ? <Check className="h-5 w-5" /> : <Lock className="h-5 w-5 opacity-50" />}
                    {m}%
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Set a saving goal and each quarter you save grows your plant too.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card-soft space-y-3">
        <h2 className="text-lg font-semibold">My garden: {view.bloomed} bloom{view.bloomed === 1 ? "" : "s"}</h2>
        {view.bloomed === 0 ? (
          <p className="text-muted-foreground">When your plant fully blooms it moves here and a new seed is planted.</p>
        ) : (
          <div className="flex flex-wrap items-end gap-1">
            {Array.from({ length: Math.min(view.bloomed, 16) }, (_, i) => (
              <img key={i} src={PLANTS.bloom} alt="" className="h-14 w-14" style={{ transform: `rotate(${((i * 37) % 15) - 7}deg)` }} />
            ))}
            {view.bloomed > 16 && <span className="font-display text-xl font-bold">+{view.bloomed - 16}</span>}
          </div>
        )}
      </div>

      <div className="card-soft space-y-3">
        <h2 className="text-lg font-semibold">Plant gear</h2>
        <div className="grid grid-cols-3 gap-3">
          {GARDEN_COSMETICS.map((c) => {
            const owned = state.cosmetics.includes(c.id);
            return (
              <div key={c.id} className={cn("flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center text-sm font-semibold", owned ? "border-foreground bg-sunny" : "border-foreground/20 bg-muted")}>
                <span className="flex h-11 items-center">{owned ? <GearIcon c={c} /> : <Lock className="h-6 w-6 opacity-60" />}</span>
                {c.label}
                <span className="text-xs text-muted-foreground">{owned ? "Unlocked" : c.hint}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
