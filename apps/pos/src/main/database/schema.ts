import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const outlets = sqliteTable('outlets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  address: text('address'),
  phone: text('phone'),
  taxId: text('tax_id'),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  costPrice: integer('cost_price'),
  sku: text('sku'),
  imagePath: text('image_path'),
  station: text('station'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  trackInventory: integer('track_inventory', { mode: 'boolean' }).notNull().default(false),
});

export const modifiers = sqliteTable('modifiers', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  name: text('name').notNull(),
  isRequired: integer('is_required', { mode: 'boolean' }).notNull().default(false),
  minSelect: integer('min_select').notNull().default(0),
  maxSelect: integer('max_select').notNull().default(1),
});

export const modifierOptions = sqliteTable('modifierOptions', {
  id: text('id').primaryKey(),
  modifierId: text('modifier_id').notNull().references(() => modifiers.id),
  name: text('name').notNull(),
  priceAdd: integer('price_add').notNull().default(0),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  name: text('name').notNull(),
  pin: text('pin').notNull(),
  role: text('role').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const shifts = sqliteTable('shifts', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  registerId: text('register_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  openedAt: text('opened_at').notNull(),
  closedAt: text('closed_at'),
  openingCash: integer('opening_cash').notNull(),
  closingCash: integer('closing_cash'),
  expectedCash: integer('expected_cash'),
  notes: text('notes'),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  invoiceNo: text('invoice_no').notNull().unique(),
  outletId: text('outlet_id').notNull().references(() => outlets.id),
  registerId: text('register_id').notNull(),
  shiftId: text('shift_id').notNull().references(() => shifts.id),
  tableNo: text('table_no'),
  orderType: text('order_type').notNull(),
  status: text('status').notNull(),
  subtotal: integer('subtotal').notNull(),
  taxAmount: integer('tax_amount').notNull(),
  discountAmount: integer('discount_amount').notNull(),
  total: integer('total').notNull(),
  customerName: text('customer_name'),
  createdAt: text('created_at').notNull(),
  completedAt: text('completed_at'),
});

export const orderItems = sqliteTable('orderItems', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(),
  qty: integer('qty').notNull(),
  unitPrice: integer('unit_price').notNull(),
  modifiers: text('modifiers', { mode: 'json' }),
  notes: text('notes'),
  station: text('station'),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  method: text('method').notNull(),
  amount: integer('amount').notNull(),
  referenceNo: text('reference_no'),
  status: text('status').notNull(),
  paidAt: text('paid_at').notNull(),
});

export const inventoryLog = sqliteTable('inventoryLog', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  delta: integer('delta').notNull(),
  reason: text('reason').notNull(),
  orderId: text('order_id').references(() => orders.id),
  createdAt: text('created_at').notNull(),
});

export const outboxEvents = sqliteTable('outboxEvents', {
  eventId: text('event_id').primaryKey(),
  eventType: text('event_type').notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
  syncedAt: text('synced_at'),
  retryCount: integer('retry_count').notNull().default(0),
});

export const tenantConfig = sqliteTable('tenantConfig', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
  updatedAt: text('updated_at').notNull(),
});
