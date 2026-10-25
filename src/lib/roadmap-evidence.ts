import { z } from "zod";

export const MILESTONE_FIELDS: Record<number, { key: string; label: string }[]> = {
  1: [{ key: "problem", label: "Problem statement" }, { key: "target_users", label: "Target users" }],
  2: [{ key: "problem", label: "Problem statement" }, { key: "target_users", label: "Target users" }, { key: "research_method", label: "Research method" }, { key: "findings", label: "Research findings" }],
  3: [{ key: "missing_skills", label: "Missing skills" }, { key: "team_plan", label: "Team plan" }],
  4: [{ key: "prototype_description", label: "Prototype description" }, { key: "demo_link", label: "Demo or screenshot link" }],
  5: [{ key: "user_count", label: "Number of test users" }, { key: "feedback", label: "User feedback" }, { key: "lessons", label: "Lessons learned" }],
  6: [{ key: "target_customers", label: "Target customers" }, { key: "business_model", label: "Business model" }, { key: "estimated_costs", label: "Estimated costs" }],
};

export const evidenceSchema = z.object({
  milestone: z.number().int().min(1).max(6),
  fields: z.record(z.string().max(4000)),
  evidence: z.string().trim().min(1, "Relevant evidence is required").max(10000),
}).superRefine((value, ctx) => {
  for (const field of MILESTONE_FIELDS[value.milestone] ?? []) {
    const text = value.fields[field.key]?.trim();
    if (!text) ctx.addIssue({ code: "custom", message: `${field.label} is required`, path: ["fields", field.key] });
  }
  if (value.milestone === 4) {
    const link = value.fields["demo_link"]?.trim() ?? "";
    if (!/^https?:\/\/\S+$/.test(link)) ctx.addIssue({ code: "custom", message: "Provide a valid demo or screenshot link" });
  }
  if (value.milestone === 5 && !/^[1-9][0-9]{0,5}$/.test(value.fields["user_count"]?.trim() ?? "")) {
    ctx.addIssue({ code: "custom", message: "Number of test users must be a positive whole number" });
  }
});

export const canReviewMilestone = (ownerId: string, actorProfileId: string, status: string) => ownerId === actorProfileId && status === "Submitted for Review";
export const firstUnapprovedStage = (rows: { milestone: number; status: string }[]) => {
  for (let stage = 1; stage <= 6; stage++) if (!rows.some((r) => r.milestone === stage && r.status === "Approved")) return stage;
  return 7;
};