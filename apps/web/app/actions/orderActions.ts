"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { db, OrderStatus as PrismaOrderStatus } from "@shoestore/db";
import { getCurrentUser } from "@/lib/session";
import type {
  ActionResult,
  CreateOrderInput,
  SerializedOrder,
  OrderStatistics,
  OrderStatus,
  DiscountType,
  OrdersPage,
} from "@/types";

function generateOrderNumber(): string {
  return "FLEX-" + randomBytes(4).toString("hex").toUpperCase();
}

function serializeOrder(order: any): SerializedOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    address: order.address,
    city: order.city,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discountType: order.discountType,
    discountValue: order.discountValue != null ? Number(order.discountValue) : null,
    discountAmount: Number(order.discountAmount),
    total: Number(order.total),
    status: order.status,
    notes: order.notes,
    userId: order.userId,
    items: order.items.map((i: any) => ({
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
  };
}

// recomputes subtotal/discountAmount/total for an order from its current items — call
// after any item add/remove/quantity/variant change, inside the same transaction.
async function recalcOrderTotals(tx: any, orderId: string) {
  const [items, order] = await Promise.all([
    tx.orderItem.findMany({ where: { orderId }, select: { totalPrice: true } }),
    tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { shippingCost: true, discountType: true, discountValue: true },
    }),
  ]);

  const subtotal = items.reduce((sum: number, i: any) => sum + Number(i.totalPrice), 0);

  let discountAmount = 0;
  if (order.discountType && order.discountValue != null) {
    discountAmount =
      order.discountType === "PERCENTAGE"
        ? subtotal * (Number(order.discountValue) / 100)
        : Math.min(Number(order.discountValue), subtotal);
  }

  const total = subtotal - discountAmount + Number(order.shippingCost);

  await tx.order.update({ where: { id: orderId }, data: { subtotal, discountAmount, total } });
  return { subtotal, discountAmount, total };
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

const REVENUE_STATUSES: PrismaOrderStatus[] = [
  PrismaOrderStatus.PENDING,
  PrismaOrderStatus.CONFIRMED,
  PrismaOrderStatus.PROCESSING,
  PrismaOrderStatus.SHIPPED,
  PrismaOrderStatus.DELIVERED,
];

function getPeriodStart(period: "today" | "7d" | "30d"): Date {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = period === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return start;
}

export async function getOrderStats(
  period: "today" | "7d" | "30d" = "today",
): Promise<ActionResult<OrderStatistics>> {
  try {
    const since = getPeriodStart(period);
    const where = { createdAt: { gte: since } };
    const [total, revenue, byStatus] = await Promise.all([
      db.order.count({ where }),
      db.order.aggregate({
        where: { ...where, status: { in: REVENUE_STATUSES } },
        _sum: { total: true },
      }),
      db.order.groupBy({ by: ["status"], where, _count: { _all: true } }),
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
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "customerName" | "total" | "status";
  sortDir?: "asc" | "desc";
}): Promise<ActionResult<OrdersPage>> {
  try {
    const search = params?.search?.trim();
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 25));
    const sortBy = params?.sortBy ?? "createdAt";
    const sortDir = params?.sortDir ?? "desc";

    const where = {
      ...(params?.status && params.status !== "ALL" ? { status: params.status as any } : {}),
      ...(search
        ? {
            OR: [
              { customerName: { contains: search, mode: "insensitive" as const } },
              { customerEmail: { contains: search, mode: "insensitive" as const } },
              { customerPhone: { contains: search, mode: "insensitive" as const } },
              { city: { contains: search, mode: "insensitive" as const } },
              { orderNumber: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: true },
      }),
      db.order.count({ where }),
    ]);

    return { success: true, data: { orders: orders.map(serializeOrder), totalCount } };
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

    return { success: true, data: serializeOrder(order) };
  } catch (error) {
    console.error("[ORDER] get error:", error);
    return { success: false, error: "Failed to load order" };
  }
}

