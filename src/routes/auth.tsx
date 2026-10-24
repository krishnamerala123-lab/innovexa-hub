import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Innovexa" },
      { name: "description", content: "Sign in or create your Innovexa student profile." },
      { property: "og:title", content: "Sign in — Innovexa" },
      { property: "og:description", content: "Join the student innovation ecosystem." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  name: z.string().trim().max(80).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/dashboard" }); });
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) navigate({ to: "/dashboard" }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message);
    if (mode === "up" && !form.name.trim()) return void toast.error("Please enter your name");
    setBusy(true);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: form.name.trim() } } });
      setBusy(false);
      if (error) return void toast.error(error.message);
      if (!data.session) setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
      setBusy(false);
      if (error) return void toast.error(error.message);
    }
  };

  const oauth = async (p: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(String(r.error.message ?? r.error));
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-hero p-12 text-ink-foreground lg:flex">
        <div className="absolute inset-0 grid-lines" />
        <div className="relative"><Logo light /></div>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">Your skills are someone's<br /><span className="text-highlight">missing piece.</span></h2>
          <p className="mt-4 max-w-md text-ink-foreground/70">Build a profile once. Get matched to student projects that actually need what you know.</p>
        </div>
        <p className="relative text-sm text-ink-foreground/50">Discover. Connect. Learn. Build. Launch.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          {sent ? (
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <h1 className="text-xl font-bold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">We sent a confirmation link to <b>{form.email}</b>. Click it to activate your account, then you'll land on your dashboard.</p>
              <Button variant="outline" className="mt-4 w-full" onClick={() => { setSent(false); setMode("in"); }}>Back to sign in</Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{mode === "in" ? "Welcome back" : "Create your student profile"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{mode === "in" ? "Sign in to continue building." : "Takes under a minute."}</p>
              <div className="mt-6 space-y-2">
                <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>Continue with Lovable</button>
                <Button type="button" variant="outline" className="w-full" onClick={() => oauth("google")}>Continue with Google</Button>
              </div>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" /></div>
              <form onSubmit={submit} className="space-y-4">
                {mode === "up" && <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>}
                <div className="space-y-1.5"><Label htmlFor="email">College email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
              </form>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "in" ? "New to Innovexa?" : "Already have an account?"}{" "}
                <button className="font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Create an account" : "Sign in"}</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
