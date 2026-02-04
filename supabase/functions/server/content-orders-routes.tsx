/**
 * CONTENT ORDERS ROUTES - Система заказа контента (джинглы/реклама/анонсы)
 * 
 * Endpoints:
 * POST   /orders          - Создать заказ (venue)
 * GET    /orders          - Получить заказы (admin/venue)
 * GET    /orders/:id      - Получить заказ по ID
 * PUT    /orders/:id      - Обновить статус заказа (admin)
 * DELETE /orders/:id      - Удалить заказ
 */

import { Hono } from "npm:hono@4";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Статусы заказа
export type OrderStatus = 
  | 'pending'      // Ожидает обработки админом
  | 'processing'   // В работе (отправлено в ElevenLabs)
  | 'review'       // На проверке у админа
  | 'ready'        // Готов к прослушиванию клиентом
  | 'approved'     // Утвержден клиентом
  | 'revision'     // Требует доработки
  | 'completed'    // Завершен (в эфире)
  | 'cancelled';   // Отменен

export interface ContentOrder {
  id: string;
  venueId: string;
  venueName: string;
  contentType: 'jingles' | 'ads' | 'announcements';
  text: string;
  style: string;
  duration: number;
  voiceType: string;
  price: number;
  status: OrderStatus;
  audioUrl?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// =====================================================
// CREATE ORDER (Venue)
// =====================================================

app.post("/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { venueId, venueName, contentType, text, style, duration, voiceType, price } = body;

    // Validation
    if (!venueId || !venueName || !contentType || !text || !style || !voiceType || !price) {
      return c.json({ 
        success: false, 
        error: "Missing required fields" 
      }, 400);
    }

    if (!['jingles', 'ads', 'announcements'].includes(contentType)) {
      return c.json({ 
        success: false, 
        error: "Invalid content type" 
      }, 400);
    }

    if (text.length < 10 || text.length > 300) {
      return c.json({ 
        success: false, 
        error: "Text must be between 10 and 300 characters" 
      }, 400);
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();

    const order: ContentOrder = {
      id: orderId,
      venueId,
      venueName,
      contentType,
      text,
      style,
      duration,
      voiceType,
      price,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to KV store
    await kv.set(`content_order:${orderId}`, order);
    
    // Add to venue's orders list
    const venueOrdersKey = `venue_orders:${venueId}`;
    const venueOrders = await kv.get(venueOrdersKey) || [];
    venueOrders.push(orderId);
    await kv.set(venueOrdersKey, venueOrders);

    // Add to pending orders list (for admin)
    const pendingOrdersKey = 'content_orders:pending';
    const pendingOrders = await kv.get(pendingOrdersKey) || [];
    pendingOrders.push(orderId);
    await kv.set(pendingOrdersKey, pendingOrders);

    console.log(`✅ Content order created: ${orderId} (${contentType})`);

    return c.json({
      success: true,
      order,
      message: "Order created successfully"
    }, 201);

  } catch (error) {
    console.error("Error creating content order:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create order" 
    }, 500);
  }
});

// =====================================================
// GET ALL ORDERS (Admin/Venue)
// =====================================================

app.get("/orders", async (c) => {
  try {
    const venueId = c.req.query("venueId");
    const status = c.req.query("status") as OrderStatus | undefined;
    const role = c.req.query("role"); // 'admin' or 'venue'

    console.log('📥 GET /orders - role:', role, 'venueId:', venueId, 'status:', status);

    let orderIds: string[] = [];

    if (role === 'admin') {
      // Admin sees all orders or filtered by status
      if (status) {
        orderIds = await kv.get(`content_orders:${status}`) || [];
        console.log(`📊 Found ${orderIds.length} orders with status: ${status}`);
      } else {
        // Get all orders
        const allStatuses: OrderStatus[] = ['pending', 'processing', 'review', 'ready', 'approved', 'revision', 'completed', 'cancelled'];
        for (const s of allStatuses) {
          const orders = await kv.get(`content_orders:${s}`) || [];
          console.log(`📊 Status ${s}: ${orders.length} orders`);
          orderIds.push(...orders);
        }
        console.log(`📊 Total orderIds: ${orderIds.length}`);
      }
    } else if (venueId) {
      // Venue sees only their orders
      orderIds = await kv.get(`venue_orders:${venueId}`) || [];
      console.log(`📊 Found ${orderIds.length} orders for venue: ${venueId}`);
    } else {
      console.warn('⚠️ Missing venueId or role=admin');
      return c.json({ 
        success: false, 
        error: "venueId or role=admin required" 
      }, 400);
    }

    // Fetch all orders
    const orders: ContentOrder[] = [];
    for (const orderId of orderIds) {
      const order = await kv.get(`content_order:${orderId}`);
      if (order) {
        orders.push(order);
      } else {
        console.warn(`⚠️ Order not found in KV: ${orderId}`);
      }
    }

    console.log(`✅ Fetched ${orders.length} complete orders from KV`);

    // Filter by status if provided for venue
    const filteredOrders = status 
      ? orders.filter(o => o.status === status)
      : orders;

    // Sort by date (newest first)
    filteredOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(`📋 Returning ${filteredOrders.length} content orders`);

    return c.json({
      success: true,
      orders: filteredOrders,
      total: filteredOrders.length
    });

  } catch (error) {
    console.error("❌ Error fetching content orders:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch orders" 
    }, 500);
  }
});

