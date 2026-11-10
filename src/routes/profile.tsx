import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Award } from "lucide-react";
import { useStore, COSMETICS, WIN_COSMETICS } from "@/lib/store";
import { levelFromXp, XP_PER_LEVEL } from "@/lib/money";
import { Avatar, GearIcon } from "@/components/Avatar";
import { inputCls } from "@/components/AppShell";
import { AmountInput } from "@/components/AmountInput";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Savability" },
      { name: "description", content: "Your level, badges and gear — plus your special money settings." },
      { property: "og:title", content: "My Profile — Savability" },
      { property: "og:description", content: "Level up and dress up your saver." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { state, update, reset } = useStore();
  const nav = useNavigate();
  const lvl = levelFromXp(state.xp);
  const [unit, setUnit] = useState(state.unitName);
  const [price, setPrice] = useState(String(state.unitPrice));
  const all = [...COSMETICS, ...WIN_COSMETICS];

  return (
    <div className="space-y-5">
      <div className="card-soft flex flex-col items-center gap-3 bg-sky text-center">
        <Avatar size={110} />
        <h1 className="text-3xl font-bold">Level {lvl}</h1>
        <div className="h-3 w-full overflow-hidden rounded-full bg-card"><div className="h-full bg-mint" style={{ width: `${state.xp % XP_PER_LEVEL}%` }} /></div>
        <div className="text-sm">{state.xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP to level {lvl + 1}</div>
      </div>

      <div className="card-soft">
        <h2 className="mb-3 text-lg font-semibold">Badges</h2>
        {state.badges.length === 0 ? (
          <p className="text-muted-foreground">Win a Savings Battle to earn your first badge!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {state.badges.map((b) => (
              <span key={b} className="flex items-center gap-1 rounded-full bg-lemon px-3 py-1 text-sm font-bold"><Award className="h-4 w-4" /> {b}</span>
            ))}
          </div>
        )}
      </div>

      <div className="card-soft">
        <h2 className="mb-3 text-lg font-semibold">Gear</h2>
        <div className="grid grid-cols-4 gap-2">
          {all.map((c) => {
            const owned = state.cosmetics.includes(c.id);
            const on = state.equipped[c.slot] === c.id;
            return (
              <button
                key={c.id}
                disabled={!owned}
                onClick={() => update((s) => ({ ...s, equipped: { ...s.equipped, [c.slot]: on ? undefined : c.id } }))}
                className={cn("flex flex-col items-center rounded-2xl border-2 p-2 text-xs font-semibold", on ? "border-foreground bg-sunny" : "bg-muted", !owned && "opacity-50")}
              >
                <span className="flex h-10 items-center">{owned ? <GearIcon c={c} /> : <Lock className="h-6 w-6" />}</span>
                {c.label}
                {!owned && <span className="text-muted-foreground">{c.level ? `Lvl ${c.level}` : "Win battle"}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card-soft space-y-3">
        <h2 className="text-lg font-semibold">My special money</h2>
        <input className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)} />
        <AmountInput value={price} onValue={setPrice} />
        <button
          className="btn w-full bg-mint"
          disabled={!unit.trim() || !(Number(price) > 0)}
          onClick={() => update((s) => ({ ...s, unitName: unit.trim(), unitPrice: Number(price) }))}
        >
          Save: 1 {unit} = ₹{price}
        </button>
      </div>

      <button
        className="btn w-full bg-coral"
        onClick={() => { if (confirm("Start over? Everything will be erased.")) { reset(); nav({ to: "/" }); } }}
      >
        Start over
      </button>
    </div>
  );
}
