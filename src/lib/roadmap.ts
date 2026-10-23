export const CHECKLIST = [
  { key: "problem", label: "Problem clarity", hint: "Is the problem written in one clear sentence?", action: "Rewrite the problem as: '[Who] struggles with [what] because [why].'" },
  { key: "users", label: "Target users", hint: "Do you know exactly who has this problem?", action: "Name one specific user group and list 3 real people you can talk to." },
  { key: "feedback", label: "Customer feedback", hint: "Have you spoken to at least 5 potential users?", action: "Run 5 short interviews and note the top 3 repeated pain points." },
  { key: "alternatives", label: "Existing alternatives", hint: "What do people use today instead?", action: "List 3 existing tools or workarounds and why they fall short." },
  { key: "feasibility", label: "Technical feasibility", hint: "Can your team build a working prototype?", action: "Identify the riskiest technical part and build a tiny spike for it." },
  { key: "business", label: "Business model", hint: "How could this sustain itself?", action: "Sketch who pays, what they pay for, and roughly how much." },
] as const;

export const ROADMAP = [
  { n: 1, title: "Define the problem", desc: "Write a crisp problem statement and target user." },
  { n: 2, title: "Validate the need with users", desc: "Interview users and confirm the pain is real." },
  { n: 3, title: "Find teammates with missing skills", desc: "Use matching to invite students who fill skill gaps." },
  { n: 4, title: "Build a prototype", desc: "Ship the smallest version that demonstrates the core value." },
  { n: 5, title: "Test and improve", desc: "Put it in front of users, measure, iterate." },
  { n: 6, title: "Prepare for launch", desc: "Polish, document, and plan your demo or launch." },
];

export const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "validating", label: "Validating" },
  { value: "prototype", label: "Prototype" },
  { value: "testing", label: "Testing" },
  { value: "launch", label: "Launch-ready" },
];
export const stageLabel = (v: string) => STAGES.find((s) => s.value === v)?.label ?? v;

export const SKILL_SUGGESTIONS = [
  "React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Flutter", "Firebase", "Machine Learning",
  "Figma", "UI Design", "User Research", "Market Research", "Business Modeling", "Marketing", "Pitching",
  "Communication", "Leadership", "Documentation",
];
export const INTEREST_SUGGESTIONS = ["EdTech", "HealthTech", "FinTech", "AgriTech", "Sustainability", "Social Impact", "Accessibility", "Data"];
