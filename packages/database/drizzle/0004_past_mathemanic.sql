CREATE TABLE "ai_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"overall_assessment" text NOT NULL,
	"key_findings" jsonb NOT NULL,
	"performance_analysis" text NOT NULL,
	"creative_analysis" text,
	"targeting_analysis" text,
	"recommendations" jsonb NOT NULL,
	"confidence_score" numeric(3, 2),
	"llm_provider" text NOT NULL,
	"llm_model" text NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"latency_ms" integer,
	"cost_usd" numeric(10, 6),
	"status" text DEFAULT 'completed' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_analyses_report_id_idx" ON "ai_analyses" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "ai_analyses_user_id_idx" ON "ai_analyses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_analyses_created_at_idx" ON "ai_analyses" USING btree ("created_at");