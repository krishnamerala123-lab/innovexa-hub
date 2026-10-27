import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, ExternalLink, UserX } from "lucide-react";
import { useProfiles } from "@/lib/data";
import { Avatar, Chip, EmptyState, SampleBadge } from "@/components/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/students/$id")({
  head: () => ({ meta: [{ title: "Student profile — Innovexa" }, { name: "description", content: "View a student's skills, interests and availability." }, { property: "og:title", content: "Student profile — Innovexa" }, { property: "og:description", content: "Student skills and interests on Innovexa." }] }),
  component: StudentProfile,
});

function StudentProfile() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useProfiles();
  const back = <Button asChild variant="outline" size="sm"><Link to="/students"><ArrowLeft />Back to students</Link></Button>;
  if (isLoading) return <p className="text-muted-foreground">Loading profile…</p>;
  if (error) return <EmptyState icon={<UserX />} title="Profile could not be loaded" text="Please refresh the page and try again." action={back} />;
  const p = data?.find((s) => s.id === id);
  if (!p) return <EmptyState icon={<UserX />} title="Student not found" text="This profile doesn't exist or is no longer available." action={back} />;
  const section = (title: string, items: string[]) => (
    <div><h2 className="mb-2 text-sm font-semibold">{title}</h2>{items.length ? <div className="flex flex-wrap gap-1">{items.map((s) => <Chip key={s}>{s}</Chip>)}</div> : <p className="text-sm text-muted-foreground">Not added yet.</p>}</div>
  );
  return (
    <div className="space-y-6">
      {back}
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          <Avatar name={p.full_name} className="size-14 text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{p.full_name || "Unnamed student"}</h1><SampleBadge sample={p.is_sample} /></div>
            <p className="mt-1 text-muted-foreground">{p.intro || "No introduction yet."}</p>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-4" />{p.availability_hours} h/week available</p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {section("Technical skills", p.tech_skills)}
          {section("Other skills", p.soft_skills)}
          {section("Interests", p.interests)}
          <div><h2 className="mb-2 text-sm font-semibold">Collaboration preferences</h2><p className="text-sm text-muted-foreground">{p.collab_prefs || "Not added yet."}</p></div>
          <div><h2 className="mb-2 text-sm font-semibold">Past projects</h2><p className="whitespace-pre-line text-sm text-muted-foreground">{p.past_projects || "Not added yet."}</p></div>
          <div><h2 className="mb-2 text-sm font-semibold">Portfolio</h2>{p.portfolio_links.length ? <ul className="space-y-1">{p.portfolio_links.map((l) => <li key={l}><a href={l} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-sm text-primary hover:underline">{l}<ExternalLink className="size-3" /></a></li>)}</ul> : <p className="text-sm text-muted-foreground">Not added yet.</p>}</div>
        </div>
      </div>
    </div>
  );
}
