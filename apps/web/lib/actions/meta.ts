"use server";

import { db } from "@repo/database";
import { metaConnections, adAccounts, ads, campaigns, adSets, userSelectedAdAccount } from "@repo/database/schema";
import { eq, and, inArray } from "drizzle-orm";
import { withAuth } from "@repo/auth/server";
import { MetaAdsClient } from "@repo/meta-api";


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
 * Gets the first ad account for a connection (fallback when no selection exists)
 * @param connectionId - The META connection ID
 * @returns The first ad account or null
 */
export async function getFirstAdAccount(connectionId: string) {
  const accounts = await db
    .select()
    .from(adAccounts)
    .where(eq(adAccounts.metaConnectionId, connectionId))
    .limit(1);

  return accounts[0] || null;
}

/**
 * Sets the user's selected ad account and persists it to the database
 * @param adAccountId - The ad account ID to select
 * @param userId - The user's ID (optional, for internal use only)
 * @returns Success/error result
 */
export async function setUserSelectedAdAccount(adAccountId: string, userId?: string) {
  try {
    // Get the current user if userId not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const auth = await withAuth();
      if (!auth.success) {
        return { success: false, error: auth.error };
      }
      currentUserId = auth.user.id;
    }

    // Verify the ad account exists in the database
    const account = await db.query.adAccounts.findFirst({
      where: eq(adAccounts.id, adAccountId),
    });

    if (!account) {
      return { success: false, error: "Ad account not found" };
    }

    // Upsert the selected ad account for this user
    await db
      .insert(userSelectedAdAccount)
      .values({
        userId: currentUserId,
        adAccountId: adAccountId,
      })
      .onConflictDoUpdate({
        target: userSelectedAdAccount.userId,
        set: {
          adAccountId: adAccountId,
          selectedAt: new Date(),
        },
      });

    return { success: true };
  } catch (error) {
    console.error("Error setting selected ad account:", error);
    return { success: false, error: "Failed to set selected ad account" };
  }
}

/**
 * Gets the user's selected ad account from the database
 * @param userId - The user's ID (optional, for internal use only)
 * @returns The selected ad account ID or null
 */
export async function getUserSelectedAdAccount(userId?: string) {
  try {
    // Get the current user if userId not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const auth = await withAuth();
      if (!auth.success) {
        return { success: false, error: auth.error, selectedAccountId: null };
      }
      currentUserId = auth.user.id;
    }

    const selected = await db.query.userSelectedAdAccount.findFirst({
      where: eq(userSelectedAdAccount.userId, currentUserId),
    });

    return {
      success: true,
      selectedAccountId: selected?.adAccountId || null,
    };
  } catch (error) {
    console.error("Error getting selected ad account:", error);
    return { success: false, error: "Failed to get selected ad account", selectedAccountId: null };
  }
}

/**
 * Gets ad accounts from the database for a specific connection
 * @param connectionId - The META connection ID
 * @returns Array of ad accounts
 */
export async function getAdAccountsFromDatabase(connectionId: string) {
  const accountsData = await db
    .select()
    .from(adAccounts)
    .where(eq(adAccounts.metaConnectionId, connectionId));

  return accountsData;
}

/**
 * Gets campaigns from the database for a specific ad account
 * @param connectionId - The META connection ID
 * @param filters - Optional filters
 * @param filters.adAccountId - Filter by META ad account ID
 * @returns Array of campaigns
 */
export async function getCampaignsFromDatabase(
  connectionId: string,
  filters?: { adAccountId?: string }
) {
  // Get all ad accounts for this connection
  const accountsData = await db
    .select()
    .from(adAccounts)
    .where(
      filters?.adAccountId
        ? and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.metaAdAccountId, filters.adAccountId)
          )
        : eq(adAccounts.metaConnectionId, connectionId)
    );

  if (accountsData.length === 0) {
    return [];
  }

  const accountIds = accountsData.map((acc) => acc.id);

  // Fetch campaigns
  const campaignsData = await db
    .select()
    .from(campaigns)
    .where(
      accountIds.length === 1
        ? eq(campaigns.adAccountId, accountIds[0])
        : inArray(campaigns.adAccountId, accountIds)
    );

  return campaignsData;
}

/**
 * Gets ad sets from the database
 * @param connectionId - The META connection ID
 * @param filters - Optional filters
 * @param filters.adAccountId - Filter by META ad account ID
 * @param filters.campaignId - Filter by META campaign ID (direct parent)
 * @returns Array of ad sets with their campaign data
 */
