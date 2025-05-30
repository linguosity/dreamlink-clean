import { z } from "zod";

export const bibleCitationSchema = z.object({
  id: z.string().uuid().optional(), // optional on input
  dream_entry_id: z.string().uuid(),
  bible_book: z.string(),
  chapter: z.number().int(),
  verse: z.number().int(),
  full_text: z.string(),
  citation_order: z.number().int().default(1),
  source: z.string().optional(), // Tracks where the verse text came from (OpenAI response, fallback, etc.)
  created_at: z.string().optional(), // ISO string returned by DB; optional on input
});

export type BibleCitation = z.infer<typeof bibleCitationSchema>;