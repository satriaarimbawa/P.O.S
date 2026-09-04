import { pgTable, uuid, text, boolean, timestamp, integer, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const vendorUsers = pgTable('vendor_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').default('admin'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  businessName: text('business_name'),
  ownerName: text('owner_name'),
  phone: text('phone'),
  email: text('email'),
  logoUrl: text('logo_url'),
  brandColor: text('brand_color').default('#1a1a2e'),
  receiptHeader: text('receipt_header'),
  receiptFooter: text('receipt_footer').default('Powered by KopiPOS'),
  taxId: text('tax_id'),
  plan: text('plan', { enum: ['trial', 'basic', 'pro', 'enterprise'] }).default('trial'),
  status: text('status', { enum: ['active', 'trial', 'suspended', 'expired'] }).default('trial'),
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const outlets = pgTable('outlets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name'),
  code: text('code').notNull(),
  address: text('address'),
  phone: text('phone'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const licenses = pgTable('licenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  outletId: uuid('outlet_id').notNull().references(() => outlets.id),
  licenseKey: text('license_key').notNull().unique(),
  activatedAt: timestamp('activated_at'),
  expiresAt: timestamp('expires_at').notNull(),
  status: text('status', { enum: ['pending', 'active', 'expired', 'revoked'] }).default('pending'),
  machineId: text('machine_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const registers = pgTable('registers', {
  id: uuid('id').primaryKey().defaultRandom(),
  outletId: uuid('outlet_id').notNull().references(() => outlets.id),
  name: text('name'),
  licenseId: uuid('license_id').references(() => licenses.id),
  lastSeenAt: timestamp('last_seen_at'),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  plan: text('plan'),
  amount: integer('amount'),
  billingCycle: text('billing_cycle', { enum: ['monthly', 'yearly'] }),
  status: text('status', { enum: ['active', 'past_due', 'canceled'] }),
  currentPeriodEnd: timestamp('current_period_end'),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const syncEvents = pgTable('sync_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  outletId: uuid('outlet_id').notNull().references(() => outlets.id),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
});

export const tenantConfigs = pgTable('tenant_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  key: text('key').notNull(),
  value: jsonb('value'),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  unq: unique().on(t.tenantId, t.key)
}));

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  outlets: many(outlets),
  licenses: many(licenses),
  subscriptions: many(subscriptions),
  syncEvents: many(syncEvents),
  configs: many(tenantConfigs),
}));

export const outletsRelations = relations(outlets, ({ one, many }) => ({
  tenant: one(tenants, { fields: [outlets.tenantId], references: [tenants.id] }),
  registers: many(registers),
  licenses: many(licenses),
  syncEvents: many(syncEvents),
}));

export const registersRelations = relations(registers, ({ one }) => ({
  outlet: one(outlets, { fields: [registers.outletId], references: [outlets.id] }),
  license: one(licenses, { fields: [registers.licenseId], references: [licenses.id] }),
}));

export const licensesRelations = relations(licenses, ({ one, many }) => ({
  tenant: one(tenants, { fields: [licenses.tenantId], references: [tenants.id] }),
  outlet: one(outlets, { fields: [licenses.outletId], references: [outlets.id] }),
  registers: many(registers),
}));
