import type React from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Frequency } from "./money";
import { levelFromXp } from "./money";
import { looksEvenlyCycled, makeBots, pickBotAvatars, shuffle } from "./bots";
import { goalMilestones, plantView, savingDays, XP_PER_GROWTH } from "./garden";
import { swipeReward } from "./swipe";
import { play, setSoundOn } from "./sound";

export type Txn = {
  id: string;
  kind: "income" | "expense";
  label: string;
  amount: number;
  category?: string; // kept only for older saved entries
  wanted?: boolean;
  date: number;
};

export type Match = {
  startedAt: number;
  endsAt: number;
  bots: { name: string; avatar: string; outAt: number; reason: string }[];
  status: "playing" | "won" | "lost";
};

export type State = {
  setup: boolean;
  unitName: string;
  unitPrice: number;
  avatar: string;
  balance: number;
  txns: Txn[];
  pocket: { amount: number; freq: Frequency; lastPaid: number } | null;
  goal: { name: string; price: number } | null;
  xp: number;
  badges: string[];
  cosmetics: string[];
  equipped: { frame?: string; hat?: string; bg?: string };
  match: Match | null;
  wins: number;
  muted: boolean;
  gardenPoints: number;
  gardenMilestones: string[];
  swipeBest: number;
};

const initial: State = {
  setup: false,
  unitName: "chocolates",
  unitPrice: 10,
  avatar: "fox",
  balance: 0,
  txns: [],
  pocket: null,
  goal: null,
  xp: 0,
  badges: [],
  cosmetics: ["frame-sky"],
  equipped: { frame: "frame-sky" },
  match: null,
  wins: 0,
  muted: false,
  gardenPoints: 0,
  gardenMilestones: [],
  swipeBest: 0,
};

const KEY = "savability-state-v1";
const DAY = 86400000;

export type Cosmetic = { id: string; slot: "frame" | "hat" | "bg"; label: string; level: number; hint?: string };
export const COSMETICS: Cosmetic[] = [
  { id: "frame-sky", slot: "frame", label: "Sky ring", level: 1 },
  { id: "hat-cap", slot: "hat", label: "Cap", level: 2 },
  { id: "bg-stars", slot: "bg", label: "Stars", level: 2 },
  { id: "frame-gold", slot: "frame", label: "Gold ring", level: 3 },
  { id: "hat-crown", slot: "hat", label: "Crown", level: 4 },
  { id: "bg-rainbow", slot: "bg", label: "Rainbow", level: 5 },
  { id: "hat-wizard", slot: "hat", label: "Wizard hat", level: 6 },
  { id: "frame-fire", slot: "frame", label: "Fire ring", level: 8 },
];
export const WIN_COSMETICS: Cosmetic[] = [
  { id: "hat-trophy", slot: "hat", label: "Trophy", level: 0, hint: "Win battle" },
  { id: "bg-confetti", slot: "bg", label: "Confetti", level: 0, hint: "Win battle" },
  { id: "hat-rocket", slot: "hat", label: "Rocket", level: 0, hint: "Win battle" },
];
/** Botanical gear: one for each plant that fully blooms in the Growth Garden. */
export const GARDEN_COSMETICS: Cosmetic[] = [
  { id: "hat-flower", slot: "hat", label: "Flower crown", level: 0, hint: "1 bloom" },
  { id: "frame-leaf", slot: "frame", label: "Leaf ring", level: 0, hint: "2 blooms" },
  { id: "bg-garden", slot: "bg", label: "Garden", level: 0, hint: "3 blooms" },
];
export const SWIPE_GEAR: Cosmetic[] = [
  { id: "frame-swipe", slot: "frame", label: "Swipe ring", level: 0, hint: "Swipe 5" },
  { id: "hat-star", slot: "hat", label: "Star clip", level: 0, hint: "Swipe 10" },
  { id: "bg-sunset", slot: "bg", label: "Sunset", level: 0, hint: "Swipe 15" },
];

