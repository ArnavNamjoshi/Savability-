import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FolderOpen, Plus, ShoppingBag, Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { AmountInput } from "@/components/AmountInput";
import { Money } from "@/components/Money";
import { PageTitle, inputCls } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/spending")({
  head: () => ({
    meta: [
      { title: "Where did my money go? — Savability" },
      { name: "description", content: "Your spending file: every purchase shown in rupees and your special money." },
      { property: "og:title", content: "Spending file — Savability" },
      { property: "og:description", content: "Track where your money goes." },
    ],
  }),
  component: Spending,
});

function Spending() {
  const { state, addExpense } = useStore();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [wanted, setWanted] = useState(true);
  const expenses = state.txns.filter((t) => t.kind === "expense");
  const total = expenses.reduce((a, t) => a + t.amount, 0);
  const split = [
    { id: "needed", label: "Needed", bar: "bg-mint", sum: expenses.filter((e) => !e.wanted).reduce((a, t) => a + t.amount, 0) },
    { id: "wanted", label: "Just wanted", bar: "bg-coral", sum: expenses.filter((e) => e.wanted).reduce((a, t) => a + t.amount, 0) },
  ];

  return (
    <div className="space-y-5">
      <PageTitle title="Where did my money go?" sub="Log what you buy and see your spending file." />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-soft space-y-3">
          <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What did you buy?" />
          <AmountInput value={amount} onValue={setAmount} placeholder="How much (₹)?" />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setWanted(false)} className={cn("rounded-2xl border-2 p-2 font-semibold", !wanted ? "border-foreground bg-mint" : "bg-muted")}>I needed it</button>
            <button onClick={() => setWanted(true)} className={cn("rounded-2xl border-2 p-2 font-semibold", wanted ? "border-foreground bg-coral" : "bg-muted")}>I just wanted it</button>
          </div>
          {wanted && state.match?.status === "playing" && (
            <p className="text-sm font-semibold text-destructive">Heads up: this will knock you out of your Savings Battle!</p>
          )}
          <button
            className="btn w-full bg-peach"
            disabled={!label.trim() || !(Number(amount) > 0)}
            onClick={() => { addExpense({ label: label.trim(), amount: Number(amount), wanted }); setLabel(""); setAmount(""); }}
          >
            <Plus className="h-5 w-5" /> Add to my file
          </button>
        </div>

        <div className="card-soft space-y-3">
          <h2 className="text-lg font-semibold">Total spent</h2>
          <Money inr={total} size="lg" />
          {total > 0 &&
            split.map((c) => (
              <div key={c.id}>
                <div className="flex items-start justify-between text-sm font-semibold"><span>{c.label}</span><Money inr={c.sum} size="sm" className="text-right" /></div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", c.bar)} style={{ width: `${(c.sum / total) * 100}%` }} /></div>
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-3xl border-2 border-foreground bg-sunny p-4">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><FolderOpen className="h-5 w-5" /> My spending file</h2>
        {expenses.length === 0 && <p className="text-muted-foreground">No spending yet. Great job!</p>}
        <ul className="space-y-2">
          {expenses.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-card p-3">
              <span className={cn("rounded-full p-2", e.wanted ? "bg-coral" : "bg-mint")}>
                {e.wanted ? <Heart className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
              </span>
              <div className="flex-1">
                <div className="font-semibold">{e.label}</div>
                <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()} · {e.wanted ? "wanted" : "needed"}</div>
              </div>
              <Money inr={e.amount} size="sm" className="text-right" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
