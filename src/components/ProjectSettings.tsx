import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/lib/data";
import { isProjectOwner, PRIVACY_OPTIONS, projectSettingsSchema } from "@/lib/project-privacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/TagInput";

export function PrivacySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <div className="space-y-2"><Label>Project privacy</Label><Select value={value} onValueChange={onChange}><SelectTrigger aria-label="Project privacy"><SelectValue /></SelectTrigger><SelectContent>{PRIVACY_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select><p className="text-sm text-muted-foreground">{PRIVACY_OPTIONS.find((p) => p.value === value)?.description}</p></div>;
}

export function ProjectSettings({ project, onSaved, onCancel }: { project: Project; onSaved: () => void; onCancel: () => void }) {
  const [f, setF] = useState({ title: project.title, problem: project.problem, solution: project.solution, general_solution: project.general_solution, privacy: project.privacy, available_positions: project.available_positions, technical_notes: project.technical_notes, confidential_notes: project.confidential_notes, document_links: project.document_links });
  const [links, setLinks] = useState(project.document_links.join("\n"));
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Please sign in again");
      const { data: profile } = await supabase.from("profiles").select("id,user_id").eq("user_id", auth.user.id).single();
      if (!isProjectOwner(project, profile)) throw new Error("Only the project owner may edit this project");
      const patch = projectSettingsSchema.parse({ ...f, document_links: links.split("\n").map((v) => v.trim()).filter(Boolean) });
      const { data, error } = await supabase.from("projects").update(patch).eq("id", project.id).eq("creator_user_id", auth.user.id).select("id").single();
      if (error || !data) throw new Error(error?.message ?? "Project changes were not saved");
      toast.success("Project saved"); onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save project"); }
    finally { setBusy(false); }
  };
  return <form onSubmit={save} className="space-y-4 border-t pt-4">
    <div className="space-y-1"><Label htmlFor="edit-title">Project title</Label><Input id="edit-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
    <div className="space-y-1"><Label htmlFor="edit-problem">General problem statement</Label><Textarea id="edit-problem" value={f.problem} onChange={(e) => setF({ ...f, problem: e.target.value })} /></div>
    <PrivacySelect value={f.privacy} onChange={(privacy) => setF({ ...f, privacy })} />
    <div className="space-y-1"><Label htmlFor="edit-general-solution">General solution (Public Discovery only)</Label><Textarea id="edit-general-solution" value={f.general_solution} onChange={(e) => setF({ ...f, general_solution: e.target.value })} /></div>
    <div className="space-y-1"><Label>Available team positions</Label><TagInput value={f.available_positions} onChange={(available_positions) => setF({ ...f, available_positions })} /></div>
    <div className="space-y-1"><Label htmlFor="edit-solution">Detailed solution · team only</Label><Textarea id="edit-solution" value={f.solution} onChange={(e) => setF({ ...f, solution: e.target.value })} /></div>
    <div className="space-y-1"><Label htmlFor="edit-technical">Technical implementation · team only</Label><Textarea id="edit-technical" value={f.technical_notes} onChange={(e) => setF({ ...f, technical_notes: e.target.value })} /></div>
    <div className="space-y-1"><Label htmlFor="edit-confidential">Confidential notes · team only</Label><Textarea id="edit-confidential" value={f.confidential_notes} onChange={(e) => setF({ ...f, confidential_notes: e.target.value })} /></div>
    <div className="space-y-1"><Label htmlFor="edit-documents">Private document links · one per line</Label><Textarea id="edit-documents" value={links} onChange={(e) => setLinks(e.target.value)} /><p className="text-xs text-muted-foreground">Set sharing permissions on the document host too. Access here does not protect an openly shared link.</p></div>
    <div className="flex gap-2"><Button type="submit" disabled={busy}>Save project</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div>
  </form>;
}