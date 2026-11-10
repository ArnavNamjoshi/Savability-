import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ThumbsUp, ThumbsDown, Timer, Lock } from "lucide-react";
import { useStore, SWIPE_GEAR } from "@/lib/store";
import { CARDS, SWIPE_SECONDS, swipeReward, type SwipeCard } from "@/lib/swipe";
import { shuffle } from "@/lib/bots";
import { play } from "@/lib/sound";
import { PageTitle } from "@/components/AppShell";
import { BackToGames } from "@/components/BackToGames";
import { GearIcon } from "@/components/Avatar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games/swipe")({
  head: () => ({
    meta: [
      { title: "30-Second Money Swipe — Savability" },
      { name: "description", content: "Sort money habits into smart and not smart in 30 seconds to earn XP and gear." },
      { property: "og:title", content: "30-Second Money Swipe — Savability" },
      { property: "og:description", content: "A quick game about smart money habits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Swipe,
});

type Phase = "intro" | "playing" | "done";

function Swipe() {
  const { state, finishSwipe } = useStore();
  const [phase, setPhase] = useState<Phase>("intro");
  const [deck, setDeck] = useState<SwipeCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [left, setLeft] = useState(SWIPE_SECONDS);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [dx, setDx] = useState(0);
  const [result, setResult] = useState<{ correct: number; xp: number; newGear: string[] } | null>(null);
  const endAt = useRef(0);
  const drag = useRef<number | null>(null);
  const rightRef = useRef(0);
  rightRef.current = right;
  const owned = useRef<string[]>([]);

  const start = () => {
    setDeck(shuffle(CARDS));
    setIdx(0);
    setRight(0);
    setWrong(0);
    setLeft(SWIPE_SECONDS);
    setResult(null);
    owned.current = state.cosmetics;
    endAt.current = Date.now() + SWIPE_SECONDS * 1000;
    setPhase("playing");
    play("right");
  };

  const finish = useCallback(() => {
    const correct = rightRef.current;
    const r = swipeReward(correct);
    const newGear = r.cosmetics.filter((id) => !owned.current.includes(id));
    finishSwipe(correct);
    setResult({ correct, xp: r.xp, newGear });
    setPhase("done");
    play(newGear.length ? "fanfare" : "grow");
  }, [finishSwipe]);

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      const ms = endAt.current - Date.now();
      setLeft(Math.max(0, Math.ceil(ms / 1000)));
      if (ms <= 0) {
        clearInterval(t);
        finish();
      }
    }, 200);
    return () => clearInterval(t);
  }, [phase, finish]);

  const answer = useCallback(
    (saysSmart: boolean) => {
      if (phase !== "playing") return;
      const card = deck[idx % deck.length];
      if (!card) return;
      const ok = card.right === saysSmart;
      if (ok) setRight((n) => n + 1);
      else setWrong((n) => n + 1);
      play(ok ? "right" : "wrong");
      setFlash(ok ? "ok" : "bad");
      setTimeout(() => setFlash(null), 260);
      setDx(0);
      setIdx((i) => {
        const next = i + 1;
        if (next % deck.length === 0) setDeck((d) => shuffle(d));
        return next;
      });
    },
    [phase, deck, idx],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") answer(true);
      if (e.key === "ArrowLeft") answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current !== null) setDx(e.clientX - drag.current);
  };
  const onUp = () => {
    if (drag.current === null) return;
    drag.current = null;
    if (dx > 90) answer(true);
    else if (dx < -90) answer(false);
    else setDx(0);
  };

  const card = deck[idx % Math.max(1, deck.length)];

  return (
    <div className="space-y-5">
      <BackToGames />
      <PageTitle title="30-Second Money Swipe" sub="Is it a smart money move? Swipe right for smart, left for not smart." />

      {phase === "intro" && (
        <div className="card-soft space-y-4 bg-lavender text-center">
          <Timer className="mx-auto h-14 w-14" />
          <p className="mx-auto max-w-md">You have 30 seconds. Every right answer gives 2 XP. Get 5, 10 or 15 right in one round to unlock new gear.</p>
          <p className="font-display text-lg font-bold">Your best: {state.swipeBest}</p>
          <button className="btn bg-lemon" onClick={start}>Start!</button>
        </div>
      )}

      {phase === "playing" && card && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border-2 border-foreground bg-card px-4 py-2 font-display text-lg font-bold">
            <span className="flex items-center gap-2"><Timer className="h-5 w-5" /> {left}s</span>
            <span>Right: {right}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border-2 border-foreground bg-card">
            <div className="h-full bg-coral transition-[width] duration-200" style={{ width: `${(left / SWIPE_SECONDS) * 100}%` }} />
          </div>
          <div
            role="group"
            aria-label="Money card"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className={cn(
              "card-soft flex min-h-56 cursor-grab touch-none select-none items-center justify-center p-8 text-center transition-colors active:cursor-grabbing",
              flash === "ok" ? "bg-mint" : flash === "bad" ? "bg-coral" : dx > 40 ? "bg-mint/60" : dx < -40 ? "bg-coral/60" : "bg-card",
            )}
            style={{ transform: `translateX(${dx}px) rotate(${dx / 18}deg)`, transition: drag.current === null ? "transform 0.2s" : undefined }}
          >
            <p key={idx} className="animate-pop font-display text-2xl font-bold md:text-3xl">{card.text}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn bg-coral" onClick={() => answer(false)}><ThumbsDown className="h-5 w-5" /> Not smart</button>
            <button className="btn bg-mint" onClick={() => answer(true)}><ThumbsUp className="h-5 w-5" /> Smart</button>
          </div>
          <p className="text-center text-sm text-muted-foreground">Tip: drag the card, tap a button, or use the arrow keys.</p>
        </div>
      )}

      {phase === "done" && result && (
        <div className="card-soft animate-pop space-y-3 bg-sky text-center">
          <h2 className="text-3xl font-bold">Time's up!</h2>
          <p className="font-display text-xl">{result.correct} right · {wrong} wrong</p>
          <p className="text-lg font-bold">+{result.xp} XP</p>
          {result.newGear.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {SWIPE_GEAR.filter((g) => result.newGear.includes(g.id)).map((g) => (
                <div key={g.id} className="flex flex-col items-center gap-1 rounded-2xl border-2 border-foreground bg-sunny p-3 text-sm font-bold">
                  <GearIcon c={g} /> New: {g.label}
                </div>
              ))}
            </div>
          )}
          <button className="btn bg-lemon" onClick={start}>Play again</button>
        </div>
      )}

      <div className="card-soft space-y-3">
        <h2 className="text-lg font-semibold">Swipe gear</h2>
        <div className="grid grid-cols-3 gap-3">
          {SWIPE_GEAR.map((c) => {
            const has = state.cosmetics.includes(c.id);
            return (
              <div key={c.id} className={cn("flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center text-sm font-semibold", has ? "border-foreground bg-sunny" : "border-foreground/20 bg-muted")}>
                <span className="flex h-11 items-center">{has ? <GearIcon c={c} /> : <Lock className="h-6 w-6 opacity-60" />}</span>
                {c.label}
                <span className="text-xs text-muted-foreground">{has ? "Unlocked" : `${c.hint?.replace("Swipe ", "")} right in a round`}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
