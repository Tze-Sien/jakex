ALTER TABLE "ad_accounts" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;