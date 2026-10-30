import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
export function ProjectPublicLayout({ children }: { children: ReactNode }) {
 const [signedIn, setSignedIn] = useState(false);
 useEffect(() => { let active=true; void supabase.auth.getUser().then(({ data }) => { if(active) setSignedIn(!!data.user); }); const { data }=supabase.auth.onAuthStateChange((_event, session)=>setSignedIn(!!session)); return ()=>{ active=false; data.subscription.unsubscribe(); }; }, []);
 if(signedIn) return <AppLayout>{children}</AppLayout>;
 return <div className="min-h-screen"><header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8"><Logo/><Button asChild variant="outline"><Link to="/auth">Sign in</Link></Button></header><main className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-8">{children}</main></div>;
}
