"use server";

import { db } from "@repo/database";
import { metaConnections, adAccounts, ads, campaigns, adSets, userSelectedAdAccount } from "@repo/database/schema";
import { eq, and, inArray } from "drizzle-orm";
import { withAuth } from "@repo/auth/server";
import { MetaAdsClient } from "@repo/meta-api";
import { revalidatePath } from "next/cache";


/**
 * Gets the META connection for a user
 * @param userId - The user's ID (same as Supabase auth.users.id)
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
 * Gets the first active ad account for a connection (fallback when no selection exists)
 * @param connectionId - The META connection ID
 * @returns The first active ad account or null
 */
export async function getFirstAdAccount(connectionId: string) {
  const accounts = await db
    .select()
    .from(adAccounts)
    .where(
      and(
        eq(adAccounts.metaConnectionId, connectionId),
        eq(adAccounts.isActive, true)
      )
    )
    .limit(1);

  return accounts[0] || null;
}

/**
 * Sets the user's selected ad account and persists it to the database
 * @param adAccountId - The ad account ID to select
 * @returns Success/error result
 */
export async function setUserSelectedAdAccount(adAccountId: string) {
  try {
    // Get the current user (profile.id = auth.users.id)
    const auth = await withAuth();
    if (!auth.success) {
      return { success: false, error: auth.error };
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
        userId: auth.user.id,
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
 * @returns The selected ad account ID or null
 */
export async function getUserSelectedAdAccount() {
  try {
    // Get the current user (profile.id = auth.users.id)
    const auth = await withAuth();
    if (!auth.success) {
      return { success: false, error: auth.error, selectedAccountId: null };
    }

    const selected = await db.query.userSelectedAdAccount.findFirst({
      where: eq(userSelectedAdAccount.userId, auth.user.id),
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
 * Gets active ad accounts from the database for a specific connection
 * @param connectionId - The META connection ID
 * @param includeInactive - Include inactive accounts (default: false)
 * @returns Array of ad accounts
 */
export async function getAdAccountsFromDatabase(connectionId: string, includeInactive: boolean = false) {
  const accountsData = await db
    .select()
    .from(adAccounts)
    .where(
      includeInactive
        ? eq(adAccounts.metaConnectionId, connectionId)
        : and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.isActive, true)
          )
    );

  return accountsData;
}

/**
 * Gets campaigns from the database for a specific ad account
 * Only returns campaigns from active ad accounts
 * @param connectionId - The META connection ID
 * @param filters - Optional filters
 * @param filters.adAccountId - Filter by META ad account ID
 * @returns Array of campaigns
 */
export async function getCampaignsFromDatabase(
  connectionId: string,
  filters?: { adAccountId?: string }
) {
  // Get all active ad accounts for this connection
  const accountsData = await db
    .select()
    .from(adAccounts)
    .where(
      filters?.adAccountId
        ? and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.metaAdAccountId, filters.adAccountId),
            eq(adAccounts.isActive, true)
          )
        : and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.isActive, true)
          )
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
 * Only returns ad sets from active ad accounts
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
  // Get all active ad accounts for this connection
  const accountsData = await db
    .select()
    .from(adAccounts)
    .where(
      filters?.adAccountId
        ? and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.metaAdAccountId, filters.adAccountId),
            eq(adAccounts.isActive, true)
          )
        : and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.isActive, true)
          )
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
 * Only returns ads from active ad accounts
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
  // Get all active ad accounts for this connection
  const accountsData = await db
    .select()
    .from(adAccounts)
    .where(
      filters?.adAccountId
        ? and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.metaAdAccountId, filters.adAccountId),
            eq(adAccounts.isActive, true)
          )
        : and(
            eq(adAccounts.metaConnectionId, connectionId),
            eq(adAccounts.isActive, true)
          )
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
 * @param params - Connection parameters including supabaseUserId, tokens, and user info
 * @returns Success/error result
 */
