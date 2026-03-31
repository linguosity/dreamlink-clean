import { z } from "zod";

/**
 * Shared auth validation schemas.
 * Used by both server actions (sign-up, sign-in, reset) and any future API routes.
 */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9\W]/, "Password must include a number or special character");

/** Sign-in only checks presence (Supabase handles actual auth) */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/** Sign-up enforces strength requirements */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** Forgot password — just email */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** Reset password — new password + confirmation match */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Export types
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
