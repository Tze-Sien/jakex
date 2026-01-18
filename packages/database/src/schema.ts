import {
  pgTable,
  uuid,
  text,
  timestamp,
  bigint,
  jsonb,
  date,
  integer,
  decimal,
  uniqueIndex,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // Same as auth.users.id from Supabase
  email: text("email"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  status: text("status").default("active").notNull(), // 'active' | 'deactivated' | 'archived'
  archivedAt: timestamp("archived_at", { withTimezone: true }), // When the account was archived/deleted
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const metaConnections = pgTable(
  "meta_connections",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    metaUserId: text("meta_user_id").notNull(),
    metaUserName: text("meta_user_name"),
    metaEmail: text("meta_email"),
    accessToken: text("access_token").notNull(),
    grantedScopes: text("granted_scopes").array().notNull(),
    status: text("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("meta_connections_user_id_meta_user_id_idx").on(
      t.userId,
      t.metaUserId
    ),
  ]
);

export const adAccounts = pgTable(
  "ad_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    metaConnectionId: uuid("meta_connection_id")
      .notNull()
      .references(() => metaConnections.id, { onDelete: "cascade" }),
    metaAdAccountId: text("meta_ad_account_id").notNull(),
    name: text("name"),
    currency: text("currency"),
    timezone: text("timezone"),
    accountStatus: integer("account_status"),
    isActive: boolean("is_active").default(true).notNull(), // User can deactivate accounts in settings
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("ad_accounts_connection_id_account_id_idx").on(
      t.metaConnectionId,
      t.metaAdAccountId
    ),
  ]
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    adAccountId: uuid("ad_account_id")
      .notNull()
      .references(() => adAccounts.id, { onDelete: "restrict" }),
    metaCampaignId: text("meta_campaign_id").notNull(),
    name: text("name"),
    objective: text("objective"),
    status: text("status"),
    dailyBudget: bigint("daily_budget", { mode: "number" }),
    lifetimeBudget: bigint("lifetime_budget", { mode: "number" }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("campaigns_account_id_campaign_id_idx").on(
      t.adAccountId,
      t.metaCampaignId
    ),
  ]
);

export const adSets = pgTable(
  "ad_sets",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "restrict" }),
    metaAdSetId: text("meta_ad_set_id").notNull(),
    name: text("name"),
    status: text("status"),
    dailyBudget: bigint("daily_budget", { mode: "number" }),
    lifetimeBudget: bigint("lifetime_budget", { mode: "number" }),
    optimizationGoal: text("optimization_goal"),
    bidStrategy: text("bid_strategy"),
    targeting: jsonb("targeting"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("ad_sets_campaign_id_ad_set_id_idx").on(
      t.campaignId,
      t.metaAdSetId
    ),
  ]
);

export const ads = pgTable(
  "ads",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    adSetId: uuid("ad_set_id")
      .notNull()
      .references(() => adSets.id, { onDelete: "restrict" }),
    metaAdId: text("meta_ad_id").notNull(),
    name: text("name"),
    status: text("status"),
    creativeType: text("creative_type"),
    thumbnailUrl: text("thumbnail_url"),
    headline: text("headline"),
    bodyText: text("body_text"),
    callToAction: text("call_to_action"),
    destinationUrl: text("destination_url"),
    creativeMeta: jsonb("creative_meta"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("ads_ad_set_id_ad_id_idx").on(
      t.adSetId,
      t.metaAdId
    ),
    index("ads_ad_set_id_status_idx").on(t.adSetId, t.status),
  ]
);

export const userSelectedAdAccount = pgTable(
  "user_selected_ad_account",
  {
    userId: uuid("user_id")
      .primaryKey()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    adAccountId: uuid("ad_account_id")
      .notNull()
      .references(() => adAccounts.id, { onDelete: "cascade" }),
    selectedAt: timestamp("selected_at", { withTimezone: true }).defaultNow(),
  }
);

