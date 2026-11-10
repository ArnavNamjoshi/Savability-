import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, PhoneCall, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { canBuy, toUnits } from "@/lib/money";
import { AmountInput } from "@/components/AmountInput";
import { Money } from "@/components/Money";
import { PageTitle, inputCls } from "@/components/AppShell";
import { ART } from "@/lib/art";

export const Route = createFileRoute("/can-i-buy")({
  head: () => ({
    meta: [
      { title: "Can I buy this? — Savability" },
      { name: "description", content: "Check if you can afford something, then ask a parent to approve." },
      { property: "og:title", content: "Can I buy this? — Savability" },
      { property: "og:description", content: "A smart check before you spend." },
    ],
  }),
  component: CanIBuy,
});

type Step = "ask" | "no" | "call" | "parent" | "done";

function CanIBuy() {
  const { state, addExpense } = useStore();
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [needed, setNeeded] = useState(false);
  const [step, setStep] = useState<Step>("ask");
  const [result, setResult] = useState<"yes" | "no">("yes");
  const p = Number(price);
  const restart = () => { setStep("ask"); setItem(""); setPrice(""); };

  if (step === "parent") {
    return (
      <div className="animate-pop space-y-5">
        <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-5 w-5" /> Parent view</div>
        <div className="card-soft space-y-4">
          <p className="text-muted-foreground">Your child would like to buy:</p>
          <h1 className="text-3xl font-bold">{item}</h1>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-4"><div className="text-xs font-semibold uppercase text-muted-foreground">Price</div><div className="font-display text-2xl font-bold">₹{p.toLocaleString("en-IN")}</div></div>
            <div className="rounded-2xl bg-muted p-4"><div className="text-xs font-semibold uppercase text-muted-foreground">In {state.unitName}</div><div className="font-display text-2xl font-bold">{toUnits(p, state.unitPrice)}</div></div>
          </div>
          <div className="text-sm text-muted-foreground">
            Balance: ₹{state.balance.toLocaleString("en-IN")} · This is {Math.round((p / state.balance) * 100)}% of savings · Marked as {needed ? "needed" : "wanted"}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn bg-coral" onClick={() => { setResult("no"); setStep("done"); }}><X className="h-5 w-5" /> Decline</button>
            <button className="btn bg-mint" onClick={() => { addExpense({ label: item, amount: p, wanted: !needed }); setResult("yes"); setStep("done"); }}><Check className="h-5 w-5" /> Approve</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Can I buy this?" sub="Let's check before you spend!" />

      {step === "ask" && (
        <div className="card-soft space-y-3">
          <input className={inputCls} value={item} onChange={(e) => setItem(e.target.value)} placeholder="What do you want?" />
          <AmountInput value={price} onValue={setPrice} placeholder="How much (₹)?" />
          {p > 0 && <Money inr={p} size="md" />}
          <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={needed} onChange={(e) => setNeeded(e.target.checked)} className="h-5 w-5" /> I really need this</label>
          <button className="btn w-full bg-lemon" disabled={!item.trim() || !(p > 0)} onClick={() => setStep(canBuy(p, state.balance) ? "call" : "no")}>Check!</button>
        </div>
      )}

      {step === "no" && (
        <div className="card-soft animate-pop space-y-3 text-center">
          <img src={ART.turtle} alt="A slow and steady turtle" className="mx-auto h-28 w-28" />
          <h2 className="text-2xl font-bold">Not yet — keep saving!</h2>
          <p>{item} costs too much of your savings right now. Things should cost less than 3/4 of what you have.</p>
          <button className="btn bg-peach" onClick={restart}>Try something else</button>
        </div>
      )}

      {step === "call" && (
        <div className="card-soft animate-pop space-y-3 text-center bg-sky">
          <PhoneCall className="mx-auto h-14 w-14" />
          <h2 className="text-2xl font-bold">Go call a parent!</h2>
          <p>You can afford it. Ask a grown-up to come to the screen to approve.</p>
          <button className="btn bg-lavender" onClick={() => setStep("parent")}>My parent is here</button>
        </div>
      )}

      {step === "done" && (
        <div className="card-soft animate-pop space-y-3 text-center">
          {result === "yes" ? <img src={ART.party} alt="Party popper" className="mx-auto h-28 w-28" /> : <img src={ART.turtle} alt="A patient turtle" className="mx-auto h-28 w-28" />}
          <h2 className="text-2xl font-bold">{result === "yes" ? "Approved! Enjoy it." : "Maybe next time."}</h2>
          <button className="btn bg-mint" onClick={restart}>Done</button>
        </div>
      )}
    </div>
  );
}
