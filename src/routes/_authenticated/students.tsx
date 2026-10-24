import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users } from "lucide-react";
import { useProfiles } from "@/lib/data";
import { EmptyState, PageHeader, ProfileCard } from "@/components/Cards";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({ meta: [{ title: "Students — Innovexa" }, { name: "description", content: "Browse student profiles by skill and interest." }, { property: "og:title", content: "Students — Innovexa" }, { property: "og:description", content: "Find collaborators with complementary skills." }] }),
  component: Students,
});

function Students() {
  const { data = [], isLoading } = useProfiles();
  const [q, setQ] = useState("");
  const [realOnly, setRealOnly] = useState(false);
  const t = q.trim().toLowerCase();
  const list = data.filter((p) => (!realOnly || !p.is_sample) && (!t || [p.full_name, p.intro, ...p.tech_skills, ...p.soft_skills, ...p.interests].join(" ").toLowerCase().includes(t)));
  return (
    <div>
      <PageHeader title="Students" sub="Profiles marked Sample are demo data, not real people." />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search by name, skill or interest…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="flex items-center gap-2"><Switch id="ro" checked={realOnly} onCheckedChange={setRealOnly} /><Label htmlFor="ro">Registered only</Label></div>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : list.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProfileCard key={p.id} p={p} highlight={t ? [...p.tech_skills, ...p.soft_skills].filter((s) => s.toLowerCase().includes(t)) : []} />)}</div> : <EmptyState icon={<Users />} title="No students found" text="Try a different skill or turn off the filter." />}
    </div>
  );
}
