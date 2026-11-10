export type Frequency = "weekly" | "monthly";

export const PURCHASE_LIMIT_RATIO = 0.75;

/** Convert rupees into the kid's imaginary unit. */
export function toUnits(inr: number, unitPrice: number): number {
  if (unitPrice <= 0) return 0;
  return Math.round((inr / unitPrice) * 10) / 10;
}

/** A purchase is allowed (with a parent) only when it costs under 75% of balance. */
export function canBuy(price: number, balance: number): boolean {
  return price > 0 && price < balance * PURCHASE_LIMIT_RATIO;
}

export function dailyIncome(amount: number, freq: Frequency): number {
  if (amount <= 0) return 0;
  return freq === "weekly" ? amount / 7 : amount / 30;
}

/** Days a purchase pushes a goal back, given daily income. Null when there is no income. */
export function setbackDays(price: number, perDay: number): number | null {
  if (perDay <= 0) return null;
  return Math.max(1, Math.ceil(price / perDay));
}

export const XP_PER_LEVEL = 100;
export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** Goal-jar percentage: at most 2 decimal places (cut, never rounded up), no trailing zeros. */
export function formatPercent(pct: number): string {
  if (!Number.isFinite(pct) || pct <= 0) return "0";
  const cut = Math.floor(pct * 100 + 1e-6) / 100;
  return cut.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/** Keep only what a money box allows: digits and one decimal point (no minus, plus or "e"). */
export function cleanAmount(text: string): string {
  const only = text.replace(/[^0-9.]/g, "");
  const dot = only.indexOf(".");
  return dot === -1 ? only : only.slice(0, dot + 1) + only.slice(dot + 1).replace(/\./g, "");
}
