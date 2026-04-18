export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { guardRoute } from "@/lib/guard_route";
import { getAuthClaims, requireAuth } from "@/lib/validators";

type OrderRow = {
  order_id: number;
  user_id: string;
  order_status: string;
  payment_status: string;
  total_amount: string | number;
  order_date: Date | string;
  shipping_address_id: number | null;
  billing_address_id: number | null;
  payment_id: number | null;
};

type OrderItemRow = {
  order_item_id: number;
  order_id: number;
  product_id: number | null;
  quantity: number;
  price_at_purchase: string | number;
  subtotal?: string | number;
  product_name: string | null;
  product_image_url: string | null;
};

export type OrderWithItems = {
  order_id: number;
  user_id: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  order_date: string;
  shipping_address_id: number | null;
  billing_address_id: number | null;
  payment_id: number | null;
  items: {
    order_item_id: number;
    product_id: number | null;
    quantity: number;
    price_at_purchase: number;
    line_total: number;
    product_name: string | null;
    product_image_url: string | null;
  }[];
};

function num(v: string | number | undefined | null): number {
  if (v === undefined || v === null) return 0;
  return typeof v === "number" ? v : Number.parseFloat(String(v)) || 0;
}

export async function GET() {
  const validation = await guardRoute(requireAuth, false);
  if (validation) return validation;

  const claims = await getAuthClaims();
  if (!claims) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const userId = String(claims.userId).trim();

  try {
    const orders = (await query_db(
      `
      SELECT
        order_id,
        user_id,
        order_status,
        payment_status,
        total_amount,
        order_date,
        shipping_address_id,
        billing_address_id,
        payment_id
      FROM orders
      WHERE user_id = ?
      ORDER BY order_date DESC, order_id DESC
    `,
      [userId]
    )) as OrderRow[];

    if (orders.length === 0) {
      return NextResponse.json({ success: true, data: [] as OrderWithItems[] });
    }

    const orderIds = orders.map((o) => o.order_id);
    const placeholders = orderIds.map(() => "?").join(",");

    const itemRows = (await query_db(
      `
      SELECT
        oi.order_item_id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase,
        oi.subtotal,
        p.name AS product_name,
        p.image_url AS product_image_url
      FROM order_items oi
      LEFT JOIN products p ON p.product_id = oi.product_id
      WHERE oi.order_id IN (${placeholders})
      ORDER BY oi.order_id ASC, oi.order_item_id ASC
    `,
      orderIds
    )) as OrderItemRow[];

    const byOrder = new Map<number, OrderItemRow[]>();
    for (const row of itemRows) {
      const list = byOrder.get(row.order_id) ?? [];
      list.push(row);
      byOrder.set(row.order_id, list);
    }

    const data: OrderWithItems[] = orders.map((o) => {
      const rawItems = byOrder.get(o.order_id) ?? [];
      const items = rawItems.map((r) => {
        const price = num(r.price_at_purchase);
        const line = r.subtotal !== undefined && r.subtotal !== null ? num(r.subtotal) : price * r.quantity;
        return {
          order_item_id: r.order_item_id,
          product_id: r.product_id,
          quantity: r.quantity,
          price_at_purchase: price,
          line_total: line,
          product_name: r.product_name,
          product_image_url: r.product_image_url,
        };
      });

      const orderDate =
        o.order_date instanceof Date ? o.order_date.toISOString() : String(o.order_date);

      return {
        order_id: o.order_id,
        user_id: o.user_id,
        order_status: o.order_status,
        payment_status: o.payment_status,
        total_amount: num(o.total_amount),
        order_date: orderDate,
        shipping_address_id: o.shipping_address_id,
        billing_address_id: o.billing_address_id,
        payment_id: o.payment_id,
        items,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load orders",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
