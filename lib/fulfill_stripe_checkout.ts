import type { PoolConnection, ResultSetHeader } from "mysql2/promise";
import type Stripe from "stripe";
import { query_db, withTransaction } from "@/lib/database_handler";
import { getStripe } from "@/lib/stripe_server";

type ProductLockRow = {
  product_id: number;
  price: string | number;
  stock_quantity: number;
  is_active: number | boolean;
};

function isDuplicateKeyError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const o = e as { code?: string; errno?: number };
  return o.code === "ER_DUP_ENTRY" || o.errno === 1062;
}

export type FulfillCheckoutOptions = {
  /** From an authenticated route: canonical DB user id (must match session metadata or client_reference_id when those are set). */
  trustedUserId?: string;
};

function resolveCheckoutUserId(
  full: Stripe.Checkout.Session,
  trustedUserId: string | undefined
): string {
  const meta = full.metadata ?? {};
  const fromMeta = String(meta.user_id ?? "").trim();
  const fromRef = String(full.client_reference_id ?? "").trim();
  const trusted = trustedUserId?.trim();

  if (trusted) {
    const metaOk = !fromMeta || fromMeta === trusted;
    const refOk = !fromRef || fromRef === trusted;
    if (!metaOk && !refOk) {
      throw new Error("Checkout session does not match the verified account.");
    }
    return trusted;
  }

  /* Prefer client_reference_id — Stripe keeps it reliable; metadata can be wrong in edge cases. */
  const fromSession = (fromRef || fromMeta).trim();
  if (!fromSession) {
    throw new Error("Missing user_id on Checkout Session (metadata or client_reference_id).");
  }
  return fromSession;
}

/**
 * After Stripe marks checkout paid, create DB rows (address, order, items) and decrement stock.
 * Idempotent: if this session was already fulfilled, returns the existing order id.
 */
