import { describe, expect, it } from "vitest";
import { BOT_AVATARS, looksEvenlyCycled, makeBots, pickBotAvatars } from "./bots";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("battle bot pictures", () => {
  it("some pictures are chosen more than others", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const picks = pickBotAvatars(200, seeded(seed));
      const counts = BOT_AVATARS.map((id) => picks.filter((p) => p === id).length);
      expect(Math.max(...counts)).toBeGreaterThan(Math.min(...counts) * 3);
    }
  });

  it("pictures are not in the old repeating order", () => {
    const bots = makeBots(0, 1000, seeded(7));
    expect(bots).toHaveLength(20);
    expect(looksEvenlyCycled(bots.map((b) => b.avatar))).toBe(false);
  });
});
