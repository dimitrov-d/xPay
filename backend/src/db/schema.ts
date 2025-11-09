import { pgTable, text, uuid, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Endpoint = typeof endpoints.$inferSelect;
export type NewEndpoint = typeof endpoints.$inferInsert;
