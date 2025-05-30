import { z } from "zod";

// Basic schema for dream entry creation
export const dreamEntryCreateSchema = z.object({
  dream_text: z.string().min(1, "Dream text is required"),
  user_id: z.string().uuid().optional(),
});

// Schema for dream entry with analysis data
export const dreamEntrySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  original_text: z.string(),
  title: z.string().nullable().optional(),
  dream_summary: z.string().nullable().optional(),
  personalized_summary: z.string().nullable().optional(), // New field for personalized one-sentence summary
  analysis_summary: z.string().nullable().optional(),
  topic_sentence: z.string().nullable().optional(),
  supporting_points: z.array(z.string()).nullable().optional(),
  conclusion_sentence: z.string().nullable().optional(),
  formatted_analysis: z.string().nullable().optional(),
  gematria_interpretation: z.string().nullable().optional(),
  color_symbolism: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  bible_refs: z.array(z.string()).nullable().optional(),
  raw_analysis: z.record(z.unknown()).nullable().optional(), // JSONB column for raw analysis
  created_at: z.string().optional(),
});

// Type for dream entry with analysis data
export type DreamEntry = z.infer<typeof dreamEntrySchema>;

// Type for dream entry creation
export type DreamEntryCreate = z.infer<typeof dreamEntryCreateSchema>;

// Schema for updating a dream entry
export const dreamEntryUpdateSchema = dreamEntrySchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
});

// Type for updating a dream entry
export type DreamEntryUpdate = z.infer<typeof dreamEntryUpdateSchema>;

// Schema for dream entry response
export const dreamEntriesResponseSchema = z.object({
  dreams: z.array(dreamEntrySchema),
});

// Type for dream entry response
export type DreamEntriesResponse = z.infer<typeof dreamEntriesResponseSchema>;