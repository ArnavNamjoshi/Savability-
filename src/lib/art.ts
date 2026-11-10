import fox from "@/assets/art/buddy-fox.png";
import panda from "@/assets/art/buddy-panda.png";
import frog from "@/assets/art/buddy-frog.png";
import lion from "@/assets/art/buddy-lion.png";
import penguin from "@/assets/art/buddy-penguin.png";
import unicorn from "@/assets/art/buddy-unicorn.png";
import cap from "@/assets/art/hat-cap.png";
import crown from "@/assets/art/hat-crown.png";
import wizard from "@/assets/art/hat-wizard.png";
import trophy from "@/assets/art/hat-trophy.png";
import rocket from "@/assets/art/hat-rocket.png";
import piggy from "@/assets/art/piggy.png";
import turtle from "@/assets/art/turtle.png";
import party from "@/assets/art/party.png";
import bike from "@/assets/art/goal-bike.png";
import coinPlant from "@/assets/art/coin-plant.png";
import cheerStar from "@/assets/art/cheer-star.png";
import rocketUp from "@/assets/art/rocket-up.png";
import flower from "@/assets/art/hat-flower.png";
import seed from "@/assets/art/plant-seed.png";
import sprout from "@/assets/art/plant-sprout.png";
import bud from "@/assets/art/plant-bud.png";
import bloom from "@/assets/art/plant-bloom.png";

export const PLANTS = { seed, sprout, bud, bloom };

export const BUDDIES: Record<string, string> = { fox, panda, frog, lion, penguin, unicorn };
export const BUDDY_IDS = Object.keys(BUDDIES);

/** Picture for a buddy id; older saved data (or unknown ids) falls back to a fixed buddy. */
export function buddySrc(id: string | undefined, fallbackIndex = 0): string {
  if (id && BUDDIES[id]) return BUDDIES[id];
  return BUDDIES[BUDDY_IDS[fallbackIndex % BUDDY_IDS.length] ?? "fox"] ?? fox;
}

export const HATS: Record<string, string> = {
  "hat-cap": cap,
  "hat-crown": crown,
  "hat-wizard": wizard,
  "hat-trophy": trophy,
  "hat-rocket": rocket,
  "hat-flower": flower,
  "hat-star": cheerStar,
};

export const ART = { piggy, turtle, party, bike, coinPlant, cheerStar, rocketUp };
