// Explainable, rule-based matching. Weights are PROPOSED and configurable;
// the model has not been validated.

export type Weights = { skills: number; interests: number; availability: number; portfolio: number };
export const DEFAULT_WEIGHTS: Weights = { skills: 50, interests: 25, availability: 15, portfolio: 10 };

export type MatchStudent = {
  tech_skills: string[];
  soft_skills: string[];
  interests: string[];
  availability_hours: number;
  portfolio_links: string[];
  past_projects: string;
};
export type MatchProject = { required_skills: string[]; interests: string[]; expected_hours: number };

export type MatchResult = {
  score: number;
  parts: Weights; // each 0..1
  matchedSkills: string[];
  missingSkills: string[];
  matchedInterests: string[];
  reasons: string[];
};

const norm = (s: string) => s.trim().toLowerCase();

export function portfolioEvidence(s: Pick<MatchStudent, "portfolio_links" | "past_projects">): number {
  const links = s.portfolio_links.filter((l) => l.trim()).length;
  const past = s.past_projects.trim().length > 0;
  if (links >= 2 || (links >= 1 && past)) return 1;
  if (links === 1) return 0.7;
  if (past) return 0.4;
  return 0;
}

export function computeMatch(project: MatchProject, student: MatchStudent, w: Weights = DEFAULT_WEIGHTS): MatchResult {
  const have = new Set([...student.tech_skills, ...student.soft_skills].map(norm));
  const matchedSkills = project.required_skills.filter((s) => have.has(norm(s)));
  const missingSkills = project.required_skills.filter((s) => !have.has(norm(s)));
  const skills = project.required_skills.length ? matchedSkills.length / project.required_skills.length : 0;

  const myInterests = new Set(student.interests.map(norm));
  const matchedInterests = project.interests.filter((i) => myInterests.has(norm(i)));
  const interests = project.interests.length ? matchedInterests.length / project.interests.length : 0;

  const availability = project.expected_hours <= 0 ? 1 : Math.min(1, student.availability_hours / project.expected_hours);
  const portfolio = portfolioEvidence(student);

  const total = w.skills + w.interests + w.availability + w.portfolio;
  const raw = total > 0 ? (w.skills * skills + w.interests * interests + w.availability * availability + w.portfolio * portfolio) / total : 0;
  const score = Math.round(raw * 100);

  const reasons: string[] = [];
  reasons.push(
    matchedSkills.length
      ? `Has ${matchedSkills.length} of ${project.required_skills.length} required skills: ${matchedSkills.join(", ")}`
      : "None of the required skills listed yet",
  );
  if (matchedInterests.length) reasons.push(`Shares interest in ${matchedInterests.join(", ")}`);
  reasons.push(
    availability >= 1
      ? `Available ${student.availability_hours} h/week (project needs ${project.expected_hours})`
      : `Available ${student.availability_hours} of ${project.expected_hours} h/week needed`,
  );
  reasons.push(
    portfolio >= 1 ? "Strong portfolio evidence" : portfolio > 0 ? "Some portfolio evidence" : "No portfolio evidence yet",
  );

  return { score, parts: { skills, interests, availability, portfolio }, matchedSkills, missingSkills, matchedInterests, reasons };
}

/** Required skills not covered by anyone already on the team. */
export function missingTeamSkills(required: string[], members: Pick<MatchStudent, "tech_skills" | "soft_skills">[]): string[] {
  const have = new Set(members.flatMap((m) => [...m.tech_skills, ...m.soft_skills]).map(norm));
  return required.filter((s) => !have.has(norm(s)));
}