export async function createOrUpdateMetaConnection(params: {
  userId: string; // This is the Supabase user ID (auth.users.id)
  metaUserId: string;
  metaUserName?: string;
  metaEmail?: string;
  accessToken: string;
  grantedScopes: string[];
}) {
  try {
    // profile.id = auth.users.id
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
            metaAdAccountId: account.accountId, // Use accountId (without act_ prefix) for consistency with syncAdAccountsFromMeta
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
        await setUserSelectedAdAccount(savedAccounts[0].id);
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

/**
 * Updates the activation status of ad accounts
 * @param accountUpdates - Array of {id, isActive} objects
 * @returns Success/error result
 */
export async function updateAdAccountsActivation(
  accountUpdates: Array<{ id: string; isActive: boolean }>
) {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  try {
    // profile.id = auth.users.id
    const connection = await getMetaConnection(auth.user.id);
    if (!connection) {
      return { success: false, error: 'No Meta connection found' };
    }

    // Update each account's activation status
    for (const update of accountUpdates) {
      await db
        .update(adAccounts)
        .set({
          isActive: update.isActive,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(adAccounts.id, update.id),
            eq(adAccounts.metaConnectionId, connection.id)
          )
        );
    }

    // If the currently selected account was deactivated, select the first active account
    const selectedResult = await getUserSelectedAdAccount();
    if (selectedResult.success && selectedResult.selectedAccountId) {
      const currentSelected = await db.query.adAccounts.findFirst({
        where: eq(adAccounts.id, selectedResult.selectedAccountId),
      });

      if (currentSelected && !currentSelected.isActive) {
        // Find first active account
        const activeAccounts = await db
          .select()
          .from(adAccounts)
          .where(
            and(
              eq(adAccounts.metaConnectionId, connection.id),
              eq(adAccounts.isActive, true)
            )
          )
          .limit(1);

        if (activeAccounts.length > 0) {
          await setUserSelectedAdAccount(activeAccounts[0].id);
        }
      }
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error updating ad account activation:', error);
    return { success: false, error: 'Failed to update ad account activation' };
  }
}

/**
 * Disconnects the user's Meta account
 * Sets status to 'revoked' but keeps all data
 * @returns Success/error result
 */
export async function disconnectMetaAccount() {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  try {
    const connection = await getMetaConnection(auth.user.id);
    if (!connection) {
      return { success: false, error: 'No Meta connection found' };
    }

    // Update connection status to revoked
    await db
      .update(metaConnections)
      .set({
        status: 'revoked',
        updatedAt: new Date(),
      })
      .where(eq(metaConnections.id, connection.id));

    revalidatePath('/settings');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Meta account:', error);
    return { success: false, error: 'Failed to disconnect Meta account' };
  }
}

/**
 * Reconnects a previously disconnected Meta account
 * Sets status back to 'active'
 * @returns Success/error result
 */
export async function reconnectMetaAccount() {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  try {
    // profile.id = auth.users.id
    // Find revoked connection
    const connections = await db
      .select()
      .from(metaConnections)
      .where(
        and(
          eq(metaConnections.userId, auth.user.id),
          eq(metaConnections.status, 'revoked')
        )
      )
      .limit(1);

    if (connections.length === 0) {
      return { success: false, error: 'No disconnected Meta account found' };
    }

    const connection = connections[0];

    // Reactivate the connection
    await db
      .update(metaConnections)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(metaConnections.id, connection.id));

    revalidatePath('/settings');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error reconnecting Meta account:', error);
    return { success: false, error: 'Failed to reconnect Meta account' };
  }
}

/**
 * Gets all ad accounts for the current user's Meta connection
 * Includes both active and inactive accounts
 * @returns Success/error result with accounts array
 */
export async function getAllUserAdAccounts() {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error, accounts: [] };
  }

  try {
    const connection = await getMetaConnection(auth.user.id);
    if (!connection) {
      return { success: false, error: 'No Meta connection found', accounts: [], needsConnection: true };
    }

    const accounts = await db
      .select()
      .from(adAccounts)
      .where(eq(adAccounts.metaConnectionId, connection.id));

    return { success: true, accounts, connectionId: connection.id };
  } catch (error) {
    console.error('Error fetching ad accounts:', error);
    return { success: false, error: 'Failed to fetch ad accounts', accounts: [] };
  }
}

/**
 * Gets paginated ad accounts for the current user's Meta connection
 * Supports search and pagination
 * @param params - Pagination and search parameters
 * @returns Success/error result with paginated accounts
 */
