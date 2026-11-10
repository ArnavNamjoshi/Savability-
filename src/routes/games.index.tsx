import { createFileRoute, Link } from "@tanstack/react-router";
import { Swords, Layers, ChevronRight } from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { PLANTS } from "@/lib/art";
import { plantView } from "@/lib/garden";
import { useStore } from "@/lib/store";
import type { ReactNode } from "react";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Games — Savability" },
      { name: "description", content: "Play saving games, earn XP and unlock new gear." },
      { property: "og:title", content: "Games — Savability" },
      { property: "og:description", content: "Saving games for kids." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Games,
});

function Games() {
  const { state } = useStore();
  const plant = plantView(state.gardenPoints);
  const status =
    state.match?.status === "playing" ? "Match on now" : state.match?.status === "won" ? "You won!" : state.match?.status === "lost" ? "Knocked out" : "Start a match";

  return (
    <div className="space-y-5">
      <PageTitle title="Games" sub="Play, save and level up." />
      <div className="grid gap-4 md:grid-cols-3">
        <GameCard to="/games/battle" tint="bg-coral" title="Savings Battle Royale" text="Outlast the other savers by skipping treats in real life." note={status}>
          <Swords className="h-14 w-14" />
        </GameCard>
        <GameCard to="/games/garden" tint="bg-mint" title="Growth Garden" text="Your plant grows every day you save." note={`${plant.bloomed} bloom${plant.bloomed === 1 ? "" : "s"} so far`}>
          <img src={PLANTS[plant.stage]} alt="" className="h-16 w-16" />
        </GameCard>
        <GameCard to="/games/swipe" tint="bg-lavender" title="30-Second Money Swipe" text="Smart or not smart? Sort as many cards as you can." note={`Best: ${state.swipeBest}`}>
          <Layers className="h-14 w-14" />
        </GameCard>
      </div>
    </div>
  );
}

function GameCard({ to, tint, title, text, note, children }: { to: "/games/battle" | "/games/garden" | "/games/swipe"; tint: string; title: string; text: string; note: string; children: ReactNode }) {
  return (
    <Link to={to} className={`card-soft group flex flex-col gap-3 ${tint} transition-transform hover:-translate-y-1`}>
      <div className="flex h-16 items-center">{children}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="flex-1 text-sm">{text}</p>
      <div className="flex items-center justify-between rounded-xl border-2 border-foreground bg-card px-3 py-1.5 text-sm font-bold">
        {note} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
