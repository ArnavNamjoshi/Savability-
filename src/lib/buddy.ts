/** Ask Buddy: the money facts shared with the chat. Only numbers and item names — never personal data. */
import { dailyIncome, PURCHASE_LIMIT_RATIO, setbackDays, toUnits, type Frequency } from "./money";

export type BuddyContext = {
  unitName: string;
  unitPrice: number;
  balance: number;
  goal: { name: string; price: number } | null;
  pocket: { amount: number; freq: Frequency } | null;
  recent: { label: string; amount: number; wanted: boolean; daysAgo: number }[];
  month: { added: number; needed: number; wanted: number };
};

type Txn = { kind: "income" | "expense"; label: string; amount: number; wanted?: boolean; date: number };

const DAY = 86400000;

/** Build what Buddy may know from the saved app data. */
export function buddyContext(
  s: {
    unitName: string;
    unitPrice: number;
    balance: number;
    goal: { name: string; price: number } | null;
    pocket: { amount: number; freq: Frequency } | null;
    txns: Txn[];
  },
  now = Date.now(),
): BuddyContext {
  const month = { added: 0, needed: 0, wanted: 0 };
  for (const t of s.txns) {
    if (now - t.date > 30 * DAY) continue;
    if (t.kind === "income") month.added += t.amount;
    else if (t.wanted) month.wanted += t.amount;
    else month.needed += t.amount;
  }
  const recent = s.txns
    .filter((t) => t.kind === "expense")
    .slice(0, 10)
    .map((t) => ({ label: t.label.slice(0, 80), amount: t.amount, wanted: !!t.wanted, daysAgo: Math.max(0, Math.floor((now - t.date) / DAY)) }));
  return {
    unitName: s.unitName,
    unitPrice: s.unitPrice,
    balance: s.balance,
    goal: s.goal,
    pocket: s.pocket ? { amount: s.pocket.amount, freq: s.pocket.freq } : null,
    recent,
    month,
  };
}

const inr = (n: number) => `₹${Math.round(n * 100) / 100}`;

/** Plain-text facts handed to Buddy, with the purchase limit and goal timing already worked out. */
export function buildBuddyFacts(c: BuddyContext): string {
  const u = (n: number) => `${toUnits(n, c.unitPrice)} ${c.unitName}`;
  const lines = [
    `- Their special unit: 1 ${c.unitName.replace(/s$/, "")} = ₹${c.unitPrice}.`,
    `- Savings right now: ${inr(c.balance)} (${u(c.balance)}).`,
    `- Biggest purchase allowed (must be less than this, and a parent must approve): ${inr(c.balance * PURCHASE_LIMIT_RATIO)} (${u(c.balance * PURCHASE_LIMIT_RATIO)}).`,
  ];
  const perDay = c.pocket ? dailyIncome(c.pocket.amount, c.pocket.freq) : 0;
  lines.push(c.pocket ? `- Pocket money: ${inr(c.pocket.amount)} ${c.pocket.freq} (about ${inr(perDay)} a day).` : "- No regular pocket money set up.");
  if (c.goal) {
    const left = Math.max(0, c.goal.price - c.balance);
    const days = left > 0 ? setbackDays(left, perDay) : 0;
    lines.push(
      `- Saving goal: ${c.goal.name}, costs ${inr(c.goal.price)} (${u(c.goal.price)}). Still needed: ${inr(left)} (${u(left)}).` +
        (left === 0 ? " Goal already reached!" : days ? ` At the pocket-money pace that is about ${days} days.` : " No pocket money, so no time estimate."),
    );
    if (perDay > 0) lines.push(`- Every ${inr(perDay)} spent pushes the goal back about one day.`);
  } else lines.push("- No saving goal set yet.");
  lines.push(`- Last 30 days: added ${inr(c.month.added)}, spent ${inr(c.month.needed)} on needs and ${inr(c.month.wanted)} on wants.`);
  if (c.recent.length)
    lines.push(
      "- Recent purchases: " +
        c.recent.map((r) => `${r.label} ${inr(r.amount)} (${r.wanted ? "just wanted" : "needed"}, ${r.daysAgo === 0 ? "today" : `${r.daysAgo} days ago`})`).join("; ") +
        ".",
    );
  return lines.join("\n");
}
