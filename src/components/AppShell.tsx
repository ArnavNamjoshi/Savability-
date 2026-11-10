import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, ReceiptIndianRupee, Target, ShoppingCart, Gamepad2, User } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { ART } from "@/lib/art";
import { CheerCard, CheerRow } from "./Motivation";
import { SoundToggle } from "./SoundToggle";

const NAV = [
  { to: "/dashboard", label: "Home", short: "Home", icon: Home, tint: "bg-mint" },
  { to: "/spending", label: "Spending", short: "Spend", icon: ReceiptIndianRupee, tint: "bg-peach" },
  { to: "/goal", label: "Goal", short: "Goal", icon: Target, tint: "bg-lemon" },
  { to: "/can-i-buy", label: "Can I buy?", short: "Buy?", icon: ShoppingCart, tint: "bg-sky" },
  { to: "/games", label: "Games", short: "Games", icon: Gamepad2, tint: "bg-coral" },
  { to: "/profile", label: "Me", short: "Me", icon: User, tint: "bg-lavender" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { state, ready } = useStore();
  const loc = useLocation();
  const nav = useNavigate();
  const isSetup = loc.pathname === "/";
  const showNav = !isSetup && state.setup;
  const onBuddy = loc.pathname.startsWith("/buddy");
  const seed = Math.max(0, NAV.findIndex((n) => loc.pathname.startsWith(n.to)));

  useEffect(() => {
    if (ready && !state.setup && !isSetup) nav({ to: "/" });
  }, [ready, state.setup, isSetup, nav]);

  if (!ready) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen">
      {showNav && (
        <aside className="dots-soft fixed inset-y-0 left-0 z-20 hidden w-64 flex-col overflow-y-auto border-r-4 border-foreground bg-card px-4 py-6 md:flex">
          <Link to="/dashboard" className="mb-6 flex items-center gap-2 rounded-2xl bg-card px-2 py-1">
            <img src={ART.piggy} alt="" className="h-12 w-12" />
            <span className="font-display text-2xl font-bold">Savability</span>
          </Link>
          <nav className="flex flex-col gap-2.5">
            {NAV.map(({ to, label, icon: Icon, tint }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-2xl border-2 border-foreground/15 bg-card px-3 py-2.5 font-display text-lg font-semibold text-foreground transition-colors hover:border-foreground/50"
                activeProps={{ className: `${tint} !border-foreground shadow-[var(--shadow-pop)]` }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground bg-card">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">{label}</span>
                <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground/30 group-data-[status=active]:border-foreground group-data-[status=active]:bg-foreground" />
              </Link>
            ))}
          </nav>
          <SoundToggle className="mt-5" />
          <CheerCard start={seed + 2} compact className="mt-auto flex-col pt-4 text-center" />
        </aside>
      )}

      {showNav && (
        <div className="fixed right-3 top-3 z-30 md:hidden">
          <SoundToggle compact />
        </div>
      )}

      <main className={showNav ? "md:pl-64" : ""}>
        <div className={showNav ? "mx-auto max-w-5xl px-4 pb-28 pt-6 md:px-10 md:pb-10 md:pt-10" : "mx-auto max-w-2xl px-4 pb-10 pt-6"}>
          {children}
          {!onBuddy && <CheerRow seed={seed + 1} />}
        </div>
      </main>

      {showNav && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t-4 border-foreground bg-card md:hidden">
          <div className="mx-auto flex max-w-xl justify-between gap-0.5 px-1 py-2">
            {NAV.map(({ to, short, icon: Icon, tint }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 border-transparent py-1.5 text-[11px] font-semibold text-foreground"
                activeProps={{ className: `${tint} !border-foreground font-bold` }}
              >
                <Icon className="h-5 w-5" />
                {short}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      {sub && <p className="text-muted-foreground">{sub}</p>}
    </div>
  );
}

export const inputCls = "w-full rounded-2xl border-2 bg-card px-4 py-3 text-lg outline-none focus:border-ring";
