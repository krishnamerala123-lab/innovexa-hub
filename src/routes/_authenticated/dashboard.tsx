import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderPlus, Mail, Sparkles, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { profileCompleteness, useMyProfile, useProjects } from "@/lib/data";
import { computeMatch } from "@/lib/matching";
import { EmptyState, ProjectCard, ScoreRing } from "@/components/Cards";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Innovexa" }, { name: "description", content: "Your Innovexa student dashboard." }, { property: "og:title", content: "Dashboard — Innovexa" }, { property: "og:description", content: "Projects, matches and invitations." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: me } = useMyProfile();
  const { data: projects = [] } = useProjects();
  const p = me?.profile;
  const { data: pending = 0 } = useQuery({
    queryKey: ["pending-count", p?.id], enabled: !!p,
    queryFn: async () => (await supabase.from("invitations").select("id", { count: "exact", head: true }).eq("profile_id", p!.id).eq("status", "pending")).count ?? 0,
  });
  if (!p) return <p className="text-muted-foreground">Loading…</p>;
  const mine = projects.filter((x) => x.owner_id === p.id);
  const recs = projects.filter((x) => x.owner_id !== p.id).map((x) => ({ x, m: computeMatch(x, p) })).sort((a, b) => b.m.score - a.m.score).slice(0, 3);
  const pct = profileCompleteness(p);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-hero p-6 text-ink-foreground sm:p-8">
        <div className="absolute inset-0 grid-lines" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm text-ink-foreground/60">Welcome back</p><h1 className="text-3xl font-bold">{p.full_name.split(" ")[0] || "Innovator"} 👋</h1><p className="mt-1 text-ink-foreground/70">Discover. Connect. Learn. Build. Launch.</p></div>
          <Button asChild variant="hero"><Link to="/projects/new"><FolderPlus />New project</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<UserRound />} label="Profile complete" value={`${pct}%`}><Progress value={pct} className="mt-2" />{pct < 100 && <Link to="/profile" className="mt-2 block text-xs font-semibold text-primary">Complete profile →</Link>}</Stat>
        <Stat icon={<FolderPlus />} label="Your projects" value={String(mine.length)} />
        <Stat icon={<Mail />} label="Pending invitations" value={String(pending)}>{pending > 0 && <Link to="/invitations" className="mt-2 block text-xs font-semibold text-primary">Respond →</Link>}</Stat>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your projects</h2>
        {mine.length ? <div className="grid gap-4 md:grid-cols-2">{mine.map((x) => <ProjectCard key={x.id} p={x} />)}</div> : <EmptyState icon={<FolderPlus />} title="No projects yet" text="Post an idea and Innovexa will rank students whose skills fill your gaps." action={<Button asChild><Link to="/projects/new">Create a project</Link></Button>} />}
      </section>

      <section>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-4 text-primary" />Projects that fit you</h2>
        <p className="mb-3 text-sm text-muted-foreground">Ranked using your profile and the proposed matching weights.</p>
        {recs.length ? <div className="grid gap-4 md:grid-cols-3">{recs.map(({ x, m }) => <ProjectCard key={x.id} p={x} right={<ScoreRing score={m.score} />} />)}</div> : <EmptyState icon={<Sparkles />} title="No other projects yet" text="Check back once others post projects." />}
      </section>
    </div>
  );
}
function Stat({ icon, label, value, children }: { icon: React.ReactNode; label: string; value: string; children?: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-card"><div className="flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4">{icon}{label}</div><p className="mt-2 font-display text-3xl font-bold">{value}</p>{children}</div>;
}
