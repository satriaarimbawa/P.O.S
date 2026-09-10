import { app } from 'electron';
import { join } from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

let db: ReturnType<typeof drizzle> | null = null;
let sqlite: Database.Database | null = null;

export function initDb() {
  if (db) return db;

  const dbPath = join(app.getPath('userData'), 'kopipos.db');
  sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('synchronous = NORMAL');

  // Ensure tables exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS outlets (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      tax_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      cost_price INTEGER,
      sku TEXT,
      image_path TEXT,
      station TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      track_inventory INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS modifiers (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      is_required INTEGER NOT NULL DEFAULT 0,
      min_select INTEGER NOT NULL DEFAULT 0,
      max_select INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS modifierOptions (
      id TEXT PRIMARY KEY,
      modifier_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price_add INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      name TEXT NOT NULL,
      pin TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      register_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      opening_cash INTEGER NOT NULL,
      closing_cash INTEGER,
      expected_cash INTEGER,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      invoice_no TEXT NOT NULL UNIQUE,
      outlet_id TEXT NOT NULL,
      register_id TEXT NOT NULL,
      shift_id TEXT NOT NULL,
      table_no TEXT,
      order_type TEXT NOT NULL,
      status TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      tax_amount INTEGER NOT NULL,
      discount_amount INTEGER NOT NULL,
      total INTEGER NOT NULL,
      customer_name TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orderItems (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      modifiers TEXT,
      notes TEXT,
      station TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      method TEXT NOT NULL,
      amount INTEGER NOT NULL,
      reference_no TEXT,
      status TEXT NOT NULL,
      paid_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventoryLog (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      order_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outboxEvents (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced_at TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tenantConfig (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db = drizzle(sqlite);

  // Auto seed if empty
  try {
    const userCount = sqlite.prepare('SELECT count(*) as count FROM users').get() as { count: number };
    if (userCount.count === 0) {
      import('./seed').then(({ seed }) => {
        seed().catch((err) => console.error('Auto-seed failed:', err));
      });
    }
  } catch (err) {
    console.error('Error checking seed:', err);
  }

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function closeDb() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
  }
}
