import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertBannerSchema = createInsertSchema(bannersTable).omit({ id: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof bannersTable.$inferSelect;
