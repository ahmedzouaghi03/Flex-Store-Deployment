import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getOrderByNumber,
  getOrderNavigation,
  getCustomerOrderCount,
} from "@/actions/orderActions";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderNotesCard } from "@/components/admin/OrderNotesCard";
import { OrderEditableSection } from "@/components/admin/OrderEditableSection";
import { ChevronLeft, ChevronRight, User, MapPin, Phone, Mail, Users } from "lucide-react";

export async function OrderDetailContent({ publicId }: { publicId: string }) {
  const result = await getOrderByNumber(publicId);
  if (!result.success || !result.data) notFound();

  const order = result.data;

  const [navResult, customerOrderCount] = await Promise.all([
    getOrderNavigation(order.createdAt),
    getCustomerOrderCount(order.customerPhone),
  ]);
  const nav = navResult.success ? navResult.data : null;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1">
          <Link
            href={nav?.prevOrderNumber ? `/admin/orders/${nav.prevOrderNumber}` : "#"}
            aria-disabled={!nav?.prevOrderNumber}
            title="Older order"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] transition ${
              nav?.prevOrderNumber
                ? "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                : "pointer-events-none text-[var(--color-border)]"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <p className="text-sm text-[var(--color-muted)]">
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
          <Link
            href={nav?.nextOrderNumber ? `/admin/orders/${nav.nextOrderNumber}` : "#"}
            aria-disabled={!nav?.nextOrderNumber}
            title="Newer order"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] transition ${
              nav?.nextOrderNumber
                ? "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                : "pointer-events-none text-[var(--color-border)]"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <OrderEditableSection
          orderId={order.id}
          items={order.items}
          subtotal={order.subtotal}
          shippingCost={order.shippingCost}
          discountType={order.discountType}
          discountValue={order.discountValue}
          discountAmount={order.discountAmount}
          total={order.total}
        />

        {/* Customer info sidebar */}
        <div className="space-y-4">
          <OrderNotesCard orderId={order.id} initialNotes={order.notes} />

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
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Order History</dt>
                <dd className="mt-0.5">
                  <Link
                    href={`/admin/orders?q=${encodeURIComponent(order.customerPhone)}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    <Users size={13} />
                    {customerOrderCount} order{customerOrderCount !== 1 ? "s" : ""} from this customer
                  </Link>
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
    </>
  );
}
