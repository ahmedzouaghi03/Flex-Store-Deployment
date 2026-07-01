"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import { getCurrentUser } from "@/lib/session";
import type { ActionResult, CreateOrderInput, SerializedOrder, OrderStatistics } from "@/types";

function generateOrderNumber(): string {
  return "FLEX-" + randomBytes(4).toString("hex").toUpperCase();
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  try {
    if (!input.customerName.trim()) return { success: false, error: "Name is required" };
    if (!input.customerPhone.trim()) return { success: false, error: "Phone is required" };
    if (!input.address?.trim()) return { success: false, error: "Address is required" };
    if (!input.items.length) return { success: false, error: "Cart is empty" };

    const variantIds = input.items.map((i) => i.variantId);
    const variants = await db.productColorSize.findMany({
      where: { id: { in: variantIds } },
      select: {
        id: true,
        size: true,
        stock: true,
        priceOverride: true,
        color: {
          select: {
            id: true,
            name: true,
            productId: true,
            product: {
              select: { id: true, name: true, basePrice: true, isPublished: true, colors: { select: { images: { orderBy: { order: "asc" }, take: 1, select: { url: true } } }, take: 1 } },
            },
          },
        },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of input.items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) return { success: false, error: "One or more items are no longer available" };
      if (!variant.color.product.isPublished)
        return { success: false, error: "One or more items are no longer available" };
      if (variant.stock < item.quantity)
        return { success: false, error: `Insufficient stock for ${variant.color.product.name} (${variant.size})` };
    }

    const settingsRow = await db.storeSettings.findFirst({ select: { deliveryFee: true } });
    const deliveryFee = settingsRow ? Number(settingsRow.deliveryFee) : 0;

    const subtotal = input.items.reduce((sum, item) => {
      const v = variantMap.get(item.variantId)!;
      const price = v.priceOverride != null ? Number(v.priceOverride) : Number(v.color.product.basePrice);
      return sum + price * item.quantity;
    }, 0);
    const total = subtotal + deliveryFee;

    const currentUser = await getCurrentUser();

    const order = await db.$transaction(async (tx) => {
      const orderNumber = generateOrderNumber();

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName.trim(),
          customerPhone: input.customerPhone.trim(),
          customerEmail: input.customerEmail?.trim() || null,
          address: input.address.trim(),
          city: input.city?.trim() || null,
          subtotal,
          shippingCost: deliveryFee,
          total,
          userId: currentUser?.id,
          items: {
            create: input.items.map((item) => {
              const v = variantMap.get(item.variantId)!;
              const unitPrice =
                v.priceOverride != null ? Number(v.priceOverride) : Number(v.color.product.basePrice);
              const productImage = v.color.product.colors[0]?.images[0]?.url ?? null;
              return {
                variantId: item.variantId,
                productId: v.color.productId,
                productName: v.color.product.name,
                colorName: v.color.name,
                size: v.size,
                productImage,
                unitPrice,
                totalPrice: unitPrice * item.quantity,
                quantity: item.quantity,
              };
            }),
          },
        },
      });

      // Decrement stock
      for (const item of input.items) {
        await tx.productColorSize.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Save address to address book
      if (currentUser?.id && input.address.trim() && input.city?.trim()) {
        const existing = await tx.address.findFirst({
          where: {
            userId: currentUser.id,
            address: { equals: input.address.trim(), mode: "insensitive" },
            city: { equals: input.city.trim(), mode: "insensitive" },
          },
        });
        if (!existing) {
          await tx.address.create({
            data: {
              userId: currentUser.id,
              address: input.address.trim(),
              city: input.city.trim(),
              phone: input.customerPhone.trim(),
            },
          });
        }
      }

      return newOrder;
    });

    revalidatePath("/admin/orders");
    revalidatePath("/shop");
    return { success: true, data: { orderId: order.id, orderNumber: order.orderNumber } };
  } catch (error) {
    console.error("[ORDER] create error:", error);
    return { success: false, error: "Failed to place order. Please try again." };
  }
}

export async function getOrderStats(): Promise<ActionResult<OrderStatistics>> {
  try {
    const [total, revenue, byStatus] = await Promise.all([
      db.order.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    return {
      success: true,
      data: {
        total,
        totalRevenue: Number(revenue._sum.total ?? 0),
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
}): Promise<ActionResult<SerializedOrder[]>> {
  try {
    const search = params?.search?.trim();
    const orders = await db.order.findMany({
      where: {
        ...(params?.status && params.status !== "ALL" ? { status: params.status as any } : {}),
        ...(search
          ? {
              OR: [
                { customerName: { contains: search, mode: "insensitive" } },
                { customerEmail: { contains: search, mode: "insensitive" } },
                { customerPhone: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { orderNumber: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return {
      success: true,
      data: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail,
        address: o.address,
        city: o.city,
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        total: Number(o.total),
        status: o.status,
        notes: o.notes,
        userId: o.userId,
        items: o.items.map((i) => ({
          id: i.id,
          variantId: i.variantId,
          productId: i.productId,
          productName: i.productName,
          colorName: i.colorName,
          size: i.size,
          productImage: i.productImage,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
          quantity: i.quantity,
        })),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[ORDER] list error:", error);
    return { success: false, error: "Failed to load orders" };
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<ActionResult<SerializedOrder>> {
  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) return { success: false, error: "Order not found" };

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        address: order.address,
        city: order.city,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
        status: order.status,
        notes: order.notes,
        userId: order.userId,
        items: order.items.map((i) => ({
          id: i.id,
          variantId: i.variantId,
          productId: i.productId,
          productName: i.productName,
          colorName: i.colorName,
          size: i.size,
          productImage: i.productImage,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
          quantity: i.quantity,
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[ORDER] get error:", error);
    return { success: false, error: "Failed to load order" };
  }
}

export async function updateOrderStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
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
