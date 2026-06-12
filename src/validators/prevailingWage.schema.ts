import { z } from "zod";

const stateCodes = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
] as const;

const educationLevels = [
  "none",
  "high_school",
  "certificate",
  "associates",
  "bachelors",
  "masters",
  "doctorate",
] as const;

export const prevailingWageSchema = z
  .object({
    socCode: z.string().regex(/^\d{2}-\d{4}$/, "Use SOC format NN-NNNN."),
    workLocation: z.object({
      state: z.enum(stateCodes),
      area: z.string().min(2),
    }),
    jobZone: z.number().int().min(1).max(5),
    experienceComparison: z.enum([
      "at_or_below_start",
      "low_end",
      "high_end",
      "above_range",
    ]),
    usualEducation: z.enum(educationLevels),
    requiredEducation: z.enum(educationLevels),
    specialSkillsPoints: z.number().int().min(0).max(2),
    specialSkillsExplanation: z.array(z.string().min(3)),
    supervisesEmployees: z.boolean(),
    supervisionIsCustomaryForOccupation: z.boolean(),
  })
  .refine(
    (input) =>
      input.specialSkillsPoints === 0 ||
      input.specialSkillsExplanation.length > 0,
    {
      path: ["specialSkillsExplanation"],
      message: "Explain why special-skill points were added.",
    },
  );

export type PrevailingWageInput = z.infer<typeof prevailingWageSchema>;
