import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { inputCls } from "@/components/AppShell";
import { AmountInput } from "@/components/AmountInput";
import { cn } from "@/lib/utils";
import { ART, BUDDIES, BUDDY_IDS } from "@/lib/art";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to Savability" },
      { name: "description", content: "Pick your own fun money unit and start saving — no account needed." },
      { property: "og:title", content: "Welcome to Savability" },
      { property: "og:description", content: "Pick your own fun money unit and start saving." },
    ],
  }),
  component: Setup,
});

const UNITS = ["Pens", "Chocolates", "Chips"];
const PRICES = [10, 25, 50];

function Setup() {
  const { state, ready, update } = useStore();
  const nav = useNavigate();
  const [unit, setUnit] = useState("chocolates");
  const [price, setPrice] = useState(10);
  const [start, setStart] = useState("");
  const [avatar, setAvatar] = useState("fox");

  useEffect(() => {
    if (ready && state.setup) nav({ to: "/dashboard" });
  }, [ready, state.setup, nav]);

  const go = () => {
    const amt = Number(start) || 0;
    update((s) => ({
      ...s,
      setup: true,
      unitName: unit.trim() || "coins",
      unitPrice: price > 0 ? price : 10,
      avatar,
      balance: amt,
      txns: amt ? [{ id: "start", kind: "income", label: "Starting money", amount: amt, date: Date.now() }] : [],
    }));
    nav({ to: "/dashboard" });
  };

  return (
    <div className="animate-pop space-y-6">
      <div className="text-center">
        <img src={ART.piggy} alt="Savability piggy bank" className="mx-auto mb-2 h-28 w-28" />
        <h1 className="text-4xl font-bold">Savability</h1>
        <p className="text-muted-foreground">Your money, your way. Only on Savability.</p>
      </div>

      <section className="card-soft space-y-3">
        <h2 className="text-xl font-semibold">1. Pick your profile</h2>
        <div className="flex flex-wrap gap-2">
          {BUDDY_IDS.map((a) => (
            <button key={a} aria-label={a} onClick={() => setAvatar(a)} className={cn("h-16 w-16 rounded-full border-2 p-1.5", avatar === a ? "border-foreground bg-sunny" : "bg-muted")}>
              <img src={BUDDIES[a]} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      </section>

      <section className="card-soft space-y-3">
        <h2 className="text-xl font-semibold">2. Choose your special unit</h2>
        <div className="flex flex-wrap gap-2">
          {UNITS.map((u) => (
            <button key={u} onClick={() => setUnit(u)} className={cn("btn py-2", unit === u ? "bg-mint" : "bg-card")}>{u}</button>
          ))}
        </div>
        <input className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="or type your own…" />
      </section>

      <section className="card-soft space-y-3">
        <h2 className="text-xl font-semibold">3. How many ₹ is one {unit || "unit"}?</h2>
        <div className="flex flex-wrap gap-2">
          {PRICES.map((p) => (
            <button key={p} onClick={() => setPrice(p)} className={cn("btn py-2", price === p ? "bg-peach" : "bg-card")}>₹{p}</button>
          ))}
        </div>
        <AmountInput value={price || ""} onValue={(v) => setPrice(Number(v) || 0)} />
      </section>

      <section className="card-soft space-y-3">
        <h2 className="text-xl font-semibold">4. Money you already have (₹)</h2>
        <AmountInput value={start} onValue={setStart} placeholder="0" />
      </section>

      <button onClick={go} className="btn w-full bg-lavender text-lg">
        <Sparkles className="h-5 w-5" /> Let's go!
      </button>
    </div>
  );
}
