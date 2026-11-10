/** Pretend players for the Savings Battle. Pure helpers so they can be tested with a fixed random source. */

export const BOT_NAMES = ["Zara", "Kabir", "Mia", "Aarav", "Leo", "Isha", "Ravi", "Nora", "Tara", "Omar", "Anya", "Vik", "Sana", "Dev", "Lily", "Arjun", "Rhea", "Max", "Neel", "Pia"];
export const BOT_AVATARS = ["panda", "frog", "lion", "penguin", "unicorn", "fox"];
export const REASONS = ["bought candy", "grabbed a toy", "got ice cream", "bought stickers", "spent on chips", "bought a balloon", "got a soda"];

type Rng = () => number;

export function shuffle<T>(list: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/**
 * Picks a picture for each bot. Every match gives each picture its own popularity,
 * from very common to rare, so some pictures show up a lot and others barely at all.
 */
export function pickBotAvatars(count: number, rng: Rng = Math.random): string[] {
  const popularity = shuffle([12, 7, 4, 2, 1, 0.5], rng);
  const weights = BOT_AVATARS.map((id, i) => ({ id, w: popularity[i] ?? 1 }));
  const total = weights.reduce((sum, x) => sum + x.w, 0);
  return Array.from({ length: count }, () => {
    let r = rng() * total;
    for (const x of weights) {
      r -= x.w;
      if (r <= 0) return x.id;
    }
    return weights[0]?.id ?? "fox";
  });
}

/** True when bots still use the old even, repeating picture order. */
export function looksEvenlyCycled(avatars: string[]): boolean {
  return avatars.length > 0 && avatars.every((a, i) => a === BOT_AVATARS[i % BOT_AVATARS.length]);
}

export function makeBots(now: number, end: number, rng: Rng = Math.random) {
  const names = shuffle(BOT_NAMES, rng);
  const avatars = pickBotAvatars(names.length, rng);
  return names.map((name, i) => ({
    name,
    avatar: avatars[i] ?? "fox",
    outAt: now + rng() * (end - now) * 0.97,
    reason: REASONS[Math.floor(rng() * REASONS.length)] ?? "bought candy",
  }));
}