export async function getAdSetsFromDatabase(
  connectionId: string,
  filters?: { adAccountId?: string; campaignId?: string }
) {
  // Get all ad accounts for this connection
  const accountsData = await db
    .select()
    .from(adAccounts)
    .where(
      filters?.adAccountId
        ? and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.metaAdAccountId, filters.adAccountId)
          )
        : eq(adAccounts.metaConnectionId, connectionId)
    );

  if (accountsData.length === 0) {
    return [];
  }

  const accountIds = accountsData.map((acc) => acc.id);

  // Get campaigns for these accounts (with optional campaign filter)
  const campaignsData = await db
    .select()
    .from(campaigns)
    .where(
      filters?.campaignId
        ? and(
            accountIds.length === 1
              ? eq(campaigns.adAccountId, accountIds[0])
              : inArray(campaigns.adAccountId, accountIds),
            eq(campaigns.metaCampaignId, filters.campaignId)
          )
        : accountIds.length === 1
        ? eq(campaigns.adAccountId, accountIds[0])
        : inArray(campaigns.adAccountId, accountIds)
    );

  if (campaignsData.length === 0) {
    return [];
  }

  const campaignIds = campaignsData.map((campaign) => campaign.id);

  // Fetch ad sets with their campaign relationships
  const adSetsData = await db.query.adSets.findMany({
    where:
      campaignIds.length === 1
        ? eq(adSets.campaignId, campaignIds[0])
        : inArray(adSets.campaignId, campaignIds),
    with: {
      campaign: true,
    },
  });

  return adSetsData;
}

/**
 * Gets ads from the database
 * @param connectionId - The META connection ID
 * @param filters - Optional filters
 * @param filters.adAccountId - Filter by META ad account ID
 * @param filters.campaignId - Filter by META campaign ID
 * @param filters.adSetId - Filter by META ad set ID (direct parent)
 * @returns Array of ads with their ad set and campaign data
 */
export async function getAdsFromDatabase(
  connectionId: string,
  filters?: { adAccountId?: string; campaignId?: string; adSetId?: string }
) {
  // Get all ad accounts for this connection
  const accountsData = await db
    .select()
    .from(adAccounts)
    .where(
      filters?.adAccountId
        ? and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.metaAdAccountId, filters.adAccountId)
          )
        : eq(adAccounts.metaConnectionId, connectionId)
    );

  if (accountsData.length === 0) {
    return [];
  }

  const accountIds = accountsData.map((acc) => acc.id);

  // Get campaigns for these accounts (with optional campaign filter)
  const campaignsData = await db
    .select()
    .from(campaigns)
    .where(
      filters?.campaignId
        ? and(
            accountIds.length === 1
              ? eq(campaigns.adAccountId, accountIds[0])
              : inArray(campaigns.adAccountId, accountIds),
            eq(campaigns.metaCampaignId, filters.campaignId)
          )
        : accountIds.length === 1
        ? eq(campaigns.adAccountId, accountIds[0])
        : inArray(campaigns.adAccountId, accountIds)
    );

  if (campaignsData.length === 0) {
    return [];
  }

  const campaignIds = campaignsData.map((campaign) => campaign.id);

  // Get ad sets for these campaigns (with optional ad set filter)
  const adSetsData = await db
    .select()
    .from(adSets)
    .where(
      filters?.adSetId
        ? and(
            campaignIds.length === 1
              ? eq(adSets.campaignId, campaignIds[0])
              : inArray(adSets.campaignId, campaignIds),
            eq(adSets.metaAdSetId, filters.adSetId)
          )
        : campaignIds.length === 1
        ? eq(adSets.campaignId, campaignIds[0])
        : inArray(adSets.campaignId, campaignIds)
    );

  if (adSetsData.length === 0) {
    return [];
  }

  const adSetIds = adSetsData.map((adSet) => adSet.id);

  // Fetch ads with their relationships
  const adsData = await db.query.ads.findMany({
    where:
      adSetIds.length === 1
        ? eq(ads.adSetId, adSetIds[0])
        : inArray(ads.adSetId, adSetIds),
    with: {
      adSet: {
        with: {
          campaign: true,
        },
      },
    },
  });

  return adsData;
}

/**
 * Creates or updates a Meta connection record in the database
 * @param params - Connection parameters including userId, tokens, and user info
 * @returns Success/error result
 */
