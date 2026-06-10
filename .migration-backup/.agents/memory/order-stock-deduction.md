---
name: Order Stock Deduction Pattern
description: How atomic stock deduction works in the orders route to prevent overselling
---

# Atomic Stock Deduction Pattern

## The pattern
```typescript
const updated = await tx
  .update(productsTable)
  .set({ stock: sql`${productsTable.stock} - ${item.quantity}` })
  .where(and(eq(productsTable.id, item.productId), gte(productsTable.stock, item.quantity)))
  .returning({ newStock: productsTable.stock });

if (updated.length === 0) {
  throw Object.assign(new Error(`Insufficient stock for: ${item.name}`), { status: 409 });
}
```

## Why this works
The WHERE `stock >= qty` condition on the UPDATE is evaluated atomically at the row level by PostgreSQL. If two concurrent requests race, only one will pass the WHERE check. The loser gets 0 rows returned → throws 409.

## Wrapping
The entire order creation is wrapped in `db.transaction()`:
1. Resolve all products from DB (authoritative prices)
2. Atomic stock deduction per item
3. Compute total price server-side
4. Insert order record
5. Insert order_items records

## Error propagation
Errors thrown inside the transaction callback are caught in the route handler. Errors with `.status < 500` (like 400 bad product, 409 insufficient stock) return that status. Others re-throw for the global 500 handler.
