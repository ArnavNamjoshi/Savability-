import { cleanAmount } from "@/lib/money";
import { inputCls } from "@/components/AppShell";

const BLOCKED = new Set(["-", "+", "e", "E"]);

/** The one money box used everywhere: only digits and a decimal point can go in. */
export function AmountInput({
  value,
  onValue,
  placeholder,
}: {
  value: string | number;
  onValue: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className={inputCls}
      type="text"
      inputMode="decimal"
      value={value}
      placeholder={placeholder}
      onKeyDown={(e) => {
        if (BLOCKED.has(e.key)) e.preventDefault();
      }}
      onChange={(e) => onValue(cleanAmount(e.target.value))}
    />
  );
}
