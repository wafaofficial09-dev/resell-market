import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, desc, ilike, sql } from "drizzle-orm";
import {
  CreateOrderBody,
  ListOrdersQueryParams,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import { requireAdmin } from "./auth";

const router = Router();

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SE-${ts}-${rand}`;
}

function formatOrder(o: any) {
  return {
    id: o.id,
    orderId: o.orderId,
    customerName: o.customerName,
    phone: o.phone,
    address: o.address,
    items: o.items ?? [],
    total: parseFloat(o.total),
    paymentMethod: o.paymentMethod,
    status: o.status,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
  };
}

router.get("/orders", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: "Invalid query" }); return; }
  try {
    let rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const { status, paymentMethod, search } = parsed.data;
    if (status) rows = rows.filter((o) => o.status === status);
    if (paymentMethod) rows = rows.filter((o) => o.paymentMethod === paymentMethod);
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (o) =>
          o.customerName.toLowerCase().includes(s) ||
          o.phone.includes(s) ||
          o.orderId.toLowerCase().includes(s)
      );
    }
    res.json(rows.map(formatOrder));
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.get("/orders/stats", requireAdmin, async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(ordersTable);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = {
      total: rows.length,
      pending: rows.filter((o) => o.status === "pending").length,
      processing: rows.filter((o) => o.status === "processing").length,
      shipped: rows.filter((o) => o.status === "shipped").length,
      delivered: rows.filter((o) => o.status === "delivered").length,
      cancelled: rows.filter((o) => o.status === "cancelled").length,
      totalRevenue: rows
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + parseFloat(o.total as string), 0),
      todayOrders: rows.filter((o) => {
        const d = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt as string);
        return d >= today;
      }).length,
      codOrders: rows.filter((o) => o.paymentMethod === "cod").length,
      onlineOrders: rows.filter((o) => o.paymentMethod === "online").length,
    };
    res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get order stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const orderId = generateOrderId();
    const [order] = await db.insert(ordersTable).values({
      orderId,
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      items: parsed.data.items as any,
      total: String(parsed.data.total),
      paymentMethod: parsed.data.paymentMethod,
      status: "pending",
    }).returning();
    res.status(201).json(formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Failed to get order" });
  }
});

router.patch("/orders/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  const body = UpdateOrderStatusBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid request" }); return; }
  try {
    const [order] = await db.update(ordersTable)
      .set({ status: body.data.status })
      .where(eq(ordersTable.id, params.data.id))
      .returning();
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;
