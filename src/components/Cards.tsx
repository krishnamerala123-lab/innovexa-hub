import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Clock, Layers } from "lucide-react";
import { initials, type Profile } from "@/lib/data";
import { stageLabel } from "@/lib/roadmap";
import { cn } from "@/lib/utils";

export function SampleBadge({ sample }: { sample: boolean }) {
  return sample ? (
    <span className="rounded-full border border-warning/50 bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">Sample</span>
  ) : (
    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">Registered</span>
  );
}

export function Chip({ children, hit }: { children: ReactNode; hit?: boolean }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", hit ? "bg-highlight text-highlight-foreground" : "bg-secondary text-secondary-foreground")}>{children}</span>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground", className)}>{initials(name)}</div>;
}

export function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative grid size-14 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${score * 3.6}deg, var(--secondary) 0)` }}>
      <div className="grid size-11 place-items-center rounded-full bg-card font-display text-sm font-bold">{score}</div>
    </div>
  );
}

export function ProfileCard({ p, highlight = [], children }: { p: Profile; highlight?: string[]; children?: ReactNode }) {
  const hl = new Set(highlight.map((s) => s.toLowerCase()));
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <Avatar name={p.full_name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{p.full_name || "Unnamed student"}</h3><SampleBadge sample={p.is_sample} /></div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{p.intro || "No introduction yet."}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">{[...p.tech_skills, ...p.soft_skills].slice(0, 8).map((s) => <Chip key={s} hit={hl.has(s.toLowerCase())}>{s}</Chip>)}</div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground"><Clock className="size-3.5" />{p.availability_hours} h/week{p.interests.length > 0 && <span>· {p.interests.slice(0, 3).join(", ")}</span>}</div>
      {children}
    </div>
  );
}

type ProjectLike = { id: string; title: string; problem: string; required_skills: string[]; stage: string; expected_hours: number; is_sample: boolean; owner?: { full_name: string } | null };
export function ProjectCard({ p, right }: { p: ProjectLike; right?: ReactNode }) {
  return (
    <Link to="/projects/$id" params={{ id: p.id }} className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground"><Layers className="size-3" />{stageLabel(p.stage)}</span><SampleBadge sample={p.is_sample} /></div>
          <h3 className="font-semibold group-hover:text-primary">{p.title}</h3>
          {p.owner && <p className="text-xs text-muted-foreground">by {p.owner.full_name}</p>}
        </div>
        {right}
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{p.problem}</p>
      <div className="flex flex-wrap gap-1">{p.required_skills.slice(0, 6).map((s) => <Chip key={s}>{s}</Chip>)}</div>
    </Link>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-muted-foreground">{sub}</p>}</div>
      {action}
    </div>
  );
}
