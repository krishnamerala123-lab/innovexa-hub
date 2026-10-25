CREATE TABLE public.roadmap_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
 milestone integer NOT NULL CHECK (milestone BETWEEN 1 AND 6),
 submitted_by uuid NOT NULL,
 fields jsonb NOT NULL DEFAULT '{}'::jsonb,
 evidence text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'In Progress' CHECK (status IN ('Not Started','In Progress','Submitted for Review','Changes Requested','Approved')),
 review_note text NOT NULL DEFAULT '',
 reviewed_by uuid,
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(project_id,milestone)
);
GRANT SELECT, INSERT, UPDATE ON public.roadmap_submissions TO authenticated;
GRANT ALL ON public.roadmap_submissions TO service_role;
ALTER TABLE public.roadmap_submissions ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.can_submit_roadmap(_project uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.owns_project(_project) OR EXISTS (SELECT 1 FROM public.invitations WHERE project_id=_project AND profile_id=public.my_profile_id() AND status='accepted');
$$;
REVOKE ALL ON FUNCTION public.can_submit_roadmap(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_submit_roadmap(uuid) TO authenticated;
CREATE POLICY "team reads roadmap evidence" ON public.roadmap_submissions FOR SELECT TO authenticated USING (public.can_submit_roadmap(project_id));
CREATE POLICY "team submits roadmap evidence" ON public.roadmap_submissions FOR INSERT TO authenticated WITH CHECK (public.can_submit_roadmap(project_id) AND submitted_by=auth.uid() AND status IN ('Not Started','In Progress','Submitted for Review'));
CREATE POLICY "team edits and owner reviews roadmap evidence" ON public.roadmap_submissions FOR UPDATE TO authenticated USING (public.can_submit_roadmap(project_id)) WITH CHECK (public.can_submit_roadmap(project_id));
CREATE FUNCTION public.validate_roadmap_submission() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE required_keys text[]; k text; is_review boolean;
BEGIN
 IF TG_OP='UPDATE' AND (NEW.project_id IS DISTINCT FROM OLD.project_id OR NEW.milestone IS DISTINCT FROM OLD.milestone OR NEW.id IS DISTINCT FROM OLD.id) THEN RAISE EXCEPTION 'Milestone identity cannot change'; END IF;
 IF auth.uid() IS NULL OR NOT public.can_submit_roadmap(NEW.project_id) THEN RAISE EXCEPTION 'Not authorized to submit'; END IF;
 is_review := NEW.status IN ('Approved','Changes Requested');
 IF is_review THEN
  IF NOT public.owns_project(NEW.project_id) THEN RAISE EXCEPTION 'Only the project owner may review'; END IF;
  IF TG_OP='INSERT' THEN RAISE EXCEPTION 'Submit evidence before review'; END IF;
  IF OLD.status <> 'Submitted for Review' THEN RAISE EXCEPTION 'Only submitted milestones may be reviewed'; END IF;
  IF NEW.fields IS DISTINCT FROM OLD.fields OR NEW.evidence IS DISTINCT FROM OLD.evidence OR NEW.submitted_by IS DISTINCT FROM OLD.submitted_by THEN RAISE EXCEPTION 'Review cannot change submitted evidence'; END IF;
  IF NEW.status='Changes Requested' AND btrim(NEW.review_note)='' THEN RAISE EXCEPTION 'Explain the requested changes'; END IF;
  NEW.reviewed_by := auth.uid();
 ELSE
  IF TG_OP='UPDATE' AND OLD.status IN ('Approved','Submitted for Review') THEN RAISE EXCEPTION 'Reviewed or pending evidence is locked'; END IF;
  NEW.submitted_by := auth.uid(); NEW.reviewed_by := NULL; NEW.review_note := '';
 END IF;
 IF jsonb_typeof(NEW.fields) <> 'object' OR length(NEW.evidence)>10000 OR length(NEW.review_note)>4000 THEN RAISE EXCEPTION 'Invalid evidence format or length'; END IF;
 IF NEW.status IN ('Submitted for Review','Approved') THEN
  required_keys := CASE NEW.milestone
   WHEN 1 THEN ARRAY['problem','target_users']
   WHEN 2 THEN ARRAY['problem','target_users','research_method','findings']
   WHEN 3 THEN ARRAY['missing_skills','team_plan']
   WHEN 4 THEN ARRAY['prototype_description','demo_link']
   WHEN 5 THEN ARRAY['user_count','feedback','lessons']
   WHEN 6 THEN ARRAY['target_customers','business_model','estimated_costs'] END;
  FOREACH k IN ARRAY required_keys LOOP
   IF jsonb_typeof(NEW.fields->k) IS DISTINCT FROM 'string' OR btrim(COALESCE(NEW.fields->>k,''))='' OR length(NEW.fields->>k)>4000 THEN RAISE EXCEPTION 'Required field missing or invalid: %',k; END IF;
  END LOOP;
  IF btrim(NEW.evidence)='' THEN RAISE EXCEPTION 'Relevant evidence is required'; END IF;
  IF NEW.milestone=4 AND (NEW.fields->>'demo_link') !~ '^https?://[^[:space:]]+' THEN RAISE EXCEPTION 'Provide a valid demo or screenshot link'; END IF;
  IF NEW.milestone=5 THEN
   IF (NEW.fields->>'user_count') !~ '^[1-9][0-9]{0,5}$' THEN RAISE EXCEPTION 'User count must be a positive whole number'; END IF;
  END IF;
 END IF;
 NEW.updated_at := now(); RETURN NEW;
END;
$$;
CREATE TRIGGER validate_roadmap_submission BEFORE INSERT OR UPDATE ON public.roadmap_submissions FOR EACH ROW EXECUTE FUNCTION public.validate_roadmap_submission();
CREATE FUNCTION public.approved_roadmap_stage(_project uuid) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT COALESCE((SELECT n FROM generate_series(1,6) n WHERE NOT EXISTS(SELECT 1 FROM public.roadmap_submissions r WHERE r.project_id=_project AND r.milestone=n AND r.status='Approved') ORDER BY n LIMIT 1),7);
$$;
REVOKE ALL ON FUNCTION public.approved_roadmap_stage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approved_roadmap_stage(uuid) TO authenticated;
CREATE FUNCTION public.guard_roadmap_completion() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.roadmap_stage<>1 AND NOT NEW.is_sample THEN RAISE EXCEPTION 'New projects start at stage one'; END IF;
 ELSIF NEW.roadmap_stage IS DISTINCT FROM OLD.roadmap_stage AND NEW.roadmap_stage <> public.approved_roadmap_stage(NEW.id) THEN RAISE EXCEPTION 'Roadmap completion requires approved evidence'; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_roadmap_completion BEFORE INSERT OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.guard_roadmap_completion();
CREATE FUNCTION public.sync_approved_roadmap() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.projects SET roadmap_stage=public.approved_roadmap_stage(NEW.project_id) WHERE id=NEW.project_id;
 RETURN NEW;
END;
$$;
CREATE TRIGGER sync_approved_roadmap AFTER INSERT OR UPDATE ON public.roadmap_submissions FOR EACH ROW EXECUTE FUNCTION public.sync_approved_roadmap();