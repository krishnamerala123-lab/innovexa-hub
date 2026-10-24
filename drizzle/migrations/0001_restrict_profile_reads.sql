DROP POLICY IF EXISTS "profiles readable by signed-in" ON public.profiles;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.student_directory()
RETURNS TABLE (id uuid, full_name text, intro text, tech_skills text[], soft_skills text[], interests text[], availability_hours integer, portfolio_links text[], past_projects text, collab_prefs text, is_sample boolean, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name, p.intro, p.tech_skills, p.soft_skills, p.interests, p.availability_hours, p.portfolio_links, p.past_projects, p.collab_prefs, p.is_sample, p.created_at
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
  ORDER BY p.is_sample, p.created_at DESC
$$;
REVOKE ALL ON FUNCTION public.student_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.student_directory() TO authenticated;