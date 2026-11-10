import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Target, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { dailyIncome, setbackDays } from "@/lib/money";
import { Money } from "@/components/Money";
import { PageTitle, inputCls } from "@/components/AppShell";
import { ART } from "@/lib/art";
import { GoalJar } from "@/components/GoalJar";
import { AmountInput } from "@/components/AmountInput";

export const Route = createFileRoute("/goal")({
  head: () => ({
    meta: [
      { title: "My Savings Goal — Savability" },
      { name: "description", content: "Save up for something big and see how treats slow you down." },
      { property: "og:title", content: "Savings Goal — Savability" },
      { property: "og:description", content: "Watch your savings jar fill up." },
    ],
  }),
  component: Goal,
});

function Goal() {
  const { state, update } = useStore();
  const [name, setName] = useState(state.goal?.name ?? "");
  const [price, setPrice] = useState(String(state.goal?.price ?? ""));
  const [editing, setEditing] = useState(!state.goal);
  const g = state.goal;
  const saved = Math.max(0, state.balance);
  const pct = g ? Math.min(100, (saved / g.price) * 100) : 0;
  const left = g ? Math.max(0, g.price - saved) : 0;
  const perDay = state.pocket ? dailyIncome(state.pocket.amount, state.pocket.freq) : 0;
  const wanted = state.txns.filter((t) => t.kind === "expense" && t.wanted).slice(0, 8);

  return (
    <div className="space-y-5">
      <PageTitle title="Saving for something big" sub="Set a goal and watch your jar fill up." />

      {editing || !g ? (
        <div className="card-soft space-y-3">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="What are you saving for? (e.g. cycle)" />
          <AmountInput value={price} onValue={setPrice} placeholder="How much does it cost (₹)?" />
          <button
            className="btn w-full bg-mint"
            disabled={!name.trim() || !(Number(price) > 0)}
            onClick={() => { update((s) => ({ ...s, goal: { name: name.trim(), price: Number(price) } })); setEditing(false); }}
          >
            <Target className="h-5 w-5" /> Set my goal
          </button>
        </div>
      ) : (
        <>
          <div className="card-soft flex items-center gap-5">
            <GoalJar pct={pct} />
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-2xl font-bold">{g.name}</h2>
              <div><div className="text-xs font-semibold uppercase text-muted-foreground">Saved</div><Money inr={Math.min(saved, g.price)} size="md" /></div>
              <div><div className="text-xs font-semibold uppercase text-muted-foreground">Still need</div><Money inr={left} size="md" /></div>
              {perDay > 0 && left > 0 && <p className="text-sm">About <b>{setbackDays(left, perDay)} days</b> to go!</p>}
              {left === 0 && <p className="flex items-center gap-2 font-bold"><img src={ART.party} alt="" className="h-8 w-8" /> You did it!</p>}
              <button className="btn bg-card py-1.5 text-sm" onClick={() => setEditing(true)}>Change goal</button>
            </div>
          </div>

          <div className="card-soft bg-sky space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Clock className="h-5 w-5" /> Setback calculator</h2>
            {perDay === 0 ? (
              <p className="text-sm">Set up pocket money on the Home page to see how many days treats cost you.</p>
            ) : wanted.length === 0 ? (
              <p className="text-sm">No treats bought — you're right on track!</p>
            ) : (
              <ul className="space-y-2">
                {wanted.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-2xl bg-card p-3">
                    <span className="font-semibold">{t.label}</span>
                    <span className="rounded-full bg-coral px-3 py-1 text-sm font-bold">-{setbackDays(t.amount, perDay)} days</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
