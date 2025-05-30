import { z } from "zod";

// Define the reading level enum
export const ReadingLevel = {
  RADIANT_CLARITY: "radiant_clarity", // Simple (3rd grade)
  CELESTIAL_INSIGHT: "celestial_insight", // Standard (8th grade)
  PROPHETIC_WISDOM: "prophetic_wisdom", // Advanced (12th grade)
  DIVINE_REVELATION: "divine_revelation", // Scholarly (biblical expert)
} as const;

export const readingLevelSchema = z.enum([
  ReadingLevel.RADIANT_CLARITY,
  ReadingLevel.CELESTIAL_INSIGHT,
  ReadingLevel.PROPHETIC_WISDOM,
  ReadingLevel.DIVINE_REVELATION,
]);

export type ReadingLevel = z.infer<typeof readingLevelSchema>;

export const profileSchema = z.object({
  id: z.string().uuid().optional(), // generated automatically; optional on input
  user_id: z.string().uuid(),
  language: z.string().optional(),
  bible_version: z.string().optional(),
  reading_level: readingLevelSchema.default(ReadingLevel.CELESTIAL_INSIGHT).optional(),
  created_at: z.string().optional(), // ISO string returned by DB; optional on input
});

export type Profile = z.infer<typeof profileSchema>;