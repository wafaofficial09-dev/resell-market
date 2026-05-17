import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
  GetProductParams,
  UpdateProductStockBody,
  UpdateProductStockParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./auth";

const router = Router();

function formatProduct(p: any) {
  const price = parseFloat(p.price);
  const offerPrice = parseFloat(p.offerPrice);
  const discountPercent = price > 0 ? Math.round(((price - offerPrice) / price) * 100) : null;
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    price,
    offerPrice,
    discountPercent,
    images: p.images ?? [],
    categoryId: p.categoryId ?? null,
    categoryName: p.categoryName ?? null,
    inStock: p.inStock,
    featured: p.featured,
    stockCount: p.stockCount ?? null,
    hasDeliveryCharge: p.hasDeliveryCharge ?? false,
    deliveryCharge: p.deliveryCharge !== null && p.deliveryCharge !== undefined ? parseFloat(p.deliveryCharge) : null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

async function getProducts(filters: { categorySlug?: string | null; search?: string | null; featured?: boolean | null; inStock?: boolean | null } = {}) {
  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      offerPrice: productsTable.offerPrice,
      images: productsTable.images,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      inStock: productsTable.inStock,
      featured: productsTable.featured,
      stockCount: productsTable.stockCount,
      hasDeliveryCharge: productsTable.hasDeliveryCharge,
      deliveryCharge: productsTable.deliveryCharge,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(desc(productsTable.createdAt));

  return rows
    .filter((p) => {
      if (filters.inStock !== null && filters.inStock !== undefined && p.inStock !== filters.inStock) return false;
      if (filters.featured !== null && filters.featured !== undefined && p.featured !== filters.featured) return false;
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.categorySlug && p.categoryName?.toLowerCase() !== filters.categorySlug.toLowerCase() && p.categoryId?.toString() !== filters.categorySlug) return false;
      return true;
    })
    .map(formatProduct);
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: "Invalid query" }); return; }
  try {
    const products = await getProducts({
      categorySlug: parsed.data.category ?? null,
      search: parsed.data.search ?? null,
      featured: parsed.data.featured ?? null,
      inStock: parsed.data.inStock ?? null,
    });
    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.get("/products/featured", async (req, res): Promise<void> => {
  try {
    const products = await getProducts({ featured: true, inStock: null });
    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to list featured products");
    res.status(500).json({ error: "Failed to list featured" });
  }
});

router.get("/products/recent", async (req, res): Promise<void> => {
  try {
    const all = await getProducts({});
    res.json(all.slice(0, 8));
  } catch (err) {
    req.log.error({ err }, "Failed to list recent products");
    res.status(500).json({ error: "Failed to list recent" });
  }
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const rows = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        offerPrice: productsTable.offerPrice,
        images: productsTable.images,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        inStock: productsTable.inStock,
        featured: productsTable.featured,
        stockCount: productsTable.stockCount,
        hasDeliveryCharge: productsTable.hasDeliveryCharge,
        deliveryCharge: productsTable.deliveryCharge,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, params.data.id));
    if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatProduct(rows[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to get product" });
  }
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [p] = await db.insert(productsTable).values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: String(parsed.data.price),
      offerPrice: String(parsed.data.offerPrice),
      images: parsed.data.images ?? [],
      categoryId: parsed.data.categoryId ?? null,
      inStock: parsed.data.inStock ?? true,
      featured: parsed.data.featured ?? false,
      stockCount: parsed.data.stockCount ?? null,
      hasDeliveryCharge: parsed.data.hasDeliveryCharge ?? false,
      deliveryCharge: parsed.data.deliveryCharge !== undefined && parsed.data.deliveryCharge !== null ? String(parsed.data.deliveryCharge) : "50",
    }).returning();
    res.status(201).json(formatProduct(p));
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  const body = UpdateProductBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid request" }); return; }
  try {
    const updateData: any = {};
    if (body.data.name !== undefined) updateData.name = body.data.name;
    if (body.data.description !== undefined) updateData.description = body.data.description;
    if (body.data.price !== undefined) updateData.price = String(body.data.price);
    if (body.data.offerPrice !== undefined) updateData.offerPrice = String(body.data.offerPrice);
    if (body.data.images !== undefined) updateData.images = body.data.images;
    if (body.data.categoryId !== undefined) updateData.categoryId = body.data.categoryId;
    if (body.data.inStock !== undefined) updateData.inStock = body.data.inStock;
    if (body.data.featured !== undefined) updateData.featured = body.data.featured;
    if (body.data.stockCount !== undefined) updateData.stockCount = body.data.stockCount;
    if (body.data.hasDeliveryCharge !== undefined) updateData.hasDeliveryCharge = body.data.hasDeliveryCharge;
    if (body.data.deliveryCharge !== undefined) updateData.deliveryCharge = body.data.deliveryCharge !== null ? String(body.data.deliveryCharge) : "50";
    const [p] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, params.data.id)).returning();
    if (!p) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatProduct(p));
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.patch("/products/:id/stock", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductStockParams.safeParse(req.params);
  const body = UpdateProductStockBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid request" }); return; }
  try {
    const [p] = await db.update(productsTable)
      .set({ inStock: body.data.inStock, stockCount: body.data.stockCount ?? null })
      .where(eq(productsTable.id, params.data.id))
      .returning();
    if (!p) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatProduct(p));
  } catch (err) {
    req.log.error({ err }, "Failed to update stock");
    res.status(500).json({ error: "Failed to update stock" });
  }
});

export default router;
