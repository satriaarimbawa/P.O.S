/**
 * KopiPOS - Offline-First Background Sync Worker
 * Operates autonomously:
 * 1. Pushes pending local outbox_events to Cloud API when online
 * 2. Pulls updated tenant configs (branding, pricing) to local SQLite
 */

import { getDb } from '../database/connection';
import * as schema from '../database/schema';
import { isNull, eq } from 'drizzle-orm';

export class SyncWorker {
  private apiUrl: string;
  private intervalMs: number;
  private timer: NodeJS.Timeout | null = null;
  private isSyncing = false;

  constructor(apiUrl = 'http://localhost:3001', intervalMs = 15000) {
    this.apiUrl = apiUrl;
    this.intervalMs = intervalMs;
  }

  public start() {
    console.log('[SyncWorker] Background sync worker started (Interval: 15s)');
    this.timer = setInterval(() => {
      this.syncOutbox();
    }, this.intervalMs);

    // Initial run
    setTimeout(() => this.syncOutbox(), 2000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async syncOutbox(): Promise<{ pushed: number; error?: string }> {
    if (this.isSyncing) return { pushed: 0 };
    this.isSyncing = true;

    try {
      const db = getDb();
      // 1. Fetch unsynced events from SQLite
      const pendingEvents = db
        .select()
        .from(schema.outboxEvents)
        .where(isNull(schema.outboxEvents.syncedAt))
        .limit(50)
        .all();

      if (pendingEvents.length === 0) {
        this.isSyncing = false;
        return { pushed: 0 };
      }

      console.log(`[SyncWorker] Found ${pendingEvents.length} pending offline events to push.`);

      // 2. Attempt push to Cloud API
      const response = await fetch(`${this.apiUrl}/api/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          events: pendingEvents.map((e) => ({
            id: e.id,
            eventType: e.eventType,
            payload: JSON.parse(e.payload),
            createdAt: e.createdAt,
          })),
        }),
      });

      if (response.ok) {
        const now = new Date().toISOString();
        // 3. Mark as synced in local SQLite
        for (const evt of pendingEvents) {
          db.update(schema.outboxEvents)
            .set({ syncedAt: now })
            .where(eq(schema.outboxEvents.id, evt.id))
            .run();
        }
        console.log(`[SyncWorker] Successfully pushed ${pendingEvents.length} events to cloud.`);
        this.isSyncing = false;
        return { pushed: pendingEvents.length };
      } else {
        console.warn(`[SyncWorker] Cloud API returned status ${response.status}. Retrying later.`);
        this.isSyncing = false;
        return { pushed: 0, error: `HTTP ${response.status}` };
      }
    } catch (err: any) {
      // Offline - silently skip and retry next cycle
      // console.log('[SyncWorker] Offline. Will retry when connection resumes.');
      this.isSyncing = false;
      return { pushed: 0, error: err.message };
    }
  }

  /**
   * Helper to queue an outbox event atomically
   */
  public static queueEvent(eventType: string, payload: any) {
    try {
      const db = getDb();
      const eventId = 'evt_' + Math.random().toString(36).substring(2, 12);
      db.insert(schema.outboxEvents)
        .values({
          id: eventId,
          eventType,
          payload: JSON.stringify(payload),
          createdAt: new Date().toISOString(),
        })
        .run();
    } catch (e) {
      console.error('[SyncWorker] Failed to queue outbox event:', e);
    }
  }
}

export const syncWorker = new SyncWorker();
