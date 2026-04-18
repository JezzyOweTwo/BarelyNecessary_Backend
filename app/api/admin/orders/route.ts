export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { guardRoute } from "@/lib/guard_route";
import { getAuthClaims, requireAuth } from "@/lib/validators";

type OrderRow = {
  order_id: number;
  user_id: string;
  customer_name: string;
  customer_email: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  order_date: string;
  shipping_address: string | null;
  billing_address: string | null;
  payment_summary: string | null;
};

type OrderItemRow = {
  order_item_id: number;
  order_id: number;
  product_id: number | null;
  quantity: number;
  price_at_purchase: number;
  line_total: number;
  product_name: string | null;
};

type AdminOrder = OrderRow & {
  items: OrderItemRow[];
};

export async function GET() {
  const validation = await guardRoute(requireAuth, false);
  if (validation) return validation;

  const claims = await getAuthClaims();
  if (!claims) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (claims.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const orders = await query_db<OrderRow>(
      `
      SELECT
        o.order_id,
        o.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
        u.email AS customer_email,
        o.order_status,
        o.payment_status,
        o.total_amount,
        o.order_date,
        CONCAT_WS(', ',
          sa.street,
          sa.city,
          sa.province,
          sa.postal_code,
          sa.country
        ) AS shipping_address,
        CONCAT_WS(', ',
          ba.street,
          ba.city,
          ba.province,
          ba.postal_code,
          ba.country
        ) AS billing_address,
        CASE
          WHEN pm.payment_id IS NULL THEN NULL
          ELSE CONCAT(
            COALESCE(pm.card_brand, 'Card'),
            ' ending in ',
            pm.card_last4,
            ' (',
            LPAD(pm.expiry_month, 2, '0'),
            '/',
            pm.expiry_year,
            ')'
          )
        END AS payment_summary
      FROM orders o
      INNER JOIN users u
        ON o.user_id = u.user_id
      LEFT JOIN addresses sa
        ON o.shipping_address_id = sa.address_id
      LEFT JOIN addresses ba
        ON o.billing_address_id = ba.address_id
      LEFT JOIN payment_methods pm
        ON o.payment_id = pm.payment_id
      ORDER BY o.order_date DESC
      `
    );

    const orderItems = await query_db<OrderItemRow>(
      `
      SELECT
        oi.order_item_id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase,
        oi.subtotal AS line_total,
        p.name AS product_name
      FROM order_items oi
      LEFT JOIN products p
        ON oi.product_id = p.product_id
      ORDER BY oi.order_id DESC, oi.order_item_id ASC
      `
    );

    const ordersWithItems: AdminOrder[] = orders.map((order: OrderRow) => ({
      ...order,
      items: orderItems.filter((item: OrderItemRow) => item.order_id === order.order_id),
    }));

    return NextResponse.json({
      success: true,
      data: ordersWithItems,
    });
  } catch (error) {
    console.error("Failed to load admin orders:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin orders.",
      },
      { status: 500 }
    );
  }
}