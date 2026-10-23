import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, GitMerge, Map, Rocket, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { DEFAULT_WEIGHTS } from "@/lib/matching";
import { ROADMAP } from "@/lib/roadmap";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Innovexa — Discover. Connect. Learn. Build. Launch." },
      { name: "description", content: "A student innovation ecosystem that matches student skills to real project needs and guides teams from idea to prototype." },
      { property: "og:title", content: "Innovexa — Student Innovation Ecosystem" },
      { property: "og:description", content: "Match student skills to project needs, invite teammates, and follow a roadmap to a working prototype." },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: UserRound, title: "Showcase skills", text: "Build a profile with technical and non-technical skills, interests, availability and portfolio." },
  { icon: Compass, title: "Post a project", text: "Describe the problem, solution, target users and the skills your idea needs." },
  { icon: GitMerge, title: "Get ranked matches", text: "Transparent, rule-based scoring explains exactly why each student fits." },
  { icon: Send, title: "Invite your team", text: "Send invitations, track pending and accepted, and see which skills are still missing." },
  { icon: Map, title: "Follow the roadmap", text: "A validation checklist and six-stage roadmap keep the team moving to a prototype." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-hero text-ink-foreground">
        <div className="absolute inset-0 grid-lines" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo light />
          <div className="flex gap-2">
            <Button asChild variant="heroOutline" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild variant="hero" size="sm"><Link to="/dashboard">Open app</Link></Button>
          </div>
        </header>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-2 lg:pt-16">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-ink-foreground/20 px-3 py-1 text-xs font-medium tracking-wide text-ink-foreground/80">Discover · Connect · Learn · Build · Launch</p>
            <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">Turn student skills into <span className="text-highlight">working prototypes.</span></h1>
            <p className="mt-5 max-w-lg text-lg text-ink-foreground/70">Innovexa connects what students can do with what projects actually need — then guides the team from idea to launch.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/auth">Create your profile <ArrowRight /></Link></Button>
              <Button asChild variant="heroOutline" size="lg"><Link to="/projects">Browse projects</Link></Button>
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="Students collaborating in an innovation lab" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl" width={1280} height={960} />
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border bg-card p-4 text-card-foreground shadow-card sm:left-auto sm:right-6 sm:w-72">
              <div className="flex items-center justify-between"><p className="text-xs font-semibold text-muted-foreground">Example match</p><span className="font-display text-2xl font-bold text-primary">82</span></div>
              <p className="mt-1 text-sm font-medium">Has 3 of 4 required skills</p>
              <p className="text-xs text-muted-foreground">Shares interest in EdTech · Available 10 h/week</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-bold">One workflow, idea to prototype</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">Not a social feed. Not a job board. A focused path from a problem worth solving to a team that can build it.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between"><s.icon className="size-5 text-primary" /><span className="font-display text-xs font-bold text-muted-foreground">0{i + 1}</span></div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Explainable matching</h2>
            <p className="mt-3 text-muted-foreground">Every score is a simple weighted sum you can read and adjust. These weights are a <b>proposed starting point</b> and are configurable per project — the model has not been validated.</p>
          </div>
          <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-card">
            {Object.entries(DEFAULT_WEIGHTS).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-sm"><span className="font-medium capitalize">{k === "portfolio" ? "Portfolio evidence" : k}</span><span className="font-display font-bold">{v}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${v * 2}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-bold">The Innovexa roadmap</h2>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROADMAP.map((r) => (
            <li key={r.n} className="flex gap-4 rounded-2xl border bg-card p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-highlight font-display font-bold text-highlight-foreground">{r.n}</span>
              <div><h3 className="font-semibold">{r.title}</h3><p className="text-sm text-muted-foreground">{r.desc}</p></div>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl bg-hero px-6 py-12 text-center text-ink-foreground">
          <Rocket className="size-8 text-highlight" />
          <h2 className="text-3xl font-bold">Ready to build something real?</h2>
          <Button asChild variant="hero" size="lg"><Link to="/auth">Get started free</Link></Button>
        </div>
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">INNOVEXA · Demo includes clearly labelled sample profiles and projects.</footer>
    </div>
  );
}
