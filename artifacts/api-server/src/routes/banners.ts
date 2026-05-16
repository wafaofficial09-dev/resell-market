import { Router } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  CreateBannerBody,
  UpdateBannerBody,
  UpdateBannerParams,
  DeleteBannerParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./auth";

const router = Router();

router.get("/banners", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(bannersTable).orderBy(asc(bannersTable.sortOrder));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list banners");
    res.status(500).json({ error: "Failed to list banners" });
  }
});

router.post("/banners", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBannerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [banner] = await db.insert(bannersTable).values({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      imageUrl: parsed.data.imageUrl,
      linkUrl: parsed.data.linkUrl ?? null,
      active: parsed.data.active ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    }).returning();
    res.status(201).json(banner);
  } catch (err) {
    req.log.error({ err }, "Failed to create banner");
    res.status(500).json({ error: "Failed to create banner" });
  }
});

router.put("/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateBannerParams.safeParse(req.params);
  const body = UpdateBannerBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid request" }); return; }
  try {
    const [banner] = await db.update(bannersTable)
      .set({
        title: body.data.title,
        subtitle: body.data.subtitle ?? null,
        imageUrl: body.data.imageUrl,
        linkUrl: body.data.linkUrl ?? null,
        active: body.data.active ?? true,
        sortOrder: body.data.sortOrder ?? 0,
      })
      .where(eq(bannersTable.id, params.data.id))
      .returning();
    if (!banner) { res.status(404).json({ error: "Not found" }); return; }
    res.json(banner);
  } catch (err) {
    req.log.error({ err }, "Failed to update banner");
    res.status(500).json({ error: "Failed to update banner" });
  }
});

router.delete("/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteBannerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(bannersTable).where(eq(bannersTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete banner");
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

export default router;
