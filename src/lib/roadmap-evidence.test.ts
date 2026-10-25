import { describe, expect, it } from "vitest";
import { canReviewMilestone, evidenceSchema, firstUnapprovedStage, MILESTONE_FIELDS } from "./roadmap-evidence";

describe("Roadmap evidence rules", () => {
  for (let milestone = 1; milestone <= 6; milestone++) {
    it(`blocks empty and whitespace-only submissions for stage ${milestone}`, () => {
      expect(evidenceSchema.safeParse({ milestone, fields: {}, evidence: " " }).success).toBe(false);
      const fields = Object.fromEntries((MILESTONE_FIELDS[milestone] ?? []).map((f) => [f.key, " \t\n "]));
      expect(evidenceSchema.safeParse({ milestone, fields, evidence: "Interview summary" }).success).toBe(false);
    });
    it(`accepts required evidence for stage ${milestone}`, () => {
      const fields = Object.fromEntries((MILESTONE_FIELDS[milestone] ?? []).map((f) => [f.key, f.key === "demo_link" ? "https://example.org/demo" : f.key === "user_count" ? "5" : "Documented findings"]));
      expect(evidenceSchema.safeParse({ milestone, fields, evidence: "Interview summaries and results" }).success).toBe(true);
      expect(evidenceSchema.safeParse({ milestone, fields, evidence: "" }).success).toBe(false);
    });
  }
  it("restricts approval to the project owner reviewing a submitted milestone", () => {
    expect(canReviewMilestone("owner", "other-student", "Submitted for Review")).toBe(false);
    expect(canReviewMilestone("owner", "owner", "In Progress")).toBe(false);
    expect(canReviewMilestone("owner", "owner", "Submitted for Review")).toBe(true);
  });
  it("submission does not complete a milestone", () => {
    expect(firstUnapprovedStage([{ milestone: 1, status: "Submitted for Review" }])).toBe(1);
    expect(firstUnapprovedStage([{ milestone: 1, status: "Approved" }])).toBe(2);
  });
  it("requires a positive user count and a web prototype link", () => {
    expect(evidenceSchema.safeParse({ milestone: 5, fields: { user_count: "0", feedback: "Useful", lessons: "Improve" }, evidence: "Results" }).success).toBe(false);
    expect(evidenceSchema.safeParse({ milestone: 4, fields: { prototype_description: "Prototype", demo_link: "javascript:alert(1)" }, evidence: "Screenshots" }).success).toBe(false);
  });
});