export const dailyInsights = pgTable(
  "daily_insights",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),

    // Account reference (required - all insights belong to an account)
    adAccountId: uuid("ad_account_id")
      .notNull()
      .references(() => adAccounts.id, { onDelete: "restrict" }),

    // Entity references (polymorphic - only one should be set based on entityLevel)
    // If all are null, this is account-level insight
    campaignId: uuid("campaign_id").references(() => campaigns.id, {
      onDelete: "cascade",
    }),
    adSetId: uuid("ad_set_id").references(() => adSets.id, {
      onDelete: "cascade",
    }),
    adId: uuid("ad_id").references(() => ads.id, { onDelete: "cascade" }),

    // Meta entity identification
    metaEntityId: text("meta_entity_id").notNull(), // act_xxx, campaign_id, adset_id, or ad_id
    entityLevel: text("entity_level").notNull(), // 'account' | 'campaign' | 'adset' | 'ad'

    // Daily granularity (single day - YYYY-MM-DD)
    date: date("date").notNull(),

    // Core performance metrics (stored as integers - spend in cents)
    spend: bigint("spend", { mode: "number" }).notNull().default(0),
    impressions: bigint("impressions", { mode: "number" }).notNull().default(0),
    clicks: bigint("clicks", { mode: "number" }).notNull().default(0),
    reach: bigint("reach", { mode: "number" }).default(0),

    // Conversion metrics
    conversions: bigint("conversions", { mode: "number" }).notNull().default(0),
    conversionValue: bigint("conversion_value", { mode: "number" }).default(0), // For ROAS calculation

    // Pre-calculated derived metrics (for query convenience)
    ctr: decimal("ctr", { precision: 10, scale: 6 }), // clicks/impressions * 100
    cpc: bigint("cpc", { mode: "number" }), // spend/clicks in cents
    cpm: bigint("cpm", { mode: "number" }), // (spend/impressions) * 1000 in cents
    costPerConversion: bigint("cost_per_conversion", { mode: "number" }),

    // Raw API response for detailed breakdowns (actions, action_values, etc.)
    rawActions: jsonb("raw_actions"),
    rawActionValues: jsonb("raw_action_values"),

    // Deduplication hash (MD5 of spend|impressions|clicks|conversions|conversionValue)
    metricsHash: text("metrics_hash").notNull(),

    // Sync metadata
    syncedAt: timestamp("synced_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // Primary deduplication index - ensures one row per entity per day
    uniqueIndex("daily_insights_entity_date_idx").on(
      t.adAccountId,
      t.metaEntityId,
      t.date
    ),
    // Query by account + date range (most common query pattern)
    index("daily_insights_account_date_idx").on(t.adAccountId, t.date),
    // Query by entity level within account
    index("daily_insights_account_level_date_idx").on(
      t.adAccountId,
      t.entityLevel,
      t.date
    ),
    // Query specific entity's daily data
    index("daily_insights_campaign_date_idx").on(t.campaignId, t.date),
    index("daily_insights_adset_date_idx").on(t.adSetId, t.date),
    index("daily_insights_ad_date_idx").on(t.adId, t.date),
  ]
);

// =============================================================================
// INSIGHTS SYNC STATE - Track sync progress per ad account
// =============================================================================

