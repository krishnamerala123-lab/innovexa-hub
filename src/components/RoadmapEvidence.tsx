import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ROADMAP } from "@/lib/roadmap";
import { evidenceSchema, firstUnapprovedStage, MILESTONE_FIELDS } from "@/lib/roadmap-evidence";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "@/components/Cards";

type Submission = Tables<"roadmap_submissions">;
export function RoadmapEvidence({ projectId, canSubmit, isOwner, onSaved }: { projectId: string; canSubmit: boolean; isOwner: boolean; onSaved: () => void }) {
  const { data: rows = [], isLoading, error, refetch } = useQuery({
    queryKey: ["roadmap-evidence", projectId], enabled: canSubmit,
    queryFn: async () => {
      const { data, error } = await supabase.from("roadmap_submissions").select("*").eq("project_id", projectId).order("milestone");
      if (error) throw error;
      return data ?? [];
    },
  });
  if (isLoading) return <p className="text-muted-foreground">Loading roadmap…</p>;
  if (error) return <p className="text-destructive">Roadmap evidence could not be loaded.</p>;
  if (!canSubmit) return <div><h2 className="font-semibold">Roadmap</h2><ol className="mt-4 space-y-4">{ROADMAP.map((r) => <li key={r.n}><p className="font-medium">{r.n}. {r.title}</p><p className="text-sm text-muted-foreground">{r.desc}</p></li>)}</ol></div>;
  const stage = firstUnapprovedStage(rows);
  return <div className="space-y-5">
    <h2 className="font-semibold">Roadmap · {stage > 6 ? "All stages approved" : `Stage ${stage} of 6`}</h2>
    {ROADMAP.map((r) => <Milestone key={r.n} projectId={projectId} milestone={r.n} title={r.title} row={rows.find((s) => s.milestone === r.n)} isOwner={isOwner} onSaved={() => { void refetch(); onSaved(); }} />)}
  </div>;
}

function Milestone({ projectId, milestone, title, row, isOwner, onSaved }: { projectId: string; milestone: number; title: string; row?: Submission | undefined; isOwner: boolean; onSaved: () => void }) {
  const storedFields = row?.fields && typeof row.fields === "object" && !Array.isArray(row.fields) ? Object.fromEntries(Object.entries(row.fields).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {};
  return <MilestoneForm key={`${row?.updated_at ?? "new"}-${milestone}`} projectId={projectId} milestone={milestone} title={title} row={row} initialFields={storedFields} isOwner={isOwner} onSaved={onSaved} />;
}

function MilestoneForm({ projectId, milestone, title, row, initialFields, isOwner, onSaved }: { projectId: string; milestone: number; title: string; row?: Submission | undefined; initialFields: Record<string, string>; isOwner: boolean; onSaved: () => void }) {
  const [fields, setFields] = useState(initialFields);
  const [evidence, setEvidence] = useState(row?.evidence ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const status = row?.status ?? "Not Started";
  const locked = status === "Approved" || status === "Submitted for Review";
  const save = async (submit: boolean) => {
    if (submit) {
      const parsed = evidenceSchema.safeParse({ milestone, fields, evidence });
      if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Required evidence is missing");
    }
    setBusy(true);
    try {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user.user) throw new Error("Please sign in again");
      const { error } = await supabase.from("roadmap_submissions").upsert({ project_id: projectId, milestone, submitted_by: user.user.id, fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.trim()])), evidence: evidence.trim(), status: submit ? "Submitted for Review" : "In Progress" }, { onConflict: "project_id,milestone" });
      if (error) throw error;
      toast.success(submit ? "Submitted for owner review" : "Draft saved"); onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save evidence"); }
    finally { setBusy(false); }
  };
  const review = async (status: "Approved" | "Changes Requested") => {
    if (!row) return;
    if (status === "Changes Requested" && !note.trim()) return void toast.error("Explain the requested changes");
    setBusy(true);
    try {
      const { error } = await supabase.from("roadmap_submissions").update({ status, review_note: note.trim() }).eq("id", row.id);
      if (error) throw error;
      toast.success(status === "Approved" ? "Milestone approved" : "Changes requested"); onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save review"); }
    finally { setBusy(false); }
  };
  return <details className="border-b pb-4" open={status === "Submitted for Review" || status === "Changes Requested"}>
    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 font-medium"><span>{milestone}. {title}</span><Chip hit={status === "Approved"}>{status}</Chip></summary>
    <div className="mt-4 space-y-3">
      {(MILESTONE_FIELDS[milestone] ?? []).map((field) => <div key={field.key} className="space-y-1"><Label htmlFor={`stage-${milestone}-${field.key}`}>{field.label} *</Label><Textarea id={`stage-${milestone}-${field.key}`} maxLength={4000} disabled={locked || busy} value={fields[field.key] ?? ""} onChange={(e) => setFields({ ...fields, [field.key]: e.target.value })} /></div>)}
      <div className="space-y-1"><Label htmlFor={`evidence-${milestone}`}>Evidence: summaries, results or supporting links *</Label><Textarea id={`evidence-${milestone}`} maxLength={10000} disabled={locked || busy} value={evidence} onChange={(e) => setEvidence(e.target.value)} /></div>
      {row?.review_note && <p className="text-sm text-muted-foreground">Owner feedback: {row.review_note}</p>}
      {!locked && <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={() => save(false)}>Save draft</Button><Button disabled={busy} onClick={() => save(true)}>Submit for review</Button></div>}
      {isOwner && status === "Submitted for Review" && <div className="space-y-2"><Label htmlFor={`review-${milestone}`}>Review feedback</Label><Textarea id={`review-${milestone}`} maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)} /><div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => review("Approved")}>Approve</Button><Button variant="outline" disabled={busy} onClick={() => review("Changes Requested")}>Request changes</Button></div></div>}
    </div>
  </details>;
}