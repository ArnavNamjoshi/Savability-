import { toUnits } from "@/lib/money";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Rupees shown big in navy-black; the kid's own unit sits smaller and grey underneath. */
export function Money({ inr, size = "md", className }: { inr: number; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const { state } = useStore();
  const units = toUnits(inr, state.unitPrice);
  const big = { sm: "text-lg", md: "text-2xl", lg: "text-4xl", xl: "text-6xl" }[size];
  const small = { sm: "text-sm", md: "text-sm", lg: "text-base", xl: "text-lg" }[size];
  return (
    <div className={cn("leading-tight", className)}>
      <div className={cn("font-display font-bold text-foreground", big)}>₹{inr.toLocaleString("en-IN")}</div>
      <div className={cn("font-semibold text-unit", small)}>
        {units} {state.unitName}
      </div>
    </div>
  );
}
