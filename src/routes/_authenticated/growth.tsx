import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ExternalLink, HandHelping, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useProjects } from "@/lib/data";
import { computeMatch } from "@/lib/matching";
import { EmptyState, PageHeader, ProjectCard, ScoreRing } from "@/components/Cards";

export const Route = createFileRoute("/_authenticated/growth")({
  head: () => ({ meta: [{ title: "Growth — Innovexa" }, { name: "description", content: "Showcase projects, learn, and contribute to other teams." }, { property: "og:title", content: "Growth — Innovexa" }, { property: "og:description", content: "Grow as a student builder." }] }),
  component: Growth,
});

const RESOURCES = [
  { title: "MDN Web Docs", tag: "Web development", url: "https://developer.mozilla.org/" },
  { title: "freeCodeCamp", tag: "Coding curriculum", url: "https://www.freecodecamp.org/" },
  { title: "The Mom Test (summary)", tag: "Customer interviews", url: "https://www.momtestbook.com/" },
  { title: "Y Combinator Startup School", tag: "Startups", url: "https://www.startupschool.org/" },
  { title: "Figma Learn", tag: "Design", url: "https://help.figma.com/hc/en-us/categories/360002051613" },
  { title: "Lean Canvas", tag: "Business model", url: "https://leanstack.com/lean-canvas" },
];

function Growth() {
  const { data: me } = useMyProfile();
  const { data: projects = [] } = useProjects();
  const p = me?.profile;
  const { data: joined = [] } = useQuery({
    queryKey: ["joined", p?.id], enabled: !!p,
    queryFn: async () => (await supabase.from("invitations").select("project_id").eq("profile_id", p!.id).eq("status", "accepted")).data?.map((r) => r.project_id) ?? [],
  });
  if (!p) return <p className="text-muted-foreground">Loading…</p>;
  const showcase = projects.filter((x) => x.owner_id === p.id || joined.includes(x.id));
  const contribute = projects.filter((x) => !showcase.includes(x)).map((x) => ({ x, m: computeMatch(x, p) })).filter(({ m }) => m.matchedSkills.length > 0).sort((a, b) => b.m.score - a.m.score);
  return (
    <div className="space-y-10">
      <PageHeader title="Student growth" sub="Showcase your work, keep learning, and help other teams." />
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Trophy className="size-4 text-primary" />Your showcase</h2>
        {showcase.length ? <div className="grid gap-4 md:grid-cols-2">{showcase.map((x) => <ProjectCard key={x.id} p={x} />)}</div> : <EmptyState icon={<Trophy />} title="Nothing to showcase yet" text="Projects you own or join appear here." />}
      </section>
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><HandHelping className="size-4 text-primary" />Teams that need your skills</h2>
        {contribute.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{contribute.map(({ x, m }) => <ProjectCard key={x.id} p={x} right={<ScoreRing score={m.score} />} />)}</div> : <EmptyState icon={<HandHelping />} title="No matches yet" text="Add more skills to your profile to discover teams that need you." />}
      </section>
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><BookOpen className="size-4 text-primary" />Learning resources</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border bg-card p-4 hover:border-primary/40">
              <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.tag}</p></div><ExternalLink className="size-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
