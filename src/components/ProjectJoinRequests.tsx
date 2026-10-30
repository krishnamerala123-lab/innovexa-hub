import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useProfiles } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Chip } from "@/components/Cards";

export function ProjectJoinRequests({ projectId, isOwner, hasAccess, privacy, sample, onSaved }: { projectId: string; isOwner: boolean; hasAccess: boolean; privacy: string; sample: boolean; onSaved: () => void }) {
  const { data: me } = useMyProfile();
  const { data: profiles = [] } = useProfiles();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: rows = [], error, refetch } = useQuery({ queryKey: ["join-requests", projectId, me?.profile?.id], enabled: !!me?.profile,
    queryFn: async () => { const { data, error } = await supabase.from("project_join_requests").select("*").eq("project_id", projectId).order("created_at"); if (error) throw error; return data ?? []; } });
  const act = async (id?: string, status?: "accepted" | "declined") => {
    if (!me?.profile) return;
    setBusy(true);
    try {
      const result = id && status ? await supabase.from("project_join_requests").update({ status }).eq("id", id).select("id").single() : await supabase.from("project_join_requests").insert({ project_id: projectId, profile_id: me.profile.id, message: message.trim() }).select("id").single();
      if (result.error || !result.data) throw new Error(result.error?.message ?? "Request was not saved");
      toast.success(status === "accepted" ? "Student approved" : status === "declined" ? "Request declined" : "Request sent for owner approval");
      await refetch(); onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save request"); }
    finally { setBusy(false); }
  };
  if (error) return <p className="text-destructive">Join requests could not be loaded.</p>;
  if (isOwner) return <section className="space-y-3"><h2 className="font-semibold">Requests to join</h2>{rows.length ? rows.map((r) => <div key={r.id} className="flex flex-wrap items-center gap-3 border-b pb-3"><div className="min-w-0 flex-1"><p className="font-medium">{profiles.find((p) => p.id === r.profile_id)?.full_name ?? "Student"}</p><p className="break-words text-sm text-muted-foreground">{r.message}</p></div>{r.status === "pending" ? <div className="flex gap-2"><Button size="sm" disabled={busy} onClick={() => act(r.id, "accepted")}>Approve request</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => act(r.id, "declined")}>Decline request</Button></div> : <Chip hit={r.status === "accepted"}>{r.status}</Chip>}</div>) : <p className="text-sm text-muted-foreground">No join requests.</p>}</section>;
  if (hasAccess || privacy === "private_team") return null;
  const own = rows.find((r) => r.profile_id === me?.profile?.id);
  if (own) return <p className="text-sm">Join request: <Chip hit={own.status === "accepted"}>{own.status}</Chip></p>;
  if (sample) return <p className="text-sm text-muted-foreground">Sample project — no real owner to review requests.</p>;
  return <div className="space-y-2"><Label htmlFor="join-message">Message to the project owner</Label><Textarea id="join-message" maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} /><Button disabled={busy || !me?.profile?.full_name.trim()} onClick={() => act()}>Request to join</Button></div>;
}