export async function getPaginatedAdAccounts(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error, accounts: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const search = params.search?.trim().toLowerCase() || '';

  try {
    const connection = await getMetaConnection(auth.user.id);
    if (!connection) {
      return { success: false, error: 'No Meta connection found', accounts: [], total: 0, page, pageSize, totalPages: 0, needsConnection: true };
    }

    // Get all accounts for this connection
    const allAccounts = await db
      .select()
      .from(adAccounts)
      .where(eq(adAccounts.metaConnectionId, connection.id));

    // Filter by search if provided
    const filteredAccounts = search
      ? allAccounts.filter(acc =>
          acc.name?.toLowerCase().includes(search) ||
          acc.metaAdAccountId.toLowerCase().includes(search)
        )
      : allAccounts;

    // Calculate pagination
    const total = filteredAccounts.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedAccounts = filteredAccounts.slice(offset, offset + pageSize);

    return {
      success: true,
      accounts: paginatedAccounts,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching paginated ad accounts:', error);
    return { success: false, error: 'Failed to fetch ad accounts', accounts: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

/**
 * Syncs ad accounts from Meta API to database
 * Fetches latest accounts from Meta API and updates the database
 * @returns Success/error result with synced accounts
 */
export async function syncAdAccountsFromMeta() {
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error, accounts: [], newAccounts: [] };
  }

  try {
    const connection = await getMetaConnection(auth.user.id);
    if (!connection) {
      return { success: false, error: 'No Meta connection found', accounts: [], newAccounts: [], needsConnection: true };
    }

    // Fetch fresh accounts from Meta API
    const client = new MetaAdsClient(connection.accessToken);
    const apiAccounts = await client.getAdAccounts();

    if (apiAccounts.length === 0) {
      return { success: true, accounts: [], newAccounts: [], message: 'No ad accounts found in Meta' };
    }

    // Get existing accounts from database
    const existingAccounts = await db
      .select()
      .from(adAccounts)
      .where(eq(adAccounts.metaConnectionId, connection.id));

    const existingAccountIds = new Set(existingAccounts.map(a => a.metaAdAccountId));
    const newAccountIds: string[] = [];
    const syncedAccounts = [];

    // Sync all accounts from API to database
    for (const apiAccount of apiAccounts) {
      const isNew = !existingAccountIds.has(apiAccount.account_id);
      if (isNew) {
        newAccountIds.push(apiAccount.account_id);
      }

      // Find existing account to preserve isActive status
      const existingAccount = existingAccounts.find(a => a.metaAdAccountId === apiAccount.account_id);

      const [savedAccount] = await db
        .insert(adAccounts)
        .values({
          metaConnectionId: connection.id,
          metaAdAccountId: apiAccount.account_id,
          name: apiAccount.name,
          currency: apiAccount.currency,
          accountStatus: apiAccount.account_status,
          lastSyncedAt: new Date(),
          isActive: existingAccount?.isActive ?? false, // New accounts default to inactive, user must activate
        })
        .onConflictDoUpdate({
          target: [adAccounts.metaConnectionId, adAccounts.metaAdAccountId],
          set: {
            name: apiAccount.name,
            currency: apiAccount.currency,
            accountStatus: apiAccount.account_status,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          },
        })
        .returning();

      syncedAccounts.push(savedAccount);
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');

    return {
      success: true,
      accounts: syncedAccounts,
      newAccounts: newAccountIds,
      message: newAccountIds.length > 0
        ? `Synced ${syncedAccounts.length} accounts. ${newAccountIds.length} new account(s) found.`
        : `Synced ${syncedAccounts.length} accounts.`,
    };
  } catch (error) {
    console.error('Error syncing ad accounts from Meta:', error);
    const errorMessage = String(error);

    // Check if the error is related to expired or invalid access token
    const isTokenExpired = errorMessage.includes('Session has expired') ||
                          errorMessage.includes('Error validating access token') ||
                          errorMessage.includes('OAuthException');

    return {
      success: false,
      error: isTokenExpired ? 'Your Meta session has expired. Please reconnect your account.' : 'Failed to sync ad accounts from Meta',
      accounts: [],
      newAccounts: [],
      needsReconnect: isTokenExpired,
    };
  }
}