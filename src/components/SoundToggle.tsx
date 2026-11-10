import { Volume2, VolumeX } from "lucide-react";
import { useStore } from "@/lib/store";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";

/** Speaker button that turns all sound effects on or off. */
export function SoundToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { state, toggleSound } = useStore();
  const on = !state.muted;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Turn sounds off" : "Turn sounds on"}
      onClick={() => {
        toggleSound();
        if (!on) setTimeout(() => play("right"), 30);
      }}
      className={cn(
        "flex items-center gap-2 rounded-2xl border-2 border-foreground font-display font-semibold shadow-[var(--shadow-pop)] transition-transform active:translate-y-[3px] active:shadow-none",
        on ? "bg-mint" : "bg-muted",
        compact ? "h-11 w-11 justify-center" : "w-full px-3 py-2.5",
        className,
      )}
    >
      {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      {!compact && <span>{on ? "Sounds on" : "Sounds off"}</span>}
    </button>
  );
}
