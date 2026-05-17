import { pgTable, text, serial, boolean, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  offerPrice: numeric("offer_price", { precision: 10, scale: 2 }).notNull(),
  images: text("images").array().notNull().default([]),
  categoryId: integer("category_id"),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  stockCount: integer("stock_count"),
  hasDeliveryCharge: boolean("has_delivery_charge").notNull().default(false),
  deliveryCharge: numeric("delivery_charge", { precision: 10, scale: 2 }).default("50"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
