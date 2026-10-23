import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FolderKanban, LayoutDashboard, LogOut, Mail, Sprout, User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useMyProfile } from "@/lib/data";
import { Avatar } from "@/components/Cards";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/students", label: "Students", icon: Users },
  { to: "/invitations", label: "Invitations", icon: Mail },
  { to: "/growth", label: "Growth", icon: Sprout },
  { to: "/profile", label: "My profile", icon: User },
] as const;

function Layout() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: me } = useMyProfile();
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Logo light />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-sidebar-accent" activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}>
              <n.icon className="size-4" />{n.label}
            </Link>
          ))}
        </nav>
        {me?.profile && (
          <div className="flex items-center gap-3 border-t border-sidebar-border pt-4">
            <Avatar name={me.profile.full_name} className="size-9 bg-sidebar-primary text-sidebar-primary-foreground" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{me.profile.full_name}</p><p className="truncate text-xs opacity-60">{me.email}</p></div>
            <button onClick={signOut} aria-label="Sign out" className="rounded-md p-2 hover:bg-sidebar-accent"><LogOut className="size-4" /></button>
          </div>
        )}
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button onClick={signOut} aria-label="Sign out" className="rounded-md p-2 hover:bg-secondary"><LogOut className="size-4" /></button>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-8 lg:pb-10 lg:pt-10">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t bg-background/95 backdrop-blur lg:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="size-5" />{n.label.replace("My ", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
