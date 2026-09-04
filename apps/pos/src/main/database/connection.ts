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

  db = drizzle(sqlite);
  
  // Try to run migrations if the folder exists, for now we will assume the schema is created manually or via seed
  // migrate(db, { migrationsFolder: join(__dirname, '../../drizzle') });
  
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
