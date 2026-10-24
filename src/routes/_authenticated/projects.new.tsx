import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInvalidate, useMyProfile } from "@/lib/data";
import { INTEREST_SUGGESTIONS, SKILL_SUGGESTIONS, STAGES } from "@/lib/roadmap";
import { TagInput } from "@/components/TagInput";
import { PageHeader } from "@/components/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/projects/new")({
  head: () => ({ meta: [{ title: "New project — Innovexa" }, { name: "description", content: "Post a project idea on Innovexa." }, { property: "og:title", content: "New project — Innovexa" }, { property: "og:description", content: "Describe your idea and required skills." }] }),
  component: NewProject,
});

const schema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(100),
  problem: z.string().trim().min(10, "Describe the problem (10+ characters)").max(1000),
  solution: z.string().trim().max(1000),
  target_users: z.string().trim().max(300),
  required_skills: z.array(z.string()).min(1, "Add at least one required skill"),
  interests: z.array(z.string()),
  expected_hours: z.number().int().min(1).max(60),
  stage: z.string(),
});

function NewProject() {
  const { data: me } = useMyProfile();
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const [f, setF] = useState({ title: "", problem: "", solution: "", target_users: "", required_skills: [] as string[], interests: [] as string[], expected_hours: 6, stage: "idea" });
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me?.profile) return;
    const p = schema.safeParse(f);
    if (!p.success) return toast.error(p.error.issues[0].message);
    setBusy(true);
    const { data, error } = await supabase.from("projects").insert({ ...p.data, owner_id: me.profile.id, checklist: { problem: true } }).select("id").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Project created — here are your best matches");
    invalidate();
    navigate({ to: "/projects/$id", params: { id: data.id }, search: { tab: "matches" } });
  };
  const L = (label: string, el: React.ReactNode, hint?: string) => <div className="space-y-1.5"><Label>{label}</Label>{el}{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>;
  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <PageHeader title="Post a project" sub="Clear requirements lead to better matches." />
      <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-card">
        {L("Project title", <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />)}
        {L("Problem statement", <Textarea rows={3} value={f.problem} onChange={(e) => setF({ ...f, problem: e.target.value })} />, "Who struggles with what, and why does it matter?")}
        {L("Proposed solution", <Textarea rows={3} value={f.solution} onChange={(e) => setF({ ...f, solution: e.target.value })} />)}
        {L("Target users", <Input value={f.target_users} onChange={(e) => setF({ ...f, target_users: e.target.value })} />)}
        {L("Required skills", <TagInput value={f.required_skills} onChange={(v) => setF({ ...f, required_skills: v })} suggestions={SKILL_SUGGESTIONS} />, "Innovexa compares these with every student profile.")}
        {L("Project interests / domain", <TagInput value={f.interests} onChange={(v) => setF({ ...f, interests: v })} suggestions={INTEREST_SUGGESTIONS} />)}
        <div className="grid gap-5 sm:grid-cols-2">
          {L("Expected availability (h/week per member)", <Input type="number" min={1} max={60} value={f.expected_hours} onChange={(e) => setF({ ...f, expected_hours: Number(e.target.value) })} />)}
          {L("Current stage", <Select value={f.stage} onValueChange={(v) => setF({ ...f, stage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>)}
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create project & find teammates"}</Button>
      </div>
    </form>
  );
}