/** Matches saved before pictures were mixed up get a fresh, uneven mix of pictures. */
function remixBots(s: State): State {
  const m = s.match;
  if (!m || !looksEvenlyCycled(m.bots.map((b) => b.avatar))) return s;
  const avatars = pickBotAvatars(m.bots.length);
  const bots = shuffle(m.bots).map((b, i) => ({ ...b, avatar: avatars[i] ?? b.avatar }));
  return { ...s, match: { ...m, bots } };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function addCosmetics(s: State, ids: string[]): State {
  const fresh = ids.filter((id) => !s.cosmetics.includes(id));
  return fresh.length ? { ...s, cosmetics: [...s.cosmetics, ...fresh] } : s;
}

function grantLevelCosmetics(s: State): State {
  const lvl = levelFromXp(s.xp);
  return addCosmetics(s, COSMETICS.filter((c) => c.level <= lvl).map((c) => c.id));
}

/** Grow the garden from saving days and goal milestones; pays XP and botanical gear once per step. */
function growGarden(s: State): State {
  const reached = goalMilestones(s.balance, s.goal).filter((m) => !s.gardenMilestones.includes(m));
  const milestones = reached.length ? [...s.gardenMilestones, ...reached] : s.gardenMilestones;
  const points = savingDays(s.txns) + milestones.length;
  if (points <= s.gardenPoints && !reached.length) return s;
  const gained = Math.max(0, points - s.gardenPoints);
  const next: State = { ...s, gardenMilestones: milestones, gardenPoints: Math.max(points, s.gardenPoints), xp: s.xp + gained * XP_PER_GROWTH };
  const blooms = plantView(next.gardenPoints).bloomed;
  return grantLevelCosmetics(addCosmetics(next, GARDEN_COSMETICS.slice(0, blooms).map((c) => c.id)));
}

function payPocket(s: State): State {
  if (!s.pocket) return s;
  const period = (s.pocket.freq === "weekly" ? 7 : 30) * DAY;
  let { lastPaid } = s.pocket;
  let balance = s.balance;
  const txns = [...s.txns];
  while (Date.now() - lastPaid >= period) {
    lastPaid += period;
    balance += s.pocket.amount;
    txns.unshift({ id: uid(), kind: "income", label: "Pocket money", amount: s.pocket.amount, date: lastPaid });
  }
  return { ...s, balance, txns, pocket: { ...s.pocket, lastPaid } };
}

function settleMatch(s: State): State {
  const m = s.match;
  if (!m || m.status !== "playing" || Date.now() < m.endsAt) return s;
  const prize = WIN_COSMETICS.find((c) => !s.cosmetics.includes(c.id));
  const badge = `Battle Champion #${s.wins + 1}`;
  return grantLevelCosmetics({
    ...s,
    match: { ...m, status: "won" },
    wins: s.wins + 1,
    xp: s.xp + 150,
    badges: [...s.badges, badge],
    cosmetics: prize ? [...s.cosmetics, prize.id] : s.cosmetics,
  });
}

type Ctx = {
  state: State;
  ready: boolean;
  update: (fn: (s: State) => State) => void;
  addIncome: (label: string, amount: number) => void;
  addExpense: (e: { label: string; amount: number; wanted: boolean }, opts?: { approved?: boolean }) => void;
  startMatch: (days: number) => void;
  finishSwipe: (correct: number) => void;
  toggleSound: () => void;
  reset: () => void;
};

// Keep one shared context object even when this file is hot-reloaded during editing;
// otherwise the page and its provider can end up holding two different contexts.
const g = globalThis as { __savabilityStoreCtx?: React.Context<Ctx | null> };
const StoreCtx = (g.__savabilityStoreCtx ??= createContext<Ctx | null>(null));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const loaded: State = raw ? { ...initial, ...JSON.parse(raw) } : initial;
      setState(growGarden(settleMatch(payPocket(remixBots(loaded)))));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    setSoundOn(!state.muted);
  }, [state.muted]);

  useEffect(() => {
    const t = setInterval(() => setState((s) => settleMatch(s)), 5000);
    return () => clearInterval(t);
  }, []);

  // Grow the garden whenever spending, saving or the goal changes.
  useEffect(() => {
    if (ready) setState((s) => growGarden(s));
  }, [ready, state.txns, state.goal, state.balance]);

  // Sounds for big moments: winning or losing a battle, and filling the goal jar.
  const prevStatus = useRef<string | undefined>(undefined);
  const prevReached = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (!ready) return;
    const status = state.match?.status;
    if (prevStatus.current === "playing" && status === "won") play("fanfare");
    if (prevStatus.current === "playing" && status === "lost") play("slide");
    prevStatus.current = status;
    const reached = !!state.goal && state.balance >= state.goal.price;
    if (prevReached.current === false && reached) setTimeout(() => play("fanfare"), 500);
    prevReached.current = reached;
  }, [ready, state.match?.status, state.goal, state.balance]);

  const update = useCallback((fn: (s: State) => State) => setState(fn), []);

  const addIncome = useCallback((label: string, amount: number) => {
    play("chime");
    if (ref.current.goal) setTimeout(() => play("clink"), 380);
    setState((s) => ({
      ...s,
      balance: s.balance + amount,
      txns: [{ id: uid(), kind: "income", label, amount, date: Date.now() }, ...s.txns],
    }));
  }, []);

  const addExpense = useCallback((e: { label: string; amount: number; wanted: boolean }, opts?: { approved?: boolean }) => {
    const knocksOut = e.wanted && ref.current.match?.status === "playing";
    if (opts?.approved) play("stamp");
    else if (!knocksOut) play("whoosh");
    setState((s) => {
      let match = s.match;
      if (match && match.status === "playing" && e.wanted) match = { ...match, status: "lost" };
      return {
        ...s,
        match,
        balance: s.balance - e.amount,
        xp: e.wanted ? s.xp : s.xp + 5,
        txns: [{ id: uid(), kind: "expense", ...e, date: Date.now() }, ...s.txns],
      };
    });
  }, []);

  const startMatch = useCallback((days: number) => {
    const now = Date.now();
    const end = now + days * DAY;
    const bots = makeBots(now, end);
    setState((s) => ({ ...s, match: { startedAt: now, endsAt: end, bots, status: "playing" } }));
  }, []);

  const finishSwipe = useCallback((correct: number) => {
    const r = swipeReward(correct);
    setState((s) => grantLevelCosmetics(addCosmetics({ ...s, xp: s.xp + r.xp, swipeBest: Math.max(s.swipeBest, correct) }, r.cosmetics)));
  }, []);

  const toggleSound = useCallback(() => {
    setState((s) => ({ ...s, muted: !s.muted }));
  }, []);

  const reset = useCallback(() => setState(initial), []);

  return (
    <StoreCtx.Provider value={{ state, ready, update, addIncome, addExpense, startMatch, finishSwipe, toggleSound, reset }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export { grantLevelCosmetics };
