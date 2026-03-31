import { z } from "zod";

/** Schema for creating a new prompt version (POST /api/admin/prompts) */
export const promptCreateSchema = z.object({
  system_message: z
    .string()
    .min(1, "System message is required")
    .max(10000, "System message must be 10,000 characters or fewer"),
  main_instructions: z
    .string()
    .min(1, "Main instructions are required")
    .max(20000, "Main instructions must be 20,000 characters or fewer"),
  format_instructions: z
    .string()
    .min(1, "Format instructions are required")
    .max(10000, "Format instructions must be 10,000 characters or fewer"),
  forbidden_phrases: z.array(z.string()).optional().default([]),
  reading_level_radiant_clarity: z.string().optional().default(""),
  reading_level_celestial_insight: z.string().optional().default(""),
  reading_level_prophetic_wisdom: z.string().optional().default(""),
  reading_level_divine_revelation: z.string().optional().default(""),
  notes: z.string().max(500, "Notes must be 500 characters or fewer").optional(),
});

/** Schema for reverting to a specific version (PUT /api/admin/prompts) */
export const promptRevertSchema = z.object({
  version_id: z.string().uuid("Invalid version ID"),
});

export type PromptCreateInput = z.infer<typeof promptCreateSchema>;
export type PromptRevertInput = z.infer<typeof promptRevertSchema>;
