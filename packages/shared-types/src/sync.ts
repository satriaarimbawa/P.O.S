export interface OutboxEvent {
  eventId: string; // UUIDv7
  eventType: SyncEventType;
  payload: Record<string, unknown>;
  createdAt: string;
  syncedAt: string | null;
  retryCount: number;
}

export type SyncEventType =
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_VOIDED'
  | 'PAYMENT_RECEIVED'
  | 'SHIFT_OPENED'
  | 'SHIFT_CLOSED'
  | 'INVENTORY_ADJUSTED'
  | 'PRODUCT_UPDATED';

export interface SyncBatchRequest {
  outletId: string;
  registerId: string;
  events: OutboxEvent[];
}

export interface SyncBatchResponse {
  accepted: string[]; // event IDs
  rejected: { eventId: string; reason: string }[];
  configUpdates?: TenantConfigUpdate[];
}

export interface TenantConfigUpdate {
  key: string;
  value: unknown;
  updatedAt: string;
}
