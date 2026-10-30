import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FolderSearch, Plus, Search } from "lucide-react";
import { useProjects } from "@/lib/data";
import { STAGES } from "@/lib/roadmap";
import { EmptyState, PageHeader, ProjectCard } from "@/components/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({ meta: [{ title: "Projects — Innovexa" }, { name: "description", content: "Browse and search student project listings." }, { property: "og:title", content: "Projects — Innovexa" }, { property: "og:description", content: "Find a project that needs your skills." }] }),
  component: Projects,
});

function Projects() {
  const { data = [], isLoading } = useProjects();
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("all");
  const t = q.trim().toLowerCase();
  const list = data.filter((p) => (stage === "all" || p.stage === stage) && (!t || [p.title, p.problem, p.solution, p.target_users, ...p.required_skills, ...p.interests].join(" ").toLowerCase().includes(t)));
  return (
    <div>
      <PageHeader title="Projects & ideas" sub="Search by title, problem, skill or interest." action={<Button asChild><Link to="/projects/new"><Plus />New project</Link></Button>} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search e.g. React, EdTech, farmers…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select value={stage} onValueChange={setStage}><SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All stages</SelectItem>{STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : list.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div> : <EmptyState icon={<FolderSearch />} title="No matching projects" text="Try a different search, or post your own idea." />}
    </div>
  );
}
