"use server";

import { db } from "@repo/database";
import { metaConnections, adAccounts } from "@repo/database/schema";
import { eq, and } from "drizzle-orm";

/**
 * Gets the META connection for a user
 * @param userId - The user's ID
 * @returns The active META connection or null if not found
 */
export async function getMetaConnection(userId: string) {
  const connections = await db
    .select()
    .from(metaConnections)
    .where(
      and(
        eq(metaConnections.userId, userId),
        eq(metaConnections.status, "active")
      )
    )
    .limit(1);

  return connections[0] || null;
}

/**
 * Gets the selected ad account for a user
 * @param connectionId - The META connection ID
 * @returns The first ad account or null
 */
export async function getSelectedAdAccount(connectionId: string) {
  const accounts = await db
    .select()
    .from(adAccounts)
    .where(eq(adAccounts.metaConnectionId, connectionId))
    .limit(1);

  return accounts[0] || null;
}
