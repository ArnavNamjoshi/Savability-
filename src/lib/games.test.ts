import { describe, expect, it } from "vitest";
import { goalMilestones, plantView, savingDays } from "./garden";
import { swipeReward } from "./swipe";

const day = (d: number, h = 10) => new Date(2026, 10, d, h).getTime();

describe("growth garden", () => {
  it("counts each day money was added as one saving day", () => {
    const txns = [
      { kind: "income" as const, date: day(1) },
      { kind: "income" as const, date: day(1, 18) },
      { kind: "income" as const, date: day(2) },
    ];
    expect(savingDays(txns)).toBe(2);
  });
  it("does not count a day with a 'just wanted' purchase", () => {
    const txns = [
      { kind: "income" as const, date: day(1) },
      { kind: "expense" as const, wanted: true, date: day(1, 15) },
      { kind: "income" as const, date: day(2) },
    ];
    expect(savingDays(txns)).toBe(1);
  });
  it("reaches goal milestones at 25, 50, 75 and 100 percent", () => {
    expect(goalMilestones(2000, { name: "cycle", price: 4000 })).toHaveLength(2);
    expect(goalMilestones(4000, { name: "cycle", price: 4000 })).toHaveLength(4);
  });
  it("goes seed, sprout, bud, bloom, then starts a new plant", () => {
    expect(plantView(0).stage).toBe("seed");
    expect(plantView(3).stage).toBe("bloom");
    expect(plantView(4)).toMatchObject({ bloomed: 1, stage: "seed" });
  });
});

describe("money swipe rewards", () => {
  it("gives 2 XP per right answer", () => {
    expect(swipeReward(7).xp).toBe(14);
  });
  it("unlocks gear at 5, 10 and 15 right answers", () => {
    expect(swipeReward(4).cosmetics).toEqual([]);
    expect(swipeReward(10).cosmetics).toEqual(["frame-swipe", "hat-star"]);
    expect(swipeReward(15).cosmetics).toHaveLength(3);
  });
});