export async function createOrUpdateMetaConnection(params: {
  userId: string;
  metaUserId: string;
  metaUserName?: string;
  metaEmail?: string;
  accessToken: string;
  grantedScopes: string[];
}) {
  try {
    await db
      .insert(metaConnections)
      .values({
        userId: params.userId,
        metaUserId: params.metaUserId,
        metaUserName: params.metaUserName || null,
        metaEmail: params.metaEmail || null,
        accessToken: params.accessToken,
        grantedScopes: params.grantedScopes,
        status: 'active'
      })
      .onConflictDoUpdate({
        target: [metaConnections.userId, metaConnections.metaUserId],
        set: {
          accessToken: params.accessToken,
          grantedScopes: params.grantedScopes,
          status: 'active',
          updatedAt: new Date()
        }
      });

    return { success: true };
  } catch (error) {
    console.error('Error creating meta connection:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetches ad accounts from Meta API using the access token
 * @param connectionId - The Meta connection ID
 * @param accessToken - Meta access token
 * @returns Array of ad accounts or error
 */
export async function fetchMetaAdAccounts(connectionId: string, accessToken: string) {
  try {
    const client = new MetaAdsClient(accessToken);
    const accounts = await client.getAdAccounts();
    return { success: true, accounts };
  } catch (error) {
    console.error('Error fetching Meta ad accounts:', error);
    return { success: false, error: String(error), accounts: [] };
  }
}

/**
 * Loads ad accounts for the current user
 * Server action that handles authentication and Meta API calls
 * @returns Array of ad accounts or error
 */
export async function loadUserAdAccounts() {
  // Data Access Layer auth guard
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error, accounts: [] };
  }

  try {
    const connection = await getMetaConnection(auth.user.id);
    if (!connection) {
      return { success: false, error: 'No Meta connection found', accounts: [], needsAuth: true };
    }

    const client = new MetaAdsClient(connection.accessToken);
    const accounts = await client.getAdAccounts();

    if (accounts.length === 0) {
      return { success: false, error: 'No ad accounts found', accounts: [] };
    }

    return { success: true, accounts, connectionId: connection.id };
  } catch (error) {
    console.error('Error loading ad accounts:', error);
    const errorMessage = String(error);

    // Check if the error is related to expired or invalid access token
    const isTokenExpired = errorMessage.includes('Session has expired') ||
                          errorMessage.includes('Error validating access token') ||
                          errorMessage.includes('OAuthException');

    return {
      success: false,
      error: errorMessage,
      accounts: [],
      needsAuth: isTokenExpired
    };
  }
}

/**
 * Saves selected ad accounts to the database
 * @param params - Selected account information
 * @returns Success/error result with saved accounts
 */
export async function saveSelectedAdAccounts(params: {
  connectionId: string;
  selectedAccountIds: string[];
  accounts: Array<{
    id: string;
    name: string;
    currency: string;
    accountId: string;
  }>;
}) {
  try {
    const savedAccounts = [];

    for (const account of params.accounts) {
      if (params.selectedAccountIds.includes(account.id)) {
        const [savedAccount] = await db
          .insert(adAccounts)
          .values({
            metaConnectionId: params.connectionId,
            metaAdAccountId: account.id,
            name: account.name,
            currency: account.currency,
            accountStatus: 1, // ACTIVE
            lastSyncedAt: new Date()
          })
          .onConflictDoUpdate({
            target: [adAccounts.metaConnectionId, adAccounts.metaAdAccountId],
            set: {
              name: account.name,
              currency: account.currency,
              lastSyncedAt: new Date(),
              updatedAt: new Date()
            }
          })
          .returning();

        savedAccounts.push(savedAccount);
      }
    }

    // Set first account as selected
    if (savedAccounts.length > 0) {
      const [connection] = await db
        .select()
        .from(metaConnections)
        .where(eq(metaConnections.id, params.connectionId))
        .limit(1);

      if (connection) {
        await setUserSelectedAdAccount(savedAccounts[0].id, connection.userId);
      }
    }

    return { success: true, savedAccounts };
  } catch (error) {
    console.error('Error saving ad accounts:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Saves selected ad accounts for the current user
 * Server action that handles authentication and database operations
 * @param params - Selected account IDs and account data
 * @returns Success/error result
 */
export async function saveUserSelectedAdAccounts(params: {
  selectedAccountIds: string[];
  accounts: Array<{
    id: string;
    name: string;
    currency: string;
    accountId: string;
  }>;
}) {
  // Data Access Layer auth guard
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  try {
    const connection = await getMetaConnection(auth.user.id);
    if (!connection) {
      return { success: false, error: 'No Meta connection found' };
    }

    return await saveSelectedAdAccounts({
      connectionId: connection.id,
      selectedAccountIds: params.selectedAccountIds,
      accounts: params.accounts
    });
  } catch (error) {
    console.error('Error saving selected ad accounts:', error);
    return { success: false, error: String(error) };
  }
}