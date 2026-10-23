import { Link } from "@tanstack/react-router";

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-highlight font-display text-base font-extrabold text-highlight-foreground">i</span>
      <span className={`font-display text-lg font-bold tracking-tight ${light ? "text-ink-foreground" : "text-foreground"}`}>INNOVEXA</span>
    </Link>
  );
}
