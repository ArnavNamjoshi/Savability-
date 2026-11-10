# Savability — Plan

A kid-friendly money app. Everything is saved on this device only (no accounts, no names, no emails).

## Look & feel
- Soft pale yellow + pale blue + white, with a deep navy-black for text and buttons.
- Rounded, friendly fonts: Fredoka (headings and numbers) + Nunito (body).
- Buttons use colorful light pastels outside the main palette (mint, peach, lavender, light coral) with navy text.
- Every amount shows the kid's unit big (e.g. "12 chocolates") with the rupee value small and faded grey below ("₹300").

## Pages
- `/` Welcome / setup: pick a fun unit name (pens, chocolates, chips, or type your own) and its price in ₹ (10/25/50 or custom), optional starting money, pick an avatar emoji (no real name). Redirects to dashboard once set up.
- `/dashboard` Balance card, quick "Add gift money" button, recurring pocket money (amount + weekly/monthly, auto-credited when due on app open), recent activity, level/XP bar.
- `/spending` Expense ledger: log an expense (name, ₹ amount, category, needed vs. wanted). Visual "file" list + category breakdown bars, all in units first.
- `/goal` Savings goal (e.g. cycle, ₹ price). Progress jar that moves up and down; saved vs. left in units. Setback calculator: each "wanted" purchase shows "set you back by N days" based on average daily income from pocket money.
- `/can-i-buy` Purchase check: enter item + price. If price is under 75% of balance → "Go call a parent!" then a clean Parent Approval screen (item, ₹ and units, Approve / Decline). Approve logs the expense. If 75% or more → friendly "Not yet — keep saving" message.
- `/battle` Savings Battle Royale: no made-up scenarios — the match follows the kid's real life. Joining starts a match (e.g. 7 days) with 20 simulated bots. Bots get knocked out over time with a live feed ("Bot Zara bought candy — eliminated!"). If the kid logs a "wanted" purchase (unneeded toy/snack) in the spending page or approves one via Can I Buy, they're knocked out. Survive until the end → win XP, badge, cosmetic.
- `/profile` Level, XP, badges earned, cosmetics (avatar frames, hats, backgrounds) — more unlock at each level; equip them. Settings to change unit name/price anytime and reset data.

Bottom navigation bar (mobile-style) shared across pages.

## Technical details
- TanStack routes per page above; shared layout/nav in `__root.tsx`.
- Single Zustand-free React context store (`src/lib/store.tsx`) persisted to localStorage, reading in `useEffect` to avoid hydration mismatch.
- Pure helpers in `src/lib/money.ts` (toUnits, canBuy 75% rule, setback days, XP→level) with vitest tests for the 75% rule, unit conversion, and setback days.
- Lucide icons, shadcn-style components, design tokens in `styles.css`.
