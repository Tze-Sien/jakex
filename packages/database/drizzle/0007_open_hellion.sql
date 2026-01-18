CREATE TABLE "daily_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"campaign_id" uuid,
	"ad_set_id" uuid,
	"ad_id" uuid,
	"meta_entity_id" text NOT NULL,
	"entity_level" text NOT NULL,
	"date" date NOT NULL,
	"spend" bigint DEFAULT 0 NOT NULL,
	"impressions" bigint DEFAULT 0 NOT NULL,
	"clicks" bigint DEFAULT 0 NOT NULL,
	"reach" bigint DEFAULT 0,
	"conversions" bigint DEFAULT 0 NOT NULL,
	"conversion_value" bigint DEFAULT 0,
	"ctr" numeric(10, 6),
	"cpc" bigint,
	"cpm" bigint,
	"cost_per_conversion" bigint,
	"raw_actions" jsonb,
	"raw_action_values" jsonb,
	"metrics_hash" text NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insights_sync_state" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"oldest_synced_date" date,
	"newest_synced_date" date,
	"initial_sync_completed" boolean DEFAULT false,
	"initial_sync_started_at" timestamp with time zone,
	"initial_sync_completed_at" timestamp with time zone,
	"last_incremental_sync_at" timestamp with time zone,
	"consecutive_failures" integer DEFAULT 0,
	"last_error_message" text,
	"last_error_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "insights_sync_state_ad_account_id_unique" UNIQUE("ad_account_id")
);
--> statement-breakpoint
ALTER TABLE "ai_analyses" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "insights" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reports" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "ai_analyses" CASCADE;--> statement-breakpoint
DROP TABLE "insights" CASCADE;--> statement-breakpoint
DROP TABLE "reports" CASCADE;--> statement-breakpoint
ALTER TABLE "ad_sets" DROP CONSTRAINT "ad_sets_campaign_id_campaigns_id_fk";
--> statement-breakpoint
ALTER TABLE "ads" DROP CONSTRAINT "ads_ad_set_id_ad_sets_id_fk";
--> statement-breakpoint
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_ad_account_id_ad_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "daily_insights" ADD CONSTRAINT "daily_insights_ad_account_id_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."ad_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_insights" ADD CONSTRAINT "daily_insights_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_insights" ADD CONSTRAINT "daily_insights_ad_set_id_ad_sets_id_fk" FOREIGN KEY ("ad_set_id") REFERENCES "public"."ad_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_insights" ADD CONSTRAINT "daily_insights_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights_sync_state" ADD CONSTRAINT "insights_sync_state_ad_account_id_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."ad_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_insights_entity_date_idx" ON "daily_insights" USING btree ("ad_account_id","meta_entity_id","date");--> statement-breakpoint
CREATE INDEX "daily_insights_account_date_idx" ON "daily_insights" USING btree ("ad_account_id","date");--> statement-breakpoint
CREATE INDEX "daily_insights_account_level_date_idx" ON "daily_insights" USING btree ("ad_account_id","entity_level","date");--> statement-breakpoint
CREATE INDEX "daily_insights_campaign_date_idx" ON "daily_insights" USING btree ("campaign_id","date");--> statement-breakpoint
CREATE INDEX "daily_insights_adset_date_idx" ON "daily_insights" USING btree ("ad_set_id","date");--> statement-breakpoint
CREATE INDEX "daily_insights_ad_date_idx" ON "daily_insights" USING btree ("ad_id","date");--> statement-breakpoint
ALTER TABLE "ad_sets" ADD CONSTRAINT "ad_sets_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_ad_set_id_ad_sets_id_fk" FOREIGN KEY ("ad_set_id") REFERENCES "public"."ad_sets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ad_account_id_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."ad_accounts"("id") ON DELETE restrict ON UPDATE no action;