import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, CalendarClock, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { levelFromXp, XP_PER_LEVEL, type Frequency } from "@/lib/money";
import { AmountInput } from "@/components/AmountInput";
import { Money } from "@/components/Money";
import { Avatar } from "@/components/Avatar";
import { inputCls } from "@/components/AppShell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Money — Savability" },
      { name: "description", content: "See your balance, add gift money and set up pocket money." },
      { property: "og:title", content: "My Money — Savability" },
      { property: "og:description", content: "Your balance at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, addIncome, update } = useStore();
  const [gift, setGift] = useState("");
  const [showGift, setShowGift] = useState(false);
  const [pAmt, setPAmt] = useState(String(state.pocket?.amount ?? ""));
  const [pFreq, setPFreq] = useState<Frequency>(state.pocket?.freq ?? "weekly");
  const lvl = levelFromXp(state.xp);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar size={64} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Hey there!</h1>
          <div className="text-sm text-muted-foreground">Level {lvl}</div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-mint" style={{ width: `${state.xp % XP_PER_LEVEL}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border-2 border-foreground bg-sunny p-6 text-center">
        <div className="text-sm font-semibold text-muted-foreground">You have</div>
        <Money inr={state.balance} size="xl" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setShowGift((v) => !v)} className="btn bg-peach"><Gift className="h-5 w-5" /> Add gift</button>
        <Link to="/can-i-buy" className="btn bg-lemon">Can I buy this, mum?</Link>
      </div>

      {showGift && (
        <div className="card-soft animate-pop space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Gift className="h-5 w-5" /> Got some money?</h2>
          <div className="flex gap-2">
            {[100, 500, 1000].map((v) => (
              <button key={v} onClick={() => setGift(String(v))} className="btn flex-1 bg-card py-2">₹{v}</button>
            ))}
          </div>
          <AmountInput value={gift} onValue={setGift} placeholder="Amount in ₹" />
          <button
            className="btn w-full bg-mint"
            disabled={!(Number(gift) > 0)}
            onClick={() => { addIncome("Gift money", Number(gift)); setGift(""); setShowGift(false); }}
          >
            Add it!
          </button>
        </div>
      )}

      <div className="card-soft space-y-3 bg-sky">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarClock className="h-5 w-5" /> Pocket money</h2>
        {state.pocket && (
          <p className="text-sm">You get ₹{state.pocket.amount} every {state.pocket.freq === "weekly" ? "week" : "month"} — added automatically.</p>
        )}
        <div className="flex gap-2">
          <AmountInput value={pAmt} onValue={setPAmt} placeholder="₹ amount" />
          <select className={inputCls + " w-36"} value={pFreq} onChange={(e) => setPFreq(e.target.value as Frequency)}>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
          </select>
        </div>
        <button
          className="btn w-full bg-lavender"
          disabled={!(Number(pAmt) > 0)}
          onClick={() => {
            const amount = Number(pAmt);
            const first = !state.pocket;
            update((s) => ({ ...s, pocket: { amount, freq: pFreq, lastPaid: s.pocket?.lastPaid ?? Date.now() } }));
            if (first) addIncome("Pocket money", amount);
          }}
        >
          {state.pocket ? "Update pocket money" : "Start pocket money"}
        </button>
      </div>

      <div className="card-soft">
        <h2 className="mb-3 text-lg font-semibold">Recent</h2>
        {state.txns.length === 0 && <p className="text-muted-foreground">Nothing yet!</p>}
        <ul className="space-y-3">
          {state.txns.slice(0, 6).map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <span className={"rounded-full p-2 " + (t.kind === "income" ? "bg-mint" : "bg-coral")}>
                {t.kind === "income" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </span>
              <span className="flex-1 font-semibold">{t.label}</span>
              <Money inr={t.amount} size="sm" className="text-right" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
