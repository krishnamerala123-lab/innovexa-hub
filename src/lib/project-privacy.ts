import { z } from "zod";

export const PRIVACY_OPTIONS = [
  { value: "public_discovery", label: "Public Discovery", description: "Anyone can see your general problem, general solution, skills and open positions. Team-only notes and documents remain restricted." },
  { value: "approval_required", label: "Approval Required", description: "Anyone can see your title, general problem, skills and open positions. Solutions and private details require your approval." },
  { value: "private_team", label: "Private Team", description: "Hidden from discovery. Only you and approved team members can access this project." },
] as const;
export const DEFAULT_PRIVACY = "approval_required";
export const privacySchema = z.enum(["public_discovery", "approval_required", "private_team"]);
export function isProjectOwner(project: { creator_user_id?: string | null; owner_id: string }, profile?: { id: string; user_id: string | null } | null) {
  return Boolean(profile?.user_id && project.creator_user_id === profile.user_id && project.owner_id === profile.id);
}
export const projectSettingsSchema = z.object({
  title: z.string().trim().min(3).max(100), problem: z.string().trim().min(10).max(1000),
  solution: z.string().trim().max(10000), general_solution: z.string().trim().max(1000),
  privacy: privacySchema.default(DEFAULT_PRIVACY), available_positions: z.array(z.string().trim().min(1).max(40)).max(25),
  technical_notes: z.string().max(10000), confidential_notes: z.string().max(10000),
  document_links: z.array(z.string().url().refine((v) => /^https?:\/\//.test(v), "Use a web link")).max(25),
});