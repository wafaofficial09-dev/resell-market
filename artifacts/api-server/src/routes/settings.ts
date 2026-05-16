import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "./auth";

const router = Router();

async function getOrCreateSettings() {
  const rows = await db.select().from(settingsTable);
  if (rows[0]) return rows[0];
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

router.get("/settings", async (req, res): Promise<void> => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    req.log.error({ err }, "Failed to get settings");
    res.status(500).json({ error: "Failed to get settings" });
  }
});

router.put("/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const current = await getOrCreateSettings();
    const [updated] = await db
      .update(settingsTable)
      .set(parsed.data)
      .where(eq(settingsTable.id, current.id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update settings");
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
