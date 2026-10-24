import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Project = Tables<"projects">;
export type Invitation = Tables<"invitations">;

export function useMyProfile() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", u.user.id).maybeSingle();
      if (error) throw error;
      return { profile: data, email: u.user.email ?? "" };
    },
  });
}

// Other students' rows are read through a directory function that omits account identifiers (user_id).
async function fetchDirectory() {
  const { data, error } = await supabase.rpc("student_directory");
  if (error) throw error;
  return (data ?? []) as unknown as Profile[];
}

export function useProfiles() {
  return useQuery({ queryKey: ["profiles"], queryFn: fetchDirectory });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const [{ data, error }, dir] = await Promise.all([
        supabase.from("projects").select("*").order("is_sample").order("created_at", { ascending: false }),
        fetchDirectory(),
      ]);
      if (error) throw error;
      const byId = new Map(dir.map((p) => [p.id, p]));
      return (data ?? []).map((pr) => {
        const o = byId.get(pr.owner_id);
        return { ...pr, owner: o ? { id: o.id, full_name: o.full_name, is_sample: o.is_sample } : null };
      });
    },
  });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export const profileCompleteness = (p: Profile) => {
  const checks = [p.full_name, p.intro, p.tech_skills.length, p.interests.length, p.portfolio_links.length || p.past_projects, p.collab_prefs];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export const initials = (n: string) => n.replace(/\(.*?\)/g, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
