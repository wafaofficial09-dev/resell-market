import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull().default("ShopEasy"),
  storeTagline: text("store_tagline"),
  whatsappNumber: text("whatsapp_number").notNull().default("919999999999"),
  logoUrl: text("logo_url"),
  announcementText: text("announcement_text").notNull().default("Free delivery on orders above ₹499! Limited time offer."),
  announcementEnabled: boolean("announcement_enabled").notNull().default(true),
  offerBadgeText: text("offer_badge_text"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  primaryColor: text("primary_color"),
  footerText: text("footer_text"),
  socialInstagram: text("social_instagram"),
  socialFacebook: text("social_facebook"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
