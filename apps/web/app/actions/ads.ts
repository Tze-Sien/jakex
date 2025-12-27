"use server";

import { revalidatePath } from "next/cache";

type ReviewAction = "apply" | "skip";

/**
 * Records an ad review action (Apply or Skip)
 * In a real implementation, this would update the database
 *
 * @param userId - The user's ID
 * @param adId - The ad ID being reviewed
 * @param action - The action taken (apply or skip)
 */
export async function recordAdReview(
  userId: string,
  adId: string,
  action: ReviewAction
): Promise<{ success: boolean }> {
  // TODO: In Phase 3, persist this to database:
  // - Record the review action in an adReviews table
  // - If action is "apply", potentially trigger META API call to implement the recommendation
  // - Track user's ad review history

  console.log(`User ${userId} ${action}ed ad ${adId}`);

  // Revalidate the dashboard to reflect changes
  revalidatePath("/dashboard");

  return { success: true };
}
