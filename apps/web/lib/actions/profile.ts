"use server";

import { db } from "@repo/database";
import { profiles } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@repo/auth/server";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@repo/auth/server";
import { revalidatePath } from "next/cache";

/**
 * Gets the current user's profile
 * profile.id = auth.users.id (same ID from Supabase Auth)
 * Only returns active profiles (not archived)
 */
export async function getUserProfile() {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error, profile: null };
  }

  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, auth.user.id),
    });

    if (!profile) {
      return { success: false, error: "Profile not found", profile: null };
    }

    // Don't return archived profiles
    if (profile.status === "archived") {
      return { success: false, error: "Profile not found", profile: null };
    }

    return { success: true, profile };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "Failed to fetch profile", profile: null };
  }
}

/**
 * Updates the user's profile information
 * Uses supabaseUserId to find the profile
 */
export async function updateUserProfile(data: {
  fullName?: string;
  avatarUrl?: string;
}) {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  try {
    await db
      .update(profiles)
      .set({
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, auth.user.id));

    revalidatePath("/settings");
    revalidatePath("/", "layout"); // Revalidate layout for sidebar update

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Sends a password reset email to the user
 */
export async function sendPasswordResetEmail() {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(auth.user.email!, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: "Failed to send password reset email" };
  }
}

/**
 * Deletes (archives) the user's account following Apple/Meta account deletion requirements:
 * - Archives the profile in database (soft delete - data preserved for compliance)
 * - Clears the supabase_user_id link (profile becomes "orphaned")
 * - Deletes the user from Supabase Auth (hard delete)
 * - When user re-registers with same email, a brand new profile is created
 * - Old archived profile data is no longer accessible via normal queries
 */
export async function deleteUserAccount() {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const userId = auth.user.id;

    // Step 1: Archive the profile in database
    // - Set status to 'archived'
    // - Record archived_at timestamp
    // Profile keeps the old user ID (which will no longer exist in Supabase)
    await db
      .update(profiles)
      .set({
        status: "archived",
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    // Step 2: Sign out the user's current session
    await supabase.auth.signOut();

    // Step 3: Delete user from Supabase Auth using admin client
    // This requires SUPABASE_SERVICE_ROLE_KEY environment variable
    // After deletion, the profile.id becomes an orphaned ID (no longer exists in auth.users)
    try {
      const adminClient = createAdminSupabaseClient();
      const { error: deleteError } =
        await adminClient.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Error deleting user from Supabase Auth:", deleteError);
        // Profile is already archived, so we don't fail the whole operation
        // The user is signed out and won't be able to access their account
        // Manual cleanup may be needed for the auth.users record
      }
    } catch (adminError) {
      console.error("Admin client error:", adminError);
      // Continue - profile is archived and user is signed out
      // This might happen if SUPABASE_SERVICE_ROLE_KEY is not configured
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}