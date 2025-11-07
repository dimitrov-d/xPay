CREATE TABLE "endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_wallet" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"original_url" text NOT NULL,
	"http_method" text NOT NULL,
	"payment_amount" numeric NOT NULL,
	"token_type" text NOT NULL,
	"receiver_address" text NOT NULL,
	"custom_auth_headers" jsonb,
	"sample_body" jsonb,
	"sample_response" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"wallet_address" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_user_wallet_users_wallet_address_fk" FOREIGN KEY ("user_wallet") REFERENCES "public"."users"("wallet_address") ON DELETE cascade ON UPDATE no action;