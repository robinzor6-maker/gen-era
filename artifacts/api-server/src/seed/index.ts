import { db, productsTable, collectionsTable } from "../lib/db.js";
import { SEED_PRODUCTS, SEED_COLLECTIONS } from "./products.js";
import { logger } from "../lib/logger.js";

export async function seedDatabase(): Promise<void> {
  try {
    const [existingProduct] = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
    if (!existingProduct) {
      logger.info("Seeding products...");
      await db.insert(productsTable).values(SEED_PRODUCTS);
      logger.info({ count: SEED_PRODUCTS.length }, "Products seeded");
    } else {
      logger.info("Products already seeded — skipping");
    }

    const [existingCollection] = await db.select({ id: collectionsTable.id }).from(collectionsTable).limit(1);
    if (!existingCollection) {
      logger.info("Seeding collections...");
      await db.insert(collectionsTable).values(SEED_COLLECTIONS);
      logger.info({ count: SEED_COLLECTIONS.length }, "Collections seeded");
    } else {
      logger.info("Collections already seeded — skipping");
    }
  } catch (err) {
    logger.error({ err }, "Database seed failed");
    throw err;
  }
}