export const insightsSyncState = pgTable("insights_sync_state", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  adAccountId: uuid("ad_account_id")
    .notNull()
    .unique()
    .references(() => adAccounts.id, { onDelete: "cascade" }),

  // Sync window tracking
  oldestSyncedDate: date("oldest_synced_date"), // Oldest date we have data for
  newestSyncedDate: date("newest_synced_date"), // Most recent date synced

  // Full sync tracking
  initialSyncCompleted: boolean("initial_sync_completed").default(false),
  initialSyncStartedAt: timestamp("initial_sync_started_at", {
    withTimezone: true,
  }),
  initialSyncCompletedAt: timestamp("initial_sync_completed_at", {
    withTimezone: true,
  }),

  // Incremental sync tracking
  lastIncrementalSyncAt: timestamp("last_incremental_sync_at", {
    withTimezone: true,
  }),

  // Error tracking
  consecutiveFailures: integer("consecutive_failures").default(0),
  lastErrorMessage: text("last_error_message"),
  lastErrorAt: timestamp("last_error_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const syncJobs = pgTable(
  "sync_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    metaConnectionId: uuid("meta_connection_id")
      .notNull()
      .references(() => metaConnections.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'full' | 'incremental' | 'manual'
    entityType: text("entity_type"), // 'adAccounts' | 'campaigns' | 'adSets' | 'ads' | 'insights'
    adAccountId: text("ad_account_id"), // META ad account ID being synced
    status: text("status").notNull().default("pending"), // 'pending' | 'running' | 'completed' | 'failed'
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    totalSynced: integer("total_synced").default(0),
    totalErrors: integer("total_errors").default(0),
    errorMessage: text("error_message"),
    errorDetails: jsonb("error_details"), // Array of error messages
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("sync_jobs_connection_id_idx").on(t.metaConnectionId),
    index("sync_jobs_status_idx").on(t.status),
    index("sync_jobs_created_at_idx").on(t.createdAt),
  ]
);

// =============================================================================
// REMOVED TABLES - For future reference
// =============================================================================
//
// The following tables were removed in favor of the new dailyInsights architecture:
//
// 1. `reports` table (REMOVED):
//    - Was a container for each sync operation
//    - Fields: id, userId, adAccountId, status, createdAt, updatedAt
//    - One report was created per sync, insights were linked to it
//    - Problem: Unbounded growth, no deduplication
//
// 2. `insights` table (REMOVED):
//    - Stored aggregated metrics per entity per time_range ('today', 'last_3d', 'last_7d')
//    - Fields: reportId, campaignId, adSetId, adId, timeRange, dateStart, dateEnd,
//              entityName, entityStatus, campaign/adSet/ad metadata snapshots,
//              spend, impressions, clicks, ctr, cpc, cpm, conversions, costPerConversion, roas
//    - Problem: Redundant data (last_7d includes last_3d data), inflexible date ranges
//
// 3. `ai_analyses` table (REMOVED):
//    - Stored LLM-generated analysis of ad performance
//    - Fields: reportId (FK to reports), userId, overallAssessment, keyFindings (jsonb array),
//              performanceAnalysis, creativeAnalysis, targetingAnalysis,
//              practicalAdvice (经验谈 - colloquial advice in 白话文),
//              recommendations (jsonb array of {priority, action, expectedImpact, reasoning}),
//              confidenceScore, llmProvider ('groq'|'gemini'), llmModel,
//              inputTokens, outputTokens, latencyMs, costUsd, status, errorMessage
//    - TODO: Redesign to link to adAccountId + dateRange instead of reportId
//
// =============================================================================

// Relations
export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  adAccount: one(adAccounts, {
    fields: [campaigns.adAccountId],
    references: [adAccounts.id],
  }),
  adSets: many(adSets),
}));

export const adSetsRelations = relations(adSets, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [adSets.campaignId],
    references: [campaigns.id],
  }),
  ads: many(ads),
}));

export const adsRelations = relations(ads, ({ one }) => ({
  adSet: one(adSets, {
    fields: [ads.adSetId],
    references: [adSets.id],
  }),
}));

// Inferred types for queries
export type Profile = typeof profiles.$inferSelect;
export type AdAccount = typeof adAccounts.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type AdSet = typeof adSets.$inferSelect;
export type Ad = typeof ads.$inferSelect;
export type MetaConnection = typeof metaConnections.$inferSelect;
export type UserSelectedAdAccount = typeof userSelectedAdAccount.$inferSelect;
export type SyncJob = typeof syncJobs.$inferSelect;
export type DailyInsight = typeof dailyInsights.$inferSelect;
export type InsightsSyncState = typeof insightsSyncState.$inferSelect;

// Insert types
export type NewDailyInsight = typeof dailyInsights.$inferInsert;
