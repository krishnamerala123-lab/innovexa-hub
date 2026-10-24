import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInvalidate, useMyProfile, profileCompleteness, type Profile } from "@/lib/data";
import { INTEREST_SUGGESTIONS, SKILL_SUGGESTIONS } from "@/lib/roadmap";
import { TagInput } from "@/components/TagInput";
import { PageHeader } from "@/components/Cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My profile — Innovexa" }, { name: "description", content: "Edit your Innovexa student profile." }, { property: "og:title", content: "My profile — Innovexa" }, { property: "og:description", content: "Showcase your skills." }] }),
  component: ProfilePage,
});

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(80),
  intro: z.string().trim().max(400),
  availability_hours: z.number().int().min(0).max(60),
  portfolio_links: z.array(z.string().trim().url("Portfolio links must be full URLs (https://…)").max(300)).max(8),
  past_projects: z.string().trim().max(1000),
  collab_prefs: z.string().trim().max(300),
});

function ProfilePage() {
  const { data } = useMyProfile();
  const invalidate = useInvalidate();
  const [f, setF] = useState<Profile | null>(null);
  const [links, setLinks] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data?.profile) { setF(data.profile); setLinks(data.profile.portfolio_links.join("\n")); } }, [data?.profile]);
  if (!f) return <p className="text-muted-foreground">Loading profile…</p>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const portfolio_links = links.split(/\s+/).filter(Boolean);
    const p = schema.safeParse({ ...f, portfolio_links });
    if (!p.success) return toast.error(p.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ ...p.data, tech_skills: f.tech_skills, soft_skills: f.soft_skills, interests: f.interests, updated_at: new Date().toISOString() }).eq("id", f.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    invalidate();
  };
  const pct = profileCompleteness({ ...f, portfolio_links: links.split(/\s+/).filter(Boolean) });

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title="My profile" sub="This is what project owners see when you're matched." action={<Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button>} />
      <div className="rounded-2xl border bg-card p-5 shadow-card"><div className="mb-2 flex justify-between text-sm"><span className="font-medium">Profile completeness</span><span className="font-display font-bold">{pct}%</span></div><Progress value={pct} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="About you">
          <Field label="Full name"><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></Field>
          <Field label="Short introduction"><Textarea rows={3} value={f.intro} onChange={(e) => setF({ ...f, intro: e.target.value })} placeholder="What do you love building?" /></Field>
          <Field label="Availability (hours per week)"><Input type="number" min={0} max={60} value={f.availability_hours} onChange={(e) => setF({ ...f, availability_hours: Number(e.target.value) })} /></Field>
          <Field label="Collaboration preferences"><Input value={f.collab_prefs} onChange={(e) => setF({ ...f, collab_prefs: e.target.value })} placeholder="e.g. Remote, evenings, weekly sync" /></Field>
        </Section>
        <Section title="Skills & interests">
          <Field label="Technical skills"><TagInput value={f.tech_skills} onChange={(v) => setF({ ...f, tech_skills: v })} suggestions={SKILL_SUGGESTIONS.slice(0, 11)} /></Field>
          <Field label="Non-technical skills"><TagInput value={f.soft_skills} onChange={(v) => setF({ ...f, soft_skills: v })} suggestions={SKILL_SUGGESTIONS.slice(10)} /></Field>
          <Field label="Interests"><TagInput value={f.interests} onChange={(v) => setF({ ...f, interests: v })} suggestions={INTEREST_SUGGESTIONS} /></Field>
        </Section>
        <Section title="Portfolio evidence">
          <Field label="Portfolio links (one per line)"><Textarea rows={3} value={links} onChange={(e) => setLinks(e.target.value)} placeholder="https://github.com/you" /></Field>
          <Field label="Past projects"><Textarea rows={3} value={f.past_projects} onChange={(e) => setF({ ...f, past_projects: e.target.value })} placeholder="Briefly describe things you've built" /></Field>
        </Section>
      </div>
    </form>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-card"><h2 className="font-semibold">{title}</h2>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
