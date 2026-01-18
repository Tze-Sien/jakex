CREATE TABLE "user_dashboard_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"selected_account_ids" uuid[] DEFAULT '{}',
	"visible_metrics" text[] DEFAULT '{"spend","conversions","cpc","ctr"}',
	"default_period" text DEFAULT 'last_7_days',
	"comparison_enabled" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_dashboard_preferences" ADD CONSTRAINT "user_dashboard_preferences_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_dashboard_preferences_user_id_idx" ON "user_dashboard_preferences" USING btree ("user_id");