import { describe, expect, it } from "vitest";
import { computeMatch, DEFAULT_WEIGHTS, missingTeamSkills } from "./matching";

const project = { required_skills: ["React", "Node.js"], interests: ["EdTech"], expected_hours: 10 };
const empty = { tech_skills: [], soft_skills: [], interests: [], availability_hours: 0, portfolio_links: [], past_projects: "" };

describe("matching", () => {
  it("uses proposed weights 50/25/15/10", () => {
    expect(DEFAULT_WEIGHTS).toEqual({ skills: 50, interests: 25, availability: 15, portfolio: 10 });
  });
  it("perfect student scores 100", () => {
    const s = { tech_skills: ["react", "Node.js"], soft_skills: [], interests: ["EdTech"], availability_hours: 10, portfolio_links: ["a", "b"], past_projects: "" };
    expect(computeMatch(project, s).score).toBe(100);
  });
  it("skills alone are worth 50", () => {
    expect(computeMatch(project, { ...empty, tech_skills: ["React", "Node.js"] }).score).toBe(50);
  });
  it("half skills + full availability = 25 + 15", () => {
    expect(computeMatch(project, { ...empty, tech_skills: ["React"], availability_hours: 20 }).score).toBe(40);
  });
  it("lists team skill gaps", () => {
    expect(missingTeamSkills(["React", "Figma"], [{ tech_skills: ["react"], soft_skills: [] }])).toEqual(["Figma"]);
  });
});
