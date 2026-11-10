import { useStore, type Cosmetic } from "@/lib/store";
import { buddySrc, HATS } from "@/lib/art";
import { cn } from "@/lib/utils";

const FRAME: Record<string, string> = {
  "frame-sky": "border-sky",
  "frame-gold": "border-lemon",
  "frame-fire": "border-coral",
  "frame-leaf": "border-mint",
  "frame-swipe": "border-lavender",
};
const BG: Record<string, string> = {
  "bg-stars": "bg-lavender",
  "bg-rainbow": "bg-gradient-to-br from-coral via-lemon to-mint",
  "bg-confetti": "bg-peach",
  "bg-garden": "bg-gradient-to-b from-sky to-mint",
  "bg-sunset": "bg-gradient-to-br from-lemon via-peach to-coral",
};

export function Avatar({ size = 64 }: { size?: number }) {
  const { state } = useStore();
  const hat = state.equipped.hat ? HATS[state.equipped.hat] : undefined;
  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(
          "flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 bg-sunny",
          FRAME[state.equipped.frame ?? ""] ?? "border-border",
          BG[state.equipped.bg ?? ""],
        )}
      >
        <img src={buddySrc(state.avatar)} alt="My buddy" className="h-[78%] w-[78%] object-contain" />
      </div>
      {hat && (
        <img
          src={hat}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 object-contain"
          style={{ width: size * 0.45, height: size * 0.45, top: -size * 0.22 }}
        />
      )}
    </div>
  );
}

/** Picture for a piece of gear: hats are drawings, rings and backgrounds are colour swatches. */
export function GearIcon({ c, size = 40 }: { c: Cosmetic; size?: number }) {
  if (c.slot === "hat") return <img src={HATS[c.id]} alt={c.label} style={{ width: size, height: size }} className="object-contain" />;
  if (c.slot === "frame")
    return <span className={cn("block rounded-full border-[6px] bg-card", FRAME[c.id])} style={{ width: size, height: size }} />;
  return <span className={cn("block rounded-xl border-2 border-foreground/20", BG[c.id])} style={{ width: size, height: size }} />;
}
