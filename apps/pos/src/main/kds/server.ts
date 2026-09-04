/**
 * KopiPOS - Local Area Network (LAN) Kitchen Display System (KDS) Server
 * Runs WebSocket server inside Electron main process.
 * Kitchen/Barista tablets connect to ws://<cashier-ip>:8080 without internet.
 */

import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { getDb } from '../database/connection';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';

export interface KDSTicket {
  orderId: string;
  orderNumber: string;
  tableNo: string;
  orderType: string;
  customerName?: string;
  station: string; // 'BARISTA' | 'HOT_KITCHEN' | 'BAKERY' | 'ALL'
  status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    qty: number;
    modifiers: string[];
    notes?: string;
  }>;
}

export class KDSServer {
  private wss: WebSocketServer | null = null;
  private httpServer: http.Server | null = null;
  private clients: Set<WebSocket> = new Set();
  private port: number;

  constructor(port = 8080) {
    this.port = port;
  }

  public start() {
    try {
      this.httpServer = http.createServer((req, res) => {
        // Simple health check endpoint for tablets
        if (req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', kds: 'KopiPOS LAN Server', version: '0.1.0' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('KopiPOS KDS LAN Server is running.');
      });

      this.wss = new WebSocketServer({ server: this.httpServer });

      this.wss.on('connection', (ws) => {
        this.clients.add(ws);
        console.log(`[KDS Server] New kitchen display tablet connected. Total clients: ${this.clients.size}`);

        // Send active pending & in-progress orders immediately upon connect
        this.sendActiveOrders(ws);

        ws.on('message', (message: string) => {
          try {
            const payload = JSON.parse(message.toString());
            this.handleClientMessage(payload, ws);
          } catch (e) {
            console.error('[KDS Server] Error parsing tablet message:', e);
          }
        });

        ws.on('close', () => {
          this.clients.delete(ws);
          console.log(`[KDS Server] Tablet disconnected. Remaining: ${this.clients.size}`);
        });
      });

      this.httpServer.listen(this.port, '0.0.0.0', () => {
        console.log(`[KDS Server] Listening on http://0.0.0.0:${this.port}`);
      });
    } catch (err) {
      console.error('[KDS Server] Failed to start KDS LAN server:', err);
    }
  }

  public stop() {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    if (this.httpServer) {
      this.httpServer.close();
      this.httpServer = null;
    }
  }

  /**
   * Broadcast new order ticket to all connected kitchen/barista tablets
   */
  public broadcastNewOrder(ticket: KDSTicket) {
    const payload = JSON.stringify({
      type: 'ORDER_NEW',
      ticket,
    });

    this.broadcast(payload);
  }

  /**
   * Broadcast order status update (e.g. Barista bumped ticket to READY)
   */
  public broadcastStatusUpdate(orderId: string, status: string) {
    const payload = JSON.stringify({
      type: 'ORDER_STATUS_CHANGED',
      orderId,
      status,
    });

    this.broadcast(payload);
  }

  private broadcast(payload: string) {
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  private sendActiveOrders(ws: WebSocket) {
    try {
      const db = getDb();
      // Fetch open orders
      const orders = db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.status, 'PENDING'))
        .all();

      const tickets: KDSTicket[] = orders.map((o) => {
        const items = db
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, o.id))
          .all();

        return {
          orderId: o.id,
          orderNumber: o.invoiceNo,
          tableNo: o.tableNo || '-',
          orderType: o.orderType,
          customerName: o.customerName || undefined,
          station: 'ALL',
          status: o.status as any,
          createdAt: o.createdAt,
          items: items.map((i) => ({
            id: i.id,
            productName: i.productName,
            qty: i.qty,
            modifiers: JSON.parse(i.modifiers || '[]').map((m: any) => m.optionName || m.name),
            notes: i.notes || undefined,
          })),
        };
      });

      ws.send(JSON.stringify({ type: 'SYNC_ACTIVE_ORDERS', tickets }));
    } catch (err) {
      console.error('[KDS Server] Error sending active orders:', err);
    }
  }

  private handleClientMessage(payload: any, ws: WebSocket) {
    if (payload.type === 'UPDATE_STATUS') {
      const { orderId, status } = payload;
      console.log(`[KDS Server] Tablet bumped order ${orderId} to ${status}`);

      try {
        const db = getDb();
        db.update(schema.orders)
          .set({ status })
          .where(eq(schema.orders.id, orderId))
          .run();

        // Broadcast to all other screens
        this.broadcastStatusUpdate(orderId, status);
      } catch (err) {
        console.error('[KDS Server] Failed to update order status in DB:', err);
      }
    }
  }
}

// Export singleton instance
export const kdsServer = new KDSServer(8080);
