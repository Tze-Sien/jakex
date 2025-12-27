ALTER TABLE "insights" ADD COLUMN "entity_name" text;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "entity_status" text;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "campaign_objective" text;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "campaign_daily_budget" bigint;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "campaign_lifetime_budget" bigint;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_set_optimization_goal" text;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_set_bid_strategy" text;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_set_daily_budget" bigint;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_set_lifetime_budget" bigint;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_set_targeting" jsonb;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_creative_type" text;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_headline" text;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_body_text" text;--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "ad_call_to_action" text;