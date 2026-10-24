import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInvalidate, useMyProfile } from "@/lib/data";
import { Chip, EmptyState, PageHeader } from "@/components/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/invitations")({
  head: () => ({ meta: [{ title: "Invitations — Innovexa" }, { name: "description", content: "Team invitations you've received." }, { property: "og:title", content: "Invitations — Innovexa" }, { property: "og:description", content: "Accept or decline team invitations." }] }),
  component: Invitations,
});

function Invitations() {
  const { data: me } = useMyProfile();
  const invalidate = useInvalidate();
  const pid = me?.profile?.id;
  const { data = [], isLoading } = useQuery({
    queryKey: ["my-invites", pid], enabled: !!pid,
    queryFn: async () => (await supabase.from("invitations").select("*, project:projects(id, title, problem)").eq("profile_id", pid!).order("created_at", { ascending: false })).data ?? [],
  });
  const respond = async (id: string, status: "accepted" | "declined") => {
    const { error } = await supabase.from("invitations").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "accepted" ? "You joined the team!" : "Invitation declined");
    invalidate();
  };
  return (
    <div>
      <PageHeader title="Invitations" sub="Project owners who think your skills fit their team." />
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : data.length === 0 ? <EmptyState icon={<Mail />} title="No invitations yet" text="Complete your profile with skills and portfolio links to rank higher in matches." action={<Button asChild><Link to="/profile">Improve profile</Link></Button>} /> : (
        <div className="space-y-3">
          {data.map((i) => (
            <div key={i.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-card sm:flex-row sm:items-center">
              <div className="flex-1">
                {i.project && <Link to="/projects/$id" params={{ id: i.project.id }} className="font-semibold hover:text-primary">{i.project.title}</Link>}
                <p className="line-clamp-1 text-sm text-muted-foreground">{i.project?.problem}</p>
                <p className="mt-1 text-sm">“{i.message}”</p>
              </div>
              {i.status === "pending" ? (
                <div className="flex gap-2"><Button onClick={() => respond(i.id, "accepted")}>Accept</Button><Button variant="outline" onClick={() => respond(i.id, "declined")}>Decline</Button></div>
              ) : <Chip hit={i.status === "accepted"}>{i.status}</Chip>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
