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
      .references(() => adAccounts.id, { onDelete: "cascade" }),
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
      .references(() => campaigns.id, { onDelete: "cascade" }),
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
      .references(() => adSets.id, { onDelete: "cascade" }),
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

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  adAccountId: uuid("ad_account_id")
    .notNull()
    .references(() => adAccounts.id, { onDelete: "cascade" }),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insights = pgTable(
  "insights",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    campaignId: uuid("campaign_id").references(() => campaigns.id, {
      onDelete: "cascade",
    }),
    adSetId: uuid("ad_set_id").references(() => adSets.id, {
      onDelete: "cascade",
    }),
    adId: uuid("ad_id").references(() => ads.id, { onDelete: "cascade" }),
    timeRange: text("time_range").notNull(),
    dateStart: date("date_start").notNull(),
    dateEnd: date("date_end").notNull(),

    // Snapshot: Entity metadata at time of report
    entityName: text("entity_name"),
    entityStatus: text("entity_status"),

    // Snapshot: Campaign-specific fields
    campaignObjective: text("campaign_objective"),
    campaignDailyBudget: bigint("campaign_daily_budget", { mode: "number" }),
    campaignLifetimeBudget: bigint("campaign_lifetime_budget", {
      mode: "number",
    }),

    // Snapshot: AdSet-specific fields
    adSetOptimizationGoal: text("ad_set_optimization_goal"),
    adSetBidStrategy: text("ad_set_bid_strategy"),
    adSetDailyBudget: bigint("ad_set_daily_budget", { mode: "number" }),
    adSetLifetimeBudget: bigint("ad_set_lifetime_budget", { mode: "number" }),
    adSetTargeting: jsonb("ad_set_targeting"),

    // Snapshot: Ad-specific fields
    adCreativeType: text("ad_creative_type"),
    adHeadline: text("ad_headline"),
    adBodyText: text("ad_body_text"),
    adCallToAction: text("ad_call_to_action"),

    // Performance metrics
    spend: bigint("spend", { mode: "number" }).notNull().default(0),
    impressions: bigint("impressions", { mode: "number" })
      .notNull()
      .default(0),
    clicks: bigint("clicks", { mode: "number" }).notNull().default(0),
    ctr: decimal("ctr", { precision: 10, scale: 6 }),
    cpc: bigint("cpc", { mode: "number" }),
    cpm: bigint("cpm", { mode: "number" }),
    conversions: bigint("conversions", { mode: "number" })
      .notNull()
      .default(0),
    costPerConversion: bigint("cost_per_conversion", { mode: "number" }),
    roas: decimal("roas", { precision: 10, scale: 4 }),
  },
  (t) => [
    uniqueIndex("insights_report_id_campaign_id_time_range_idx").on(
      t.reportId,
      t.campaignId,
      t.timeRange
    ),
    uniqueIndex("insights_report_id_ad_set_id_time_range_idx").on(
      t.reportId,
      t.adSetId,
      t.timeRange
    ),
    uniqueIndex("insights_report_id_ad_id_time_range_idx").on(
      t.reportId,
      t.adId,
      t.timeRange
    ),
  ]
);

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

export const aiAnalyses = pgTable(
  "ai_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    // Analysis content
    overallAssessment: text("overall_assessment").notNull(),
    keyFindings: jsonb("key_findings").notNull(), // Array of strings
    performanceAnalysis: text("performance_analysis").notNull(),
    creativeAnalysis: text("creative_analysis"),
    targetingAnalysis: text("targeting_analysis"),
    practicalAdvice: text("practical_advice"), // 经验谈 - Colloquial practical advice in 白话文
    recommendations: jsonb("recommendations").notNull(), // Array of Recommendation objects
    confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),

    // Metadata
    llmProvider: text("llm_provider").notNull(), // 'groq' | 'gemini'
    llmModel: text("llm_model").notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    latencyMs: integer("latency_ms"),
    costUsd: decimal("cost_usd", { precision: 10, scale: 6 }),

    status: text("status").notNull().default("completed"), // 'completed' | 'failed'
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("ai_analyses_report_id_idx").on(t.reportId),
    index("ai_analyses_user_id_idx").on(t.userId),
    index("ai_analyses_created_at_idx").on(t.createdAt),
  ]
);

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
export type Report = typeof reports.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;
