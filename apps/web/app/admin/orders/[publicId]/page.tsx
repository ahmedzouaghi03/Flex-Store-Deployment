import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/actions/orderActions";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ArrowLeft, Package, User, MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";

type Props = { params: Promise<{ publicId: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { publicId } = await params;
  const result = await getOrderByNumber(publicId);

  if (!result.success || !result.data) notFound();

  const order = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
        >
          <ArrowLeft size={15} />
          Orders
        </Link>
        <span className="text-[var(--color-border)]">/</span>
        <span className="font-mono text-sm font-bold text-[var(--color-text)]">
          {order.orderNumber}
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("fr-TN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date(order.createdAt).toLocaleTimeString("fr-TN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
            <div className="border-b border-[var(--color-border)] px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                <Package size={15} />
                Items ({order.items.length})
              </h2>
            </div>
            <ul className="divide-y divide-[var(--color-border)]">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  {item.productImage ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)]">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--color-text)]">
                      {item.productName}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.colorName && <span>Color: {item.colorName}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[var(--color-text)]">
                      {formatPrice(item.totalPrice)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-[var(--color-muted)]">
                        {formatPrice(item.unitPrice)} each
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-muted)]">Subtotal</span>
                <span className="font-semibold text-[var(--color-text)]">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-muted)]">Delivery fee</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2">
                <span className="text-sm font-semibold text-[var(--color-text)]">Total</span>
                <span className="text-lg font-bold text-[var(--color-text)]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer info sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
              <User size={15} />
              Customer
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Name</dt>
                <dd className="mt-0.5 font-semibold text-[var(--color-text)]">{order.customerName}</dd>
              </div>
              {order.customerEmail && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Email</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-[var(--color-text)]">
                    <Mail size={13} className="text-[var(--color-muted)]" />
                    <a href={`mailto:${order.customerEmail}`} className="hover:underline">{order.customerEmail}</a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Phone</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-[var(--color-text)]">
                  <Phone size={13} className="text-[var(--color-muted)]" />
                  <a href={`tel:${order.customerPhone}`} className="hover:underline">{order.customerPhone}</a>
                </dd>
              </div>
            </dl>
          </div>

          {(order.address || order.city) && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                <MapPin size={15} />
                Delivery Address
              </h2>
              <address className="not-italic text-sm text-[var(--color-text)]">
                {order.address && <p>{order.address}</p>}
                {order.city && <p className="text-[var(--color-muted)]">{order.city}</p>}
              </address>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Order Info
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Order #</dt>
                <dd className="font-mono text-xs font-bold text-[var(--color-text)]">{order.orderNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Items</dt>
                <dd className="text-[var(--color-text)]">{order.items.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Last updated</dt>
                <dd className="text-[var(--color-text)]">
                  {new Date(order.updatedAt).toLocaleDateString("fr-TN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
