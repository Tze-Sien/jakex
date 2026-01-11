CREATE TABLE "ad_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meta_connection_id" uuid NOT NULL,
	"meta_ad_account_id" text NOT NULL,
	"name" text,
	"currency" text,
	"timezone" text,
	"account_status" integer,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ad_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"meta_ad_set_id" text NOT NULL,
	"name" text,
	"status" text,
	"daily_budget" bigint,
	"lifetime_budget" bigint,
	"optimization_goal" text,
	"bid_strategy" text,
	"targeting" jsonb,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_set_id" uuid NOT NULL,
	"meta_ad_id" text NOT NULL,
	"name" text,
	"status" text,
	"creative_type" text,
	"thumbnail_url" text,
	"headline" text,
	"body_text" text,
	"call_to_action" text,
	"destination_url" text,
	"creative_meta" jsonb,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"meta_campaign_id" text NOT NULL,
	"name" text,
	"objective" text,
	"status" text,
	"daily_budget" bigint,
	"lifetime_budget" bigint,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"campaign_id" uuid,
	"ad_set_id" uuid,
	"ad_id" uuid,
	"time_range" text NOT NULL,
	"date_start" date NOT NULL,
	"date_end" date NOT NULL,
	"spend" bigint DEFAULT 0 NOT NULL,
	"impressions" bigint DEFAULT 0 NOT NULL,
	"clicks" bigint DEFAULT 0 NOT NULL,
	"ctr" numeric(10, 6),
	"cpc" bigint,
	"cpm" bigint,
	"conversions" bigint DEFAULT 0 NOT NULL,
	"cost_per_conversion" bigint,
	"roas" numeric(10, 4)
);
--> statement-breakpoint
CREATE TABLE "meta_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meta_user_id" text NOT NULL,
	"meta_user_name" text,
	"meta_email" text,
	"access_token" text NOT NULL,
	"granted_scopes" text[] NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_selected_ad_account" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"ad_account_id" uuid NOT NULL,
	"selected_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ad_accounts" ADD CONSTRAINT "ad_accounts_meta_connection_id_meta_connections_id_fk" FOREIGN KEY ("meta_connection_id") REFERENCES "public"."meta_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD CONSTRAINT "ad_sets_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_ad_set_id_ad_sets_id_fk" FOREIGN KEY ("ad_set_id") REFERENCES "public"."ad_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ad_account_id_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."ad_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_ad_set_id_ad_sets_id_fk" FOREIGN KEY ("ad_set_id") REFERENCES "public"."ad_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_connections" ADD CONSTRAINT "meta_connections_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_ad_account_id_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."ad_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_selected_ad_account" ADD CONSTRAINT "user_selected_ad_account_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_selected_ad_account" ADD CONSTRAINT "user_selected_ad_account_ad_account_id_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."ad_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ad_accounts_connection_id_account_id_idx" ON "ad_accounts" USING btree ("meta_connection_id","meta_ad_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ad_sets_campaign_id_ad_set_id_idx" ON "ad_sets" USING btree ("campaign_id","meta_ad_set_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ads_ad_set_id_ad_id_idx" ON "ads" USING btree ("ad_set_id","meta_ad_id");--> statement-breakpoint
CREATE INDEX "ads_ad_set_id_status_idx" ON "ads" USING btree ("ad_set_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "campaigns_account_id_campaign_id_idx" ON "campaigns" USING btree ("ad_account_id","meta_campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "insights_report_id_campaign_id_time_range_idx" ON "insights" USING btree ("report_id","campaign_id","time_range");--> statement-breakpoint
CREATE UNIQUE INDEX "insights_report_id_ad_set_id_time_range_idx" ON "insights" USING btree ("report_id","ad_set_id","time_range");--> statement-breakpoint
CREATE UNIQUE INDEX "insights_report_id_ad_id_time_range_idx" ON "insights" USING btree ("report_id","ad_id","time_range");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_connections_user_id_meta_user_id_idx" ON "meta_connections" USING btree ("user_id","meta_user_id");