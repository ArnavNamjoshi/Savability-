import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackToGames() {
  return (
    <Link to="/games" className="inline-flex items-center gap-1.5 rounded-xl border-2 border-foreground/20 bg-card px-3 py-1.5 text-sm font-bold hover:border-foreground">
      <ArrowLeft className="h-4 w-4" /> All games
    </Link>
  );
}
