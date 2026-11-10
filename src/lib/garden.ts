/** Growth Garden rules. A plant grows one step for each saving day and each goal milestone. */

export const STAGES = ["seed", "sprout", "bud", "bloom"] as const;
export type Stage = (typeof STAGES)[number];
export const XP_PER_GROWTH = 20;
export const GOAL_MILESTONES = [25, 50, 75, 100];

type T = { kind: "income" | "expense"; wanted?: boolean; date: number };

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** A saving day: money was added that day and nothing "just wanted" was bought. */
export function savingDays(txns: T[]): number {
  const added = new Set<string>();
  const treat = new Set<string>();
  for (const t of txns) {
    if (t.kind === "income") added.add(dayKey(t.date));
    else if (t.wanted) treat.add(dayKey(t.date));
  }
  let n = 0;
  for (const d of added) if (!treat.has(d)) n++;
  return n;
}

/** Milestone ids reached for the current goal, e.g. "cycle:4000:50". */
export function goalMilestones(balance: number, goal: { name: string; price: number } | null): string[] {
  if (!goal || goal.price <= 0) return [];
  const pct = (Math.max(0, balance) / goal.price) * 100;
  return GOAL_MILESTONES.filter((m) => pct >= m).map((m) => `${goal.name}:${goal.price}:${m}`);
}

/** Where the garden is: how many plants have fully bloomed and the stage of the one growing now. */
export function plantView(points: number): { bloomed: number; stage: Stage; stepsToNext: number } {
  const p = Math.max(0, Math.floor(points));
  const bloomed = Math.floor(p / STAGES.length);
  const idx = p % STAGES.length;
  return { bloomed, stage: STAGES[idx] ?? "seed", stepsToNext: STAGES.length - idx };
}
