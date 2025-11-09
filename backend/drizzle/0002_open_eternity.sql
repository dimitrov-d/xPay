CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"user_wallet" text NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_endpoint_id_user_wallet_unique" UNIQUE("endpoint_id","user_wallet")
);
--> statement-breakpoint
ALTER TABLE "endpoints" ADD COLUMN "total_earnings" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_endpoint_id_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_wallet_users_wallet_address_fk" FOREIGN KEY ("user_wallet") REFERENCES "public"."users"("wallet_address") ON DELETE cascade ON UPDATE no action;