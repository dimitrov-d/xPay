import {
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  walletAddress: text('wallet_address').primaryKey(),
  username: text('username').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const endpoints = pgTable('endpoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  userWallet: text('user_wallet')
    .notNull()
    .references(() => users.walletAddress, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  originalUrl: text('original_url').notNull(),
  httpMethod: text('http_method').notNull(),
  paymentAmount: numeric('payment_amount').notNull(),
  tokenType: text('token_type').notNull(),
  customAuthHeaders: jsonb('custom_auth_headers'),
  sampleBody: jsonb('sample_body'),
  sampleResponse: jsonb('sample_response'),
  totalEarnings: numeric('total_earnings').default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    endpointId: uuid('endpoint_id')
      .notNull()
      .references(() => endpoints.id, { onDelete: 'cascade' }),
    userWallet: text('user_wallet')
      .notNull()
      .references(() => users.walletAddress, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1-5 stars
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [unique().on(table.endpointId, table.userWallet)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Endpoint = typeof endpoints.$inferSelect;
export type NewEndpoint = typeof endpoints.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