// =====================================================
// GET ORDER BY ID
// =====================================================

app.get("/orders/:id", async (c) => {
  try {
    const orderId = c.req.param("id");
    const order = await kv.get(`content_order:${orderId}`);

    if (!order) {
      return c.json({ 
        success: false, 
        error: "Order not found" 
      }, 404);
    }

    return c.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Error fetching content order:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch order" 
    }, 500);
  }
});

// =====================================================
// UPDATE ORDER STATUS (Admin)
// =====================================================

app.put("/orders/:id", async (c) => {
  try {
    const orderId = c.req.param("id");
    const body = await c.req.json();
    const { status, audioUrl, adminComment } = body;

    const order = await kv.get(`content_order:${orderId}`) as ContentOrder;

    if (!order) {
      return c.json({ 
        success: false, 
        error: "Order not found" 
      }, 404);
    }

    const oldStatus = order.status;

    // Update order
    const updatedOrder: ContentOrder = {
      ...order,
      ...(status && { status }),
      ...(audioUrl && { audioUrl }),
      ...(adminComment !== undefined && { adminComment }),
      updatedAt: new Date().toISOString(),
      ...(status === 'completed' && { completedAt: new Date().toISOString() }),
    };

    await kv.set(`content_order:${orderId}`, updatedOrder);

    // Update status lists if status changed
    if (status && status !== oldStatus) {
      // Remove from old status list
      const oldStatusKey = `content_orders:${oldStatus}`;
      const oldStatusOrders = await kv.get(oldStatusKey) || [];
      const filteredOldOrders = oldStatusOrders.filter((id: string) => id !== orderId);
      await kv.set(oldStatusKey, filteredOldOrders);

      // Add to new status list
      const newStatusKey = `content_orders:${status}`;
      const newStatusOrders = await kv.get(newStatusKey) || [];
      if (!newStatusOrders.includes(orderId)) {
        newStatusOrders.push(orderId);
        await kv.set(newStatusKey, newStatusOrders);
      }
    }

    console.log(`✅ Order ${orderId} updated: ${oldStatus} → ${status || oldStatus}`);

    return c.json({
      success: true,
      order: updatedOrder,
      message: "Order updated successfully"
    });

  } catch (error) {
    console.error("Error updating content order:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update order" 
    }, 500);
  }
});

// =====================================================
// DELETE ORDER
// =====================================================

app.delete("/orders/:id", async (c) => {
  try {
    const orderId = c.req.param("id");
    const order = await kv.get(`content_order:${orderId}`) as ContentOrder;

    if (!order) {
      return c.json({ 
        success: false, 
        error: "Order not found" 
      }, 404);
    }

    // Remove from all lists
    await kv.del(`content_order:${orderId}`);
    
    // Remove from venue orders
    const venueOrdersKey = `venue_orders:${order.venueId}`;
    const venueOrders = await kv.get(venueOrdersKey) || [];
    await kv.set(venueOrdersKey, venueOrders.filter((id: string) => id !== orderId));

    // Remove from status list
    const statusKey = `content_orders:${order.status}`;
    const statusOrders = await kv.get(statusKey) || [];
    await kv.set(statusKey, statusOrders.filter((id: string) => id !== orderId));

    console.log(`🗑️ Order ${orderId} deleted`);

    return c.json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting content order:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete order" 
    }, 500);
  }
});

// =====================================================
// GET STATS (Admin Dashboard)
// =====================================================

app.get("/stats", async (c) => {
  try {
    const statuses: OrderStatus[] = ['pending', 'processing', 'review', 'ready', 'approved', 'revision', 'completed', 'cancelled'];
    
    const stats: Record<string, number> = {};
    let total = 0;

    for (const status of statuses) {
      const orders = await kv.get(`content_orders:${status}`) || [];
      stats[status] = orders.length;
      total += orders.length;
    }

    return c.json({
      success: true,
      stats,
      total
    });

  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch stats" 
    }, 500);
  }
});

// =====================================================
// CREATE DEMO ORDER (Development only)
// =====================================================

app.post("/demo", async (c) => {
  try {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();

    const demoOrder: ContentOrder = {
      id: orderId,
      venueId: 'venue_demo_123',
      venueName: 'Sunset Lounge',
      contentType: 'jingles',
      text: 'Добро пожаловать в Sunset Lounge - вашу любимую атмосферу джаза и коктейлей!',
      style: 'professional',
      duration: 15,
      voiceType: 'male',
      price: 3000,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to KV
    await kv.set(`content_order:${orderId}`, demoOrder);
    
    // Add to venue's orders list
    const venueOrdersKey = `venue_orders:${demoOrder.venueId}`;
    const venueOrders = await kv.get(venueOrdersKey) || [];
    venueOrders.push(orderId);
    await kv.set(venueOrdersKey, venueOrders);

    // Add to pending orders list
    const pendingOrdersKey = 'content_orders:pending';
    const pendingOrders = await kv.get(pendingOrdersKey) || [];
    pendingOrders.push(orderId);
    await kv.set(pendingOrdersKey, pendingOrders);

    console.log(`✅ Demo order created: ${orderId}`);

    return c.json({
      success: true,
      order: demoOrder,
      message: "Demo order created successfully"
    }, 201);

  } catch (error) {
    console.error("Error creating demo order:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create demo order" 
    }, 500);
  }
});

export default app;