"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type { CartItem, ActionResult } from "@/types";

function generatePublicId(): string {
  return randomBytes(6).toString("base64url"); // 8 URL-safe chars
}

export type CustomerInfo = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
};

export type OrderSummary = {
  id: string;
  publicId: string | null;
  createdAt: Date;
  status: string;
  totalCents: number;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  itemCount: number;
};

export async function createOrder(
  customerInfo: CustomerInfo,
  cartItems: CartItem[],
): Promise<ActionResult<{ orderId: string; publicId: string | null }>> {
  try {
    if (!customerInfo.name.trim()) return { success: false, error: "Name is required" };
    if (!cartItems.length) return { success: false, error: "Cart is empty" };

    const totalCents = cartItems.reduce(
      (sum, i) => sum + i.priceCents * i.quantity,
      0,
    );

    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          publicId: generatePublicId(),
          name: customerInfo.name.trim(),
          email: customerInfo.email?.trim() || null,
          phone: customerInfo.phone?.trim() || null,
          address: customerInfo.address?.trim() || null,
          city: customerInfo.city?.trim() || null,
          totalCents,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.name,
              imageUrl: item.imageUrl,
              size: item.size,
              colorName: item.colorName,
              priceCents: item.priceCents,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Decrement stock for each ordered size
      for (const item of cartItems) {
        if (!item.size) continue;
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { sizes: true },
        });
        if (!product) continue;
        const updatedSizes = product.sizes.map((raw) => {
          try {
            const s = JSON.parse(raw) as { size: string; stock: number };
            if (s.size === item.size) {
              return JSON.stringify({ ...s, stock: Math.max(0, s.stock - item.quantity) });
            }
            return raw;
          } catch {
            return raw;
          }
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { sizes: updatedSizes },
        });
      }

      return newOrder;
    });

    revalidatePath("/admin/orders");
    revalidatePath("/shop");
    return { success: true, data: { orderId: order.id, publicId: order.publicId } };
  } catch (error) {
    console.error("[ORDER] create error:", error);
    return { success: false, error: "Failed to place order. Please try again." };
  }
}

export type OrderStats = {
  total: number;
  totalRevenueCents: number;
  byStatus: Partial<Record<string, number>>;
};

export async function getOrderStats(): Promise<ActionResult<OrderStats>> {
  try {
    const [total, revenue, byStatus] = await Promise.all([
      db.order.count(),
      db.order.aggregate({ _sum: { totalCents: true } }),
      db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    return {
      success: true,
      data: {
        total,
        totalRevenueCents: revenue._sum.totalCents ?? 0,
        byStatus: Object.fromEntries(byStatus.map((g) => [g.status, g._count._all])),
      },
    };
  } catch (error) {
    console.error("[ORDER] stats error:", error);
    return { success: false, error: "Failed to load stats" };
  }
}

export async function getOrders(params?: {
  status?: string;
  search?: string;
}): Promise<ActionResult<OrderSummary[]>> {
  try {
    const search = params?.search?.trim();
    const orders = await db.order.findMany({
      where: {
        ...(params?.status && params.status !== "ALL"
          ? { status: params.status as any }
          : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    });

    return {
      success: true,
      data: orders.map((o) => ({
        id: o.id,
        publicId: o.publicId,
        createdAt: o.createdAt,
        status: o.status,
        totalCents: o.totalCents,
        name: o.name,
        email: o.email,
        phone: o.phone,
        city: o.city,
        itemCount: o._count.items,
      })),
    };
  } catch (error) {
    console.error("[ORDER] list error:", error);
    return { success: false, error: "Failed to load orders" };
  }
}

export type OrderDetail = {
  id: string;
  publicId: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  totalCents: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  items: {
    id: string;
    productId: string;
    productName: string;
    imageUrl: string | null;
    size: string | null;
    colorName: string | null;
    priceCents: number;
    quantity: number;
  }[];
};

export async function getOrderByPublicId(publicId: string): Promise<ActionResult<OrderDetail>> {
  try {
    const order = await db.order.findUnique({
      where: { publicId },
      include: { items: true },
    });
    if (!order) return { success: false, error: "Order not found" };
    return { success: true, data: order };
  } catch (error) {
    console.error("[ORDER] get error:", error);
    return { success: false, error: "Failed to load order" };
  }
}

export async function updateOrderStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
): Promise<ActionResult> {
  try {
    await db.order.update({ where: { id }, data: { status } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("[ORDER] update status error:", error);
    return { success: false, error: "Failed to update order status" };
  }
}
