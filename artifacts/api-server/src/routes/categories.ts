import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  UpdateCategoryParams,
  DeleteCategoryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./auth";

const router = Router();

router.get("/categories", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        icon: categoriesTable.icon,
        productCount: sql<number>`count(${productsTable.id})::int`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .groupBy(categoriesTable.id);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
    res.status(201).json({ ...cat, productCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.put("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  const body = UpdateCategoryBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  try {
    const [updated] = await db
      .update(categoriesTable)
      .set(body.data)
      .where(eq(categoriesTable.id, params.data.id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...updated, productCount: null });
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete category");
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
