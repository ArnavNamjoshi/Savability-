/** 30-Second Money Swipe: cards, timer length and rewards. */

export const SWIPE_SECONDS = 30;
export const XP_PER_CORRECT = 2;

export type SwipeCard = { text: string; right: boolean };

export const CARDS: SwipeCard[] = [
  { text: "Putting half of your birthday money in your savings jar", right: true },
  { text: "Spending all your pocket money on the first day", right: false },
  { text: "Waiting one day before buying a toy you just saw", right: true },
  { text: "Buying a snack every day on the way home", right: false },
  { text: "Writing down what you spend", right: true },
  { text: "Buying something only because your friend has it", right: false },
  { text: "Comparing prices before you buy", right: true },
  { text: "Asking a grown-up before a big purchase", right: true },
  { text: "Losing track of where your money went", right: false },
  { text: "Picking a goal and saving a little every week", right: true },
  { text: "Buying a toy you already have at home", right: false },
  { text: "Fixing an old thing instead of buying a new one", right: true },
  { text: "Buying the first thing you see in the shop", right: false },
  { text: "Keeping your coins safe in one place", right: true },
  { text: "Spending your goal money on sweets", right: false },
  { text: "Sharing a game with a friend instead of both buying it", right: true },
  { text: "Saying \"not today\" to an ad that pops up", right: true },
  { text: "Buying lots of cheap things that break fast", right: false },
  { text: "Counting how many days a treat pushes your goal back", right: true },
  { text: "Hiding a purchase from your parents", right: false },
  { text: "Making a wish list and waiting a week", right: true },
  { text: "Spending gift money right away without thinking", right: false },
  { text: "Choosing one great thing over many small treats", right: true },
  { text: "Buying in-game coins every time you get bored", right: false },
  { text: "Borrowing a book from the library instead of buying it", right: true },
  { text: "Buying something just because it is on sale", right: false },
];

export const SWIPE_COSMETICS = [
  { id: "frame-swipe", score: 5, label: "Swipe ring" },
  { id: "hat-star", score: 10, label: "Star clip" },
  { id: "bg-sunset", score: 15, label: "Sunset" },
] as const;

/** XP and gear earned for one round, given how many cards were answered right. */
export function swipeReward(correct: number): { xp: number; cosmetics: string[] } {
  const c = Math.max(0, Math.floor(correct));
  return { xp: c * XP_PER_CORRECT, cosmetics: SWIPE_COSMETICS.filter((g) => c >= g.score).map((g) => g.id) };
}
