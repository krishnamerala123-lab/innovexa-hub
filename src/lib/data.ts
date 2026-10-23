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

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("is_sample").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*, owner:profiles!projects_owner_id_fkey(id, full_name, is_sample)").order("is_sample").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
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
