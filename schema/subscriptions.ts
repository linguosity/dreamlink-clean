import { z } from "zod";

export const subscriptionSchema = z.object({
  id: z.string().uuid().optional(), // optional on input
  user_id: z.string().uuid(),
  stripe_subscription_id: z.string().optional(),
  status: z.string(),
  plan: z.string(),
  credits: z.number().int().default(0),
  trial_end: z.string().nullable().optional(),         // ISO string or null
  current_period_end: z.string().nullable().optional(),   // ISO string or null
  created_at: z.string().optional(),  // returned as ISO string from DB
  updated_at: z.string().optional(),  // returned as ISO string from DB
});

export type Subscription = z.infer<typeof subscriptionSchema>;