export async function fulfillPaidCheckoutSession(
  session: Stripe.Checkout.Session,
  options: FulfillCheckoutOptions = {}
): Promise<{ orderId: number; duplicate: boolean }> {
  const stripe = getStripe();

  let dup: { order_id: number }[] = [];
  try {
    dup = await query_db<{ order_id: number }>(
      "SELECT order_id FROM orders WHERE stripe_checkout_session_id = ? LIMIT 1",
      [session.id]
    );
  } catch {
    throw new Error(
      "Database column orders.stripe_checkout_session_id is missing. Recreate the schema from db/01_websiteDB_Tables.sql or add the column manually."
    );
  }
  if (dup.length > 0) {
    return { orderId: dup[0].order_id, duplicate: true };
  }

  const full = await stripe.checkout.sessions.retrieve(session.id);

  if (full.payment_status !== "paid") {
    throw new Error(`Checkout session not paid: ${full.payment_status}`);
  }

  const userId = resolveCheckoutUserId(full, options.trustedUserId);
  const meta = full.metadata ?? {};
  const shipping = {
    street: String(meta.ship_street ?? "").trim(),
    city: String(meta.ship_city ?? "").trim(),
    province: String(meta.ship_province ?? "").trim(),
    postal_code: String(meta.ship_postal ?? "").trim(),
    country: String(meta.ship_country ?? "Canada").trim() || "Canada",
  };

  if (!shipping.street || !shipping.city || !shipping.province || !shipping.postal_code) {
    throw new Error("Missing shipping metadata on Checkout Session");
  }

  /* Session.retrieve often omits line_items; listLineItems is the supported way to load them. */
  const listed = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });
  const lineRows = listed.data;
  const pricedLines: { product_id: number; quantity: number; unitPrice: number }[] = [];

  for (const line of lineRows) {
    const qty = line.quantity ?? 0;
    if (!qty) continue;
    const priceObj = line.price;
    if (!priceObj || typeof priceObj === "string") continue;
    const productRef = priceObj.product;
    let product: Stripe.Product | null = null;
    if (typeof productRef === "string") {
      product = await stripe.products.retrieve(productRef);
    } else if (productRef && typeof productRef === "object") {
      product = productRef as Stripe.Product;
    } else {
      continue;
    }
    let pid = Number(product.metadata?.product_id);
    if (!Number.isFinite(pid) || pid <= 0) {
      if (product.id) {
        const fresh = await stripe.products.retrieve(product.id);
        pid = Number(fresh.metadata?.product_id);
      }
    }
    if (!Number.isFinite(pid) || pid <= 0) continue;
    const unit = (priceObj.unit_amount ?? 0) / 100;
    pricedLines.push({ product_id: pid, quantity: qty, unitPrice: unit });
  }

  if (pricedLines.length === 0) {
    throw new Error("No line items with product_id metadata to fulfill");
  }

  const totalFromStripe = (full.amount_total ?? 0) / 100;

  try {
    const result = await withTransaction(async (conn: PoolConnection) => {
      const sortedIds = [...new Set(pricedLines.map((l) => l.product_id))].sort((a, b) => a - b);
      const ph = sortedIds.map(() => "?").join(",");

      const [lockRows] = await conn.execute(
        `SELECT product_id, price, stock_quantity, is_active
         FROM products
         WHERE product_id IN (${ph})
         FOR UPDATE`,
        sortedIds
      );
      const products = lockRows as ProductLockRow[];
      if (products.length !== sortedIds.length) {
        throw new Error("UNKNOWN_PRODUCT");
      }
      const byId = new Map(products.map((p) => [p.product_id, p]));

      for (const line of pricedLines) {
        const p = byId.get(line.product_id);
        if (!p) throw new Error("UNKNOWN_PRODUCT");
        if (!p.is_active || p.is_active === 0) {
          throw new Error("INACTIVE_PRODUCT");
        }
        const stock = Number(p.stock_quantity);
        if (!Number.isFinite(stock) || stock < line.quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      const [userCheck] = await conn.execute(
        "SELECT user_id FROM users WHERE user_id = ? LIMIT 1",
        [userId]
      );
      const userRows = userCheck as { user_id: string }[];
      if (userRows.length === 0) {
        throw new Error(
          `No user account for id "${userId}" in this database. Use the same database where you registered, or log out and sign in again.`
        );
      }

      const [addrRes] = await conn.execute(
        `INSERT INTO addresses (user_id, address_type, street, city, province, postal_code, country, is_default)
         VALUES (?, 'shipping', ?, ?, ?, ?, ?, FALSE)`,
        [userId, shipping.street, shipping.city, shipping.province, shipping.postal_code, shipping.country]
      );
      const addrHeader = addrRes as ResultSetHeader;
      const shippingAddressId = addrHeader.insertId;
      if (!shippingAddressId) throw new Error("ADDRESS_INSERT_FAILED");

      const [orderRes] = await conn.execute(
        `INSERT INTO orders (user_id, shipping_address_id, billing_address_id, payment_id, order_status, payment_status, total_amount, stripe_checkout_session_id)
         VALUES (?, ?, NULL, NULL, 'paid', 'accepted', ?, ?)`,
        [userId, shippingAddressId, totalFromStripe, session.id]
      );
      const orderHeader = orderRes as ResultSetHeader;
      const newOrderId = orderHeader.insertId;
      if (!newOrderId) throw new Error("ORDER_INSERT_FAILED");

      for (const line of pricedLines) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
           VALUES (?, ?, ?, ?)`,
          [newOrderId, line.product_id, line.quantity, line.unitPrice]
        );
      }

      for (const line of pricedLines) {
        const [upd] = await conn.execute(
          `UPDATE products
           SET stock_quantity = stock_quantity - ?
           WHERE product_id = ? AND stock_quantity >= ?`,
          [line.quantity, line.product_id, line.quantity]
        );
        const updHeader = upd as ResultSetHeader;
        if (updHeader.affectedRows !== 1) {
          throw new Error("STOCK_RACE");
        }
      }

      return newOrderId;
    });

    return { orderId: result, duplicate: false };
  } catch (e) {
    if (isDuplicateKeyError(e)) {
      const again = await query_db<{ order_id: number }>(
        "SELECT order_id FROM orders WHERE stripe_checkout_session_id = ? LIMIT 1",
        [session.id]
      );
      if (again.length > 0) {
        return { orderId: again[0].order_id, duplicate: true };
      }
    }
    throw e;
  }
}
