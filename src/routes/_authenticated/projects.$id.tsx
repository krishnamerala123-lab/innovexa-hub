import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, Circle, Clock, Send, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInvalidate, useMyProfile, useProfiles, type Profile } from "@/lib/data";
import { computeMatch, DEFAULT_WEIGHTS, missingTeamSkills, type Weights } from "@/lib/matching";
import { CHECKLIST, ROADMAP, stageLabel } from "@/lib/roadmap";
import { Avatar, Chip, EmptyState, ProfileCard, SampleBadge, ScoreRing } from "@/components/Cards";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tab = "overview" | "matches" | "team" | "roadmap";
export const Route = createFileRoute("/_authenticated/projects/$id")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } => (["overview", "matches", "team", "roadmap"].includes(s["tab"] as string) ? { tab: s["tab"] as Tab } : {}),
  head: () => ({ meta: [{ title: "Project — Innovexa" }, { name: "description", content: "Project details, ranked teammate matches, team and roadmap." }, { property: "og:title", content: "Project — Innovexa" }, { property: "og:description", content: "Find teammates and follow the roadmap." }] }),
  component: ProjectPage,
});

function ProjectPage() {
  const { id } = Route.useParams();
  const { tab = "overview" } = Route.useSearch();
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const { data: me } = useMyProfile();
  const { data: profiles = [] } = useProfiles();
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => (await supabase.from("projects").select("*").eq("id", id).maybeSingle()).data,
  });
  const { data: invites = [] } = useQuery({
    queryKey: ["project-invites", id],
    queryFn: async () => (await supabase.from("invitations").select("*").eq("project_id", id).order("created_at", { ascending: false })).data ?? [],
  });

  if (isLoading || !me?.profile) return <p className="text-muted-foreground">Loading…</p>;
  if (!project) return <EmptyState icon={<Users />} title="Project not found" text="It may have been deleted." action={<Button asChild><Link to="/projects">Back to projects</Link></Button>} />;

  const myId = me.profile.id;
  const isOwner = project.owner_id === myId;
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const owner = byId.get(project.owner_id);
  const accepted = invites.filter((i) => i.status === "accepted").map((i) => byId.get(i.profile_id)).filter(Boolean) as Profile[];
  const team = [...(owner ? [owner] : []), ...accepted];
  const missing = missingTeamSkills(project.required_skills, team);

  const update = async (patch: { checklist?: Record<string, boolean>; roadmap_stage?: number }) => {
    const { error } = await supabase.from("projects").update(patch).eq("id", id);
    if (error) toast.error(error.message); else invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-2"><Chip>{stageLabel(project.stage)}</Chip><SampleBadge sample={project.is_sample} />{isOwner && <Chip hit>You own this</Chip>}</div>
        <h1 className="mt-3 text-3xl font-bold">{project.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">by {owner?.full_name ?? "Unknown"} · Roadmap stage {project.roadmap_stage} of 6</p>
        {isOwner && <Button variant="ghost" size="sm" className="mt-3 text-destructive" onClick={async () => { if (!confirm("Delete this project?")) return; await supabase.from("projects").delete().eq("id", id); invalidate(); navigate({ to: "/projects" }); }}><Trash2 />Delete</Button>}
      </div>

      <Tabs value={tab} onValueChange={(v) => navigate({ to: "/projects/$id", params: { id }, search: { tab: v as Tab }, replace: true })}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="team">Team & invites</TabsTrigger>
          <TabsTrigger value="roadmap">Validation & roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 md:grid-cols-2">
          <Block title="Problem">{project.problem}</Block>
          <Block title="Proposed solution">{project.solution || "—"}</Block>
          <Block title="Target users">{project.target_users || "—"}</Block>
          <Block title="Expected availability"><span className="inline-flex items-center gap-1"><Clock className="size-4" />{project.expected_hours} h/week per member</span></Block>
          <Block title="Required skills (identified for matching)"><div className="flex flex-wrap gap-1">{project.required_skills.map((s) => <Chip key={s} hit={!missing.includes(s)}>{s}</Chip>)}</div><p className="mt-2 text-xs text-muted-foreground">Highlighted = already covered by the team.</p></Block>
          <Block title="Interests">{project.interests.length ? <div className="flex flex-wrap gap-1">{project.interests.map((s) => <Chip key={s}>{s}</Chip>)}</div> : "—"}</Block>
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          <Matches project={project} profiles={profiles.filter((p) => !team.some((t) => t.id === p.id))} invites={invites} missing={missing} isOwner={isOwner} onInvited={invalidate} />
        </TabsContent>

        <TabsContent value="team" className="mt-4 space-y-6">
          <div>
            <h2 className="mb-3 font-semibold">Team members ({team.length})</h2>
            <div className="grid gap-3 md:grid-cols-2">{team.map((m) => <div key={m.id} className="flex items-center gap-3 rounded-xl border bg-card p-4"><Avatar name={m.full_name} /><div className="flex-1"><p className="font-medium">{m.full_name}</p><p className="text-xs text-muted-foreground">{m.id === project.owner_id ? "Owner" : "Member"} · {[...m.tech_skills, ...m.soft_skills].slice(0, 4).join(", ")}</p></div><SampleBadge sample={m.is_sample} /></div>)}</div>
            <p className="mt-3 text-sm">{missing.length ? <>Still missing: {missing.map((s) => <Chip key={s}>{s}</Chip>)}</> : <span className="text-success">All required skills are covered.</span>}</p>
          </div>
          {isOwner && (
            <div>
              <h2 className="mb-3 font-semibold">Invitations</h2>
              {invites.filter((i) => i.status !== "accepted").length === 0 ? <EmptyState icon={<Send />} title="No open invitations" text="Head to Matches to invite students who fill your skill gaps." /> : (
                <div className="divide-y rounded-xl border bg-card">
                  {invites.filter((i) => i.status !== "accepted").map((i) => { const p = byId.get(i.profile_id); return (
                    <div key={i.id} className="flex flex-wrap items-center gap-3 p-4">
                      <Avatar name={p?.full_name ?? "?"} className="size-9" />
                      <div className="flex-1"><p className="font-medium">{p?.full_name}</p><p className="text-xs text-muted-foreground">Match score at invite: {i.match_score ?? "—"}{p?.is_sample && " · Sample profile — cannot respond (demo only)"}</p></div>
                      <Chip hit={i.status === "pending"}>{i.status}</Chip>
                      <Button size="sm" variant="ghost" onClick={async () => { await supabase.from("invitations").delete().eq("id", i.id); invalidate(); }}>Withdraw</Button>
                    </div>); })}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roadmap" className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="font-semibold">Idea validation checklist</h2>
            <p className="mb-4 text-sm text-muted-foreground">{Object.values(project.checklist as Record<string, boolean>).filter(Boolean).length} of {CHECKLIST.length} complete</p>
            <ul className="space-y-3">
              {CHECKLIST.map((c) => { const done = !!(project.checklist as Record<string, boolean>)[c.key]; return (
                <li key={c.key} className="flex gap-3">
                  <button disabled={!isOwner} onClick={() => update({ checklist: { ...(project.checklist as Record<string, boolean>), [c.key]: !done } })} aria-label={`Toggle ${c.label}`} className="mt-0.5 disabled:cursor-default">{done ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-muted-foreground" />}</button>
                  <div><p className="font-medium">{c.label}</p><p className="text-sm text-muted-foreground">{c.hint}</p>{!done && <p className="mt-1 text-sm text-primary">Next action: {c.action}</p>}</div>
                </li>); })}
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-semibold">Roadmap</h2>
            <ol className="space-y-3">
              {ROADMAP.map((r) => { const done = r.n < project.roadmap_stage, cur = r.n === project.roadmap_stage; return (
                <li key={r.n} className={`flex gap-3 rounded-xl p-3 ${cur ? "bg-accent" : ""}`}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${done ? "bg-success text-primary-foreground" : cur ? "bg-highlight text-highlight-foreground" : "bg-secondary text-muted-foreground"}`}>{done ? <Check className="size-4" /> : r.n}</span>
                  <div className="flex-1"><p className="font-medium">{r.title}</p><p className="text-sm text-muted-foreground">{r.desc}</p>
                    {cur && r.n === 3 && missing.length > 0 && <p className="mt-1 text-sm">Missing skills: {missing.join(", ")} — <Link to="/projects/$id" params={{ id }} search={{ tab: "matches" }} className="font-semibold text-primary">find teammates</Link></p>}
                    {cur && isOwner && <Button size="sm" className="mt-2" onClick={() => update({ roadmap_stage: Math.min(7, r.n + 1) })}>Mark complete</Button>}
                  </div>
                </li>); })}
            </ol>
            {project.roadmap_stage > 6 && <p className="mt-4 font-semibold text-success">🚀 All stages complete — ready to launch!</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-card"><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3><div className="text-sm">{children}</div></div>;
}

type ProjectRow = { id: string; required_skills: string[]; interests: string[]; expected_hours: number };
function Matches({ project, profiles, invites, missing, isOwner, onInvited }: { project: ProjectRow; profiles: Profile[]; invites: { profile_id: string; status: string }[]; missing: string[]; isOwner: boolean; onInvited: () => void }) {
  const [w, setW] = useState<Weights>(DEFAULT_WEIGHTS);
  const [minScore, setMin] = useState(0);
  const [realOnly, setRealOnly] = useState(false);
  const [gapOnly, setGapOnly] = useState(false);
  const [sort, setSort] = useState("score");
  const status = new Map(invites.map((i) => [i.profile_id, i.status]));
  const rows = useMemo(() => {
    const gap = new Set(missing.map((s) => s.toLowerCase()));
    return profiles
      .map((p) => ({ p, m: computeMatch(project, p, w) }))
      .filter(({ p, m }) => m.score >= minScore && (!realOnly || !p.is_sample) && (!gapOnly || m.matchedSkills.some((s) => gap.has(s.toLowerCase()))))
      .sort((a, b) => sort === "availability" ? b.p.availability_hours - a.p.availability_hours : sort === "skills" ? b.m.matchedSkills.length - a.m.matchedSkills.length : b.m.score - a.m.score);
  }, [profiles, project, w, minScore, realOnly, gapOnly, sort, missing]);

  const invite = async (p: Profile, score: number) => {
    const { error } = await supabase.from("invitations").insert({ project_id: project.id, profile_id: p.id, match_score: score, message: `You'd be a great fit (match ${score}).` });
    if (error) return void toast.error(error.message);
    toast.success(`Invitation sent to ${p.full_name}`);
    onInvited();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit space-y-5 rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-6">
        <div>
          <h3 className="font-semibold">Scoring weights</h3>
          <p className="text-xs text-muted-foreground">Proposed defaults, configurable here. This scoring model has not been validated.</p>
        </div>
        {(Object.keys(w) as (keyof Weights)[]).map((k) => (
          <div key={k} className="space-y-1.5"><div className="flex justify-between text-sm"><span className="capitalize">{k === "portfolio" ? "Portfolio evidence" : k}</span><span className="font-display font-bold">{w[k]}</span></div><Slider value={[w[k]]} max={100} step={5} onValueChange={([v]) => setW({ ...w, [k]: v ?? 0 })} /></div>
        ))}
        <Button variant="outline" size="sm" className="w-full" onClick={() => setW(DEFAULT_WEIGHTS)}>Reset to proposed (50/25/15/10)</Button>
        <hr />
        <div className="space-y-1.5"><div className="flex justify-between text-sm"><span>Minimum score</span><span className="font-bold">{minScore}</span></div><Slider value={[minScore]} max={100} step={5} onValueChange={([v]) => setMin(v ?? 0)} /></div>
        <div className="flex items-center justify-between"><Label htmlFor="real">Registered students only</Label><Switch id="real" checked={realOnly} onCheckedChange={setRealOnly} /></div>
        <div className="flex items-center justify-between"><Label htmlFor="gap">Fills a missing skill</Label><Switch id="gap" checked={gapOnly} onCheckedChange={setGapOnly} /></div>
        <Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="score">Sort: match score</SelectItem><SelectItem value="skills">Sort: skills matched</SelectItem><SelectItem value="availability">Sort: availability</SelectItem></SelectContent></Select>
      </aside>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{rows.length} suggested teammate{rows.length === 1 ? "" : "s"}</p>
        {rows.length === 0 && <EmptyState icon={<Users />} title="No students match these filters" text="Lower the minimum score or turn off filters." />}
        {rows.map(({ p, m }) => (
          <ProfileCard key={p.id} p={p} highlight={m.matchedSkills}>
            <div className="flex flex-col gap-4 rounded-xl bg-muted p-4 sm:flex-row">
              <ScoreRing score={m.score} />
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  {(Object.keys(m.parts) as (keyof Weights)[]).map((k) => <div key={k}><div className="h-1.5 rounded-full bg-secondary"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${m.parts[k] * 100}%` }} /></div><span className="capitalize text-muted-foreground">{k}</span></div>)}
                </div>
                <ul className="list-inside list-disc text-sm">{m.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                {m.missingSkills.length > 0 && <p className="text-xs text-muted-foreground">Doesn't cover: {m.missingSkills.join(", ")}</p>}
              </div>
              {isOwner && (status.has(p.id) ? <Chip>{status.get(p.id)}</Chip> : <Button size="sm" onClick={() => invite(p, m.score)} className="self-start"><Send />Invite</Button>)}
            </div>
          </ProfileCard>
        ))}
      </div>
    </div>
  );
}
