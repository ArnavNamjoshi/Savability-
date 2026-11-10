import { describe, expect, it } from "vitest";
import { canBuy, levelFromXp, setbackDays, toUnits } from "./money";

describe("money rules", () => {
  it("converts rupees to units", () => {
    expect(toUnits(300, 25)).toBe(12);
  });
  it("allows buying only under 75% of balance", () => {
    expect(canBuy(740, 1000)).toBe(true);
    expect(canBuy(750, 1000)).toBe(false);
  });
  it("computes setback days from daily income", () => {
    expect(setbackDays(30, 10)).toBe(3);
    expect(setbackDays(30, 0)).toBeNull();
  });
  it("levels up every 100 xp", () => {
    expect(levelFromXp(250)).toBe(3);
  });
});

import { cleanAmount, formatPercent } from "./money";

describe("goal jar percentage", () => {
  it("shows at most 2 decimal places without trailing zeros", () => {
    expect(formatPercent(100 / 3)).toBe("33.33");
    expect(formatPercent(12.5)).toBe("12.5");
    expect(formatPercent(10)).toBe("10");
    expect(formatPercent(10.004)).toBe("10");
  });
  it("never rounds up to the next number", () => {
    expect(formatPercent(99.999)).toBe("99.99");
  });
});

describe("money boxes", () => {
  it("blocks minus, plus and e", () => {
    expect(cleanAmount("-50")).toBe("50");
    expect(cleanAmount("1e5+")).toBe("15");
    expect(cleanAmount("12.5.3")).toBe("12.53");
  });
});
