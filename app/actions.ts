"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";
import { isRedirectError } from "next/dist/client/components/redirect-error"; // Import for safe redirect handling

// --- Sign Up ---
export const signUpAction = async (formData: FormData) => {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      redirect("/sign-up?error=Email and password are required");
    }

    const isValidEmail = (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail(email)) {
      redirect("/sign-up?error=Invalid email format");
    }

    const supabase = await createClient();

    let origin;
    try {
      const headersList = await headers();
      origin = headersList.get("origin") || "http://localhost:3000";
    } catch {
      origin = "http://localhost:3000";
    }

    // in action.ts ↓
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // instead of `origin`, point at your callback + target page:
      emailRedirectTo: `${origin}/auth/callback?redirect_to=/`,
    },
  });

    if (error) {
      console.error(error.code + " " + error.message);
      return { error: error.message };
    }

    return { success: "Thanks for signing up! Check your email for a verification link." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Unexpected error during sign up:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
};

// --- Sign In ---
export const signInAction = async (formData: FormData) => {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      redirect("/sign-in?error=Email and password are required");
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign-in error:", error.message);
      redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    if (!data?.session) {
      console.error("No session after login");
      redirect(
        "/sign-in?error=Authentication succeeded but no session was created. Please try again."
      );
    }

    // Small delay for cookie processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/", "layout");
    } catch {
      console.log("Revalidation step skipped (ok in production)");
    }

    redirect("/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Unexpected error during sign in:", error);
    redirect("/sign-in?error=An unexpected error occurred. Please try again.");
  }
};

// --- Forgot Password ---
export const forgotPasswordAction = async (formData: FormData) => {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase();

    if (!email) {
      redirect("/forgot-password?error=Email is required");
    }

    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
    });

    if (error) {
      console.error(error.message);
      redirect("/forgot-password?error=Could not reset password");
    }

    redirect(
      `/forgot-password?success=${encodeURIComponent(
        "Check your email for a link to reset your password."
      )}`
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Unexpected error during forgot password:", error);
    redirect(
      "/forgot-password?error=An unexpected error occurred. Please try again."
    );
  }
};

// --- Reset Password ---
export const resetPasswordAction = async (formData: FormData) => {
  try {
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!password || !confirmPassword) {
      redirect(
        "/protected/reset-password?error=Password and confirm password are required"
      );
    }

    if (password !== confirmPassword) {
      redirect("/protected/reset-password?error=Passwords do not match");
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error(error.message);
      redirect("/protected/reset-password?error=Password update failed");
    }

    redirect(
      `/protected/reset-password?success=${encodeURIComponent(
        "Password updated successfully."
      )}`
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Unexpected error during reset password:", error);
    redirect(
      "/protected/reset-password?error=An unexpected error occurred. Please try again."
    );
  }
};

// --- Sign Out ---
export const signOutAction = async () => {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/", "layout");
    } catch {
      console.log("Revalidation skipped (ok in production)");
    }

    redirect("/sign-in");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Unexpected error during sign out:", error);
    redirect("/sign-in?error=An unexpected error occurred during sign out.");
  }
};
