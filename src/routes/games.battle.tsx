import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Swords, Trophy, Skull } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { PageTitle } from "@/components/AppShell";
import { BackToGames } from "@/components/BackToGames";
import { cn } from "@/lib/utils";
import { buddySrc } from "@/lib/art";
import { play } from "@/lib/sound";

export const Route = createFileRoute("/games/battle")({
  head: () => ({
    meta: [
      { title: "Savings Battle Royale — Savability" },
      { name: "description", content: "Outlast the other savers by making smart money choices in real life." },
      { property: "og:title", content: "Savings Battle Royale — Savability" },
      { property: "og:description", content: "Be the last saver standing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Battle,
});

/** A small, steady tilt and nudge per player so the crowd looks scattered, not lined up. */
function scatter(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rot = (h % 21) - 10;
  const dx = ((h >> 5) % 13) - 6;
  const dy = ((h >> 9) % 15) - 7;
  return { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` };
}

function Battle() {
  const { state, startMatch, update } = useStore();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const m = state.match;

  // A funny "boing" whenever another player gets knocked out while you watch.
  const outCount = m ? m.bots.filter((b) => b.outAt <= now).length : 0;
  const prevOut = useRef<number | null>(null);
  useEffect(() => {
    if (prevOut.current !== null && outCount > prevOut.current && m?.status === "playing") play("boing");
    prevOut.current = outCount;
  }, [outCount, m?.status]);

  if (!m) {
    return (
      <div className="space-y-5">
        <BackToGames />
        <PageTitle title="Savings Battle Royale" sub="21 savers enter. Only smart choices survive." />
        <div className="card-soft space-y-3 text-center">
          <Swords className="mx-auto h-14 w-14" />
          <p>Live your normal life! Every time you buy something you just <b>wanted</b>, you're knocked out. Other players drop out when they splurge. Last one standing wins XP, badges and cool gear.</p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 7].map((d) => (
              <button key={d} className={cn("btn", d === 1 ? "bg-mint" : d === 3 ? "bg-peach" : "bg-lavender")} onClick={() => startMatch(d)}>{d} day{d > 1 ? "s" : ""}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const out = m.bots.filter((b) => b.outAt <= now).sort((a, b) => b.outAt - a.outAt);
  const alive = m.bots.filter((b) => b.outAt > now);
  const ms = Math.max(0, m.endsAt - now);
  const h = Math.floor(ms / 3600000), mn = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);

  return (
    <div className="space-y-5">
      <BackToGames />
      <PageTitle title="Savings Battle Royale" />

      {m.status === "playing" && (
        <div className="rounded-3xl border-2 border-foreground bg-sunny p-5 text-center">
          <div className="text-sm font-semibold text-muted-foreground">Still in the game</div>
          <div className="font-display text-5xl font-bold">{alive.length + 1}<span className="text-2xl"> / 21</span></div>
          <div className="mt-1 font-display">{h}h {mn}m {s}s left</div>
          <p className="mt-2 text-sm">Stay strong — skip the treats you don't need!</p>
        </div>
      )}

      {m.status === "won" && (
        <div className="card-soft animate-pop space-y-2 bg-mint text-center">
          <Trophy className="mx-auto h-14 w-14" />
          <h2 className="text-3xl font-bold">Victory!</h2>
          <p>You were the last saver standing. Smart choices put you ahead of the world! +150 XP, a new badge and gear.</p>
          <button className="btn bg-lemon" onClick={() => update((st) => ({ ...st, match: null }))}>Play again</button>
        </div>
      )}

      {m.status === "lost" && (
        <div className="card-soft animate-pop space-y-2 bg-coral text-center">
          <Skull className="mx-auto h-14 w-14" />
          <h2 className="text-3xl font-bold">Knocked out!</h2>
          <p>A "just wanted" purchase took you out. Next time, think twice before buying treats.</p>
          <button className="btn bg-lemon" onClick={() => update((st) => ({ ...st, match: null }))}>Try again</button>
        </div>
      )}

      <div className="card-soft">
        <h2 className="mb-3 text-lg font-semibold">Players</h2>
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 md:grid-cols-7">
          <div className="flex flex-col items-center"><Avatar size={40} /><span className="text-xs font-bold">You</span></div>
          {m.bots.map((b, i) => (
            <div
              key={b.name}
              className={cn("flex flex-col items-center", b.outAt <= now && "opacity-30 grayscale")}
              style={scatter(b.name)}
            >
              <img src={buddySrc(b.avatar, i)} alt="" className="h-10 w-10 rounded-full bg-muted p-1" />
              <span className="text-xs">{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-soft">
        <h2 className="mb-3 text-lg font-semibold">Live feed</h2>
        {out.length === 0 && <p className="text-muted-foreground">Everyone is still saving…</p>}
        <ul className="space-y-2">
          {out.slice(0, 12).map((b, i) => (
            <li key={b.name} className="flex items-center gap-2 rounded-2xl bg-muted p-2 text-sm">
              <img src={buddySrc(b.avatar, i)} alt="" className="h-7 w-7" />
              <span className="flex-1"><b>{b.name}</b> {b.reason} — eliminated!</span>
              <span className="text-xs text-muted-foreground">{new Date(b.outAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
