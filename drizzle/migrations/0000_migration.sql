
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  tech_skills text[] NOT NULL DEFAULT '{}',
  soft_skills text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  availability_hours int NOT NULL DEFAULT 5,
  portfolio_links text[] NOT NULL DEFAULT '{}',
  past_projects text NOT NULL DEFAULT '',
  collab_prefs text NOT NULL DEFAULT '',
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by signed-in" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND is_sample = false);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND is_sample = false);

CREATE OR REPLACE FUNCTION public.my_profile_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT id FROM public.profiles WHERE user_id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  problem text NOT NULL DEFAULT '',
  solution text NOT NULL DEFAULT '',
  target_users text NOT NULL DEFAULT '',
  required_skills text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  expected_hours int NOT NULL DEFAULT 5,
  stage text NOT NULL DEFAULT 'idea',
  checklist jsonb NOT NULL DEFAULT '{}',
  roadmap_stage int NOT NULL DEFAULT 1,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects readable" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "owner inserts" ON public.projects FOR INSERT TO authenticated WITH CHECK (owner_id = public.my_profile_id() AND is_sample = false);
CREATE POLICY "owner updates" ON public.projects FOR UPDATE TO authenticated USING (owner_id = public.my_profile_id()) WITH CHECK (owner_id = public.my_profile_id() AND is_sample = false);
CREATE POLICY "owner deletes" ON public.projects FOR DELETE TO authenticated USING (owner_id = public.my_profile_id());

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  match_score int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, profile_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_project(_project uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = _project AND owner_id = public.my_profile_id()) $$;

CREATE POLICY "see own or project invites" ON public.invitations FOR SELECT TO authenticated
  USING (profile_id = public.my_profile_id() OR public.owns_project(project_id) OR status = 'accepted');
CREATE POLICY "owner invites" ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.owns_project(project_id) AND status = 'pending' AND profile_id <> public.my_profile_id());
CREATE POLICY "invitee responds" ON public.invitations FOR UPDATE TO authenticated
  USING (profile_id = public.my_profile_id()) WITH CHECK (profile_id = public.my_profile_id());
CREATE POLICY "owner withdraws" ON public.invitations FOR DELETE TO authenticated USING (public.owns_project(project_id));

-- Sample (demo) data: clearly flagged with is_sample = true, not real people.
INSERT INTO public.profiles (id, full_name, intro, tech_skills, soft_skills, interests, availability_hours, portfolio_links, past_projects, collab_prefs, is_sample) VALUES
('00000000-0000-0000-0000-000000000001','Aarav (Sample)','Frontend developer who loves accessible, fast interfaces.','{React,TypeScript,Tailwind CSS,Figma}','{Communication,Presentation}','{EdTech,Accessibility}',10,'{https://github.com/example-aarav}','Campus event app prototype','Remote, evenings',true),
('00000000-0000-0000-0000-000000000002','Meera (Sample)','Backend and data enthusiast; enjoys designing APIs.','{Node.js,PostgreSQL,Python,REST APIs}','{Problem Solving,Documentation}','{HealthTech,Data}',8,'{https://github.com/example-meera,https://example.com/meera}','Clinic queue tracker','Hybrid, weekends',true),
('00000000-0000-0000-0000-000000000003','Rohan (Sample)','ML student exploring computer vision for agriculture.','{Python,Machine Learning,OpenCV}','{Research}','{AgriTech,Sustainability}',6,'{}','Leaf disease classifier (coursework)','Remote',true),
('00000000-0000-0000-0000-000000000004','Ananya (Sample)','Product and UX designer who runs user interviews.','{Figma,UI Design}','{User Research,Market Research,Presentation}','{EdTech,Social Impact}',12,'{https://example.com/ananya-portfolio}','Redesign of college library portal','In person, flexible',true),
('00000000-0000-0000-0000-000000000005','Kabir (Sample)','Mobile developer and hackathon regular.','{Flutter,Firebase,Kotlin}','{Leadership}','{FinTech,Sustainability}',15,'{https://github.com/example-kabir}','Expense splitter app','Remote, daily standups',true),
('00000000-0000-0000-0000-000000000006','Sara (Sample)','Commerce student interested in startup business models.','{Excel}','{Business Modeling,Marketing,Pitching}','{FinTech,Social Impact}',5,'{}','','Weekends only',true);

INSERT INTO public.projects (id, owner_id, title, problem, solution, target_users, required_skills, interests, expected_hours, stage, checklist, roadmap_stage, is_sample) VALUES
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','StudyCircle (Sample)','First-year students struggle to find peers for subject-wise study groups.','A web app that groups students by course and schedule.','First-year college students','{React,Node.js,PostgreSQL,User Research}','{EdTech}',8,'prototype','{"problem":true,"users":true}',3,true),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003','CropScan (Sample)','Small farmers detect crop diseases too late.','Phone-camera based leaf disease detection with local-language tips.','Smallholder farmers','{Python,Machine Learning,Flutter,UI Design}','{AgriTech,Sustainability}',10,'idea','{"problem":true}',2,true),
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000006','CampusPay (Sample)','Students lose track of shared expenses in hostels.','Simple split-and-settle ledger for roommates.','Hostel students','{Flutter,Firebase,Business Modeling}','{FinTech}',6,'idea','{}',1,true);