export async function getOrderNavigation(
  createdAt: string,
): Promise<ActionResult<{ prevOrderNumber: string | null; nextOrderNumber: string | null }>> {
  try {
    const current = new Date(createdAt);
    const [prev, next] = await Promise.all([
      db.order.findFirst({
        where: { createdAt: { lt: current } },
        orderBy: { createdAt: "desc" },
        select: { orderNumber: true },
      }),
      db.order.findFirst({
        where: { createdAt: { gt: current } },
        orderBy: { createdAt: "asc" },
        select: { orderNumber: true },
      }),
    ]);
    return {
      success: true,
      data: { prevOrderNumber: prev?.orderNumber ?? null, nextOrderNumber: next?.orderNumber ?? null },
    };
  } catch (error) {
    console.error("[ORDER] navigation error:", error);
    return { success: false, error: "Failed to load navigation" };
  }
}

export async function getCustomerOrderCount(phone: string): Promise<number> {
  try {
    return await db.order.count({ where: { customerPhone: phone } });
  } catch {
    return 0;
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  try {
    await db.order.update({ where: { id }, data: { status } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("[ORDER] update status error:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function updateOrderNotes(id: string, notes: string): Promise<ActionResult> {
  try {
    await db.order.update({ where: { id }, data: { notes: notes.trim() || null } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("[ORDER] updateNotes error:", error);
    return { success: false, error: "Failed to save note" };
  }
}

export async function updateOrderDiscount(
  id: string,
  data: { type: DiscountType | null; value: number | null },
): Promise<ActionResult<{ discountAmount: number; total: number }>> {
  try {
    const order = await db.order.findUnique({
      where: { id },
      select: { subtotal: true, shippingCost: true },
    });
    if (!order) return { success: false, error: "Order not found" };

    const subtotal = Number(order.subtotal);
    const shippingCost = Number(order.shippingCost);

    let discountAmount = 0;
    if (data.type && data.value != null && data.value > 0) {
      if (data.type === "PERCENTAGE") {
        if (data.value > 100) return { success: false, error: "Percentage cannot exceed 100" };
        discountAmount = subtotal * (data.value / 100);
      } else {
        discountAmount = Math.min(data.value, subtotal);
      }
    }

    const total = subtotal - discountAmount + shippingCost;

    await db.order.update({
      where: { id },
      data: {
        discountType: data.type,
        discountValue: data.type ? data.value : null,
        discountAmount,
        total,
      },
    });

    revalidatePath("/admin/orders");
    return { success: true, data: { discountAmount, total } };
  } catch (error) {
    console.error("[ORDER] updateDiscount error:", error);
    return { success: false, error: "Failed to update discount" };
  }
}

type ItemTotals = { subtotal: number; discountAmount: number; total: number };

export async function addOrderItem(
  orderId: string,
  variantId: string,
  quantity: number,
): Promise<ActionResult<ItemTotals>> {
  try {
    if (quantity < 1) return { success: false, error: "Quantity must be at least 1" };

    const variant = await db.productColorSize.findUnique({
      where: { id: variantId },
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
            images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
            product: { select: { id: true, name: true, basePrice: true } },
          },
        },
      },
    });
    if (!variant) return { success: false, error: "Variant not found" };
    if (variant.stock < quantity) return { success: false, error: "Not enough stock available" };

    const unitPrice =
      variant.priceOverride != null ? Number(variant.priceOverride) : Number(variant.color.product.basePrice);

    const result = await db.$transaction(async (tx) => {
      await tx.orderItem.create({
        data: {
          orderId,
          variantId: variant.id,
          productId: variant.color.productId,
          productName: variant.color.product.name,
          colorName: variant.color.name,
          size: variant.size,
          productImage: variant.color.images[0]?.url ?? null,
          unitPrice,
          totalPrice: unitPrice * quantity,
          quantity,
        },
      });
      await tx.productColorSize.update({ where: { id: variant.id }, data: { stock: { decrement: quantity } } });
      return recalcOrderTotals(tx, orderId);
    });

    revalidatePath("/admin/orders");
    return { success: true, data: result };
  } catch (error) {
    console.error("[ORDER] addOrderItem error:", error);
    return { success: false, error: "Failed to add item" };
  }
}

export async function updateOrderItemQuantity(
  orderItemId: string,
  quantity: number,
): Promise<ActionResult<ItemTotals>> {
  try {
    if (quantity < 1) return { success: false, error: "Quantity must be at least 1 — remove the item instead" };

    const item = await db.orderItem.findUnique({ where: { id: orderItemId } });
    if (!item) return { success: false, error: "Item not found" };

    const delta = quantity - item.quantity;
    if (delta > 0) {
      const variant = await db.productColorSize.findUnique({
        where: { id: item.variantId },
        select: { stock: true },
      });
      if (!variant || variant.stock < delta) return { success: false, error: "Not enough stock available" };
    }

    const unitPrice = Number(item.unitPrice);
    const result = await db.$transaction(async (tx) => {
      await tx.orderItem.update({
        where: { id: orderItemId },
        data: { quantity, totalPrice: unitPrice * quantity },
      });
      if (delta !== 0) {
        await tx.productColorSize.update({
          where: { id: item.variantId },
          data: { stock: { decrement: delta } },
        });
      }
      return recalcOrderTotals(tx, item.orderId);
    });

    revalidatePath("/admin/orders");
    return { success: true, data: result };
  } catch (error) {
    console.error("[ORDER] updateOrderItemQuantity error:", error);
    return { success: false, error: "Failed to update quantity" };
  }
}

export async function updateOrderItemVariant(
  orderItemId: string,
  newVariantId: string,
): Promise<ActionResult<ItemTotals>> {
  try {
    const item = await db.orderItem.findUnique({ where: { id: orderItemId } });
    if (!item) return { success: false, error: "Item not found" };
    if (item.variantId === newVariantId) return { success: false, error: "That's already the selected variant" };

    const newVariant = await db.productColorSize.findUnique({
      where: { id: newVariantId },
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
            images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
            product: { select: { id: true, name: true, basePrice: true } },
          },
        },
      },
    });
    if (!newVariant) return { success: false, error: "Variant not found" };
    if (newVariant.stock < item.quantity) return { success: false, error: "Not enough stock for this variant" };

    const unitPrice =
      newVariant.priceOverride != null ? Number(newVariant.priceOverride) : Number(newVariant.color.product.basePrice);

    const result = await db.$transaction(async (tx) => {
      await tx.orderItem.update({
        where: { id: orderItemId },
        data: {
          variantId: newVariant.id,
          productId: newVariant.color.productId,
          productName: newVariant.color.product.name,
          colorName: newVariant.color.name,
          size: newVariant.size,
          productImage: newVariant.color.images[0]?.url ?? null,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        },
      });
      // restore stock to the old variant, decrement the new one
      await tx.productColorSize.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
      await tx.productColorSize.update({
        where: { id: newVariant.id },
        data: { stock: { decrement: item.quantity } },
      });
      return recalcOrderTotals(tx, item.orderId);
    });

    revalidatePath("/admin/orders");
    return { success: true, data: result };
  } catch (error) {
    console.error("[ORDER] updateOrderItemVariant error:", error);
    return { success: false, error: "Failed to change variant" };
  }
}

export async function removeOrderItem(orderItemId: string): Promise<ActionResult<ItemTotals>> {
  try {
    const item = await db.orderItem.findUnique({ where: { id: orderItemId } });
    if (!item) return { success: false, error: "Item not found" };

    const remaining = await db.orderItem.count({ where: { orderId: item.orderId } });
    if (remaining <= 1) {
      return { success: false, error: "An order must have at least one item — cancel the order instead" };
    }

    const result = await db.$transaction(async (tx) => {
      await tx.orderItem.delete({ where: { id: orderItemId } });
      await tx.productColorSize.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
      return recalcOrderTotals(tx, item.orderId);
    });

    revalidatePath("/admin/orders");
    return { success: true, data: result };
  } catch (error) {
    console.error("[ORDER] removeOrderItem error:", error);
    return { success: false, error: "Failed to remove item" };
  }
}

export async function bulkUpdateOrderStatus(ids: string[], status: OrderStatus): Promise<ActionResult> {
  try {
    await db.order.updateMany({ where: { id: { in: ids } }, data: { status } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("[ORDER] bulkUpdateOrderStatus error:", error);
    return { success: false, error: "Failed to update orders" };
  }
}

export async function bulkDeleteOrders(ids: string[]): Promise<ActionResult> {
  try {
    await db.order.deleteMany({ where: { id: { in: ids } } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("[ORDER] bulkDeleteOrders error:", error);
    return { success: false, error: "Failed to delete orders" };
  }
}

export async function bulkAddOrderNote(ids: string[], note: string): Promise<ActionResult> {
  try {
    await db.order.updateMany({ where: { id: { in: ids } }, data: { notes: note.trim() || null } });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("[ORDER] bulkAddOrderNote error:", error);
    return { success: false, error: "Failed to add note" };
  }
}
