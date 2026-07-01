import { Suspense } from "react";
import { getOrders, getOrderStats } from "@/actions/orderActions";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrdersFilters } from "@/components/admin/OrdersFilters";
import { ClickableRow } from "@/components/admin/ClickableRow";
import { ShoppingBag, DollarSign, Clock, Truck } from "lucide-react";

type SearchParams = Promise<{ status?: string; q?: string }>;

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-muted)]">{label}</p>
        <div className={`rounded-xl p-2 ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">{value}</p>
    </div>
  );
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { status, q } = await searchParams;

  const [ordersResult, statsResult] = await Promise.all([
    getOrders({ status, search: q }),
    getOrderStats(),
  ]);

  const orders = ordersResult.success ? (ordersResult.data ?? []) : [];
  const stats = statsResult.success ? statsResult.data : null;
  const activeStatus = status ?? "ALL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Orders</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {stats?.total ?? 0} total order{(stats?.total ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Orders"
            value={String(stats.total)}
            icon={ShoppingBag}
            color="bg-[var(--color-bg)] text-[var(--color-text)]"
          />
          <StatCard
            label="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={DollarSign}
            color="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Pending"
            value={String(stats.byStatus["PENDING"] ?? 0)}
            icon={Clock}
            color="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="In Transit"
            value={String(
              (stats.byStatus["CONFIRMED"] ?? 0) + (stats.byStatus["SHIPPED"] ?? 0),
            )}
            icon={Truck}
            color="bg-indigo-50 text-indigo-700"
          />
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
        <Suspense>
          <OrdersFilters />
        </Suspense>
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-16 text-center text-[var(--color-muted)]">
          {activeStatus !== "ALL" || q
            ? "No orders match your filters."
            : "No orders yet. Orders will appear here when customers check out."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <tr>
                  {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {orders.map((order) => (
                  <ClickableRow
                    key={order.id}
                    href={`/admin/orders/${order.orderNumber}`}
                    className="transition hover:bg-[var(--color-bg)]/60"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-[var(--color-muted)]">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--color-text)]">{order.customerName}</p>
                      {order.customerEmail && (
                        <p className="text-xs text-[var(--color-muted)]">{order.customerEmail}</p>
                      )}
                      <p className="text-xs text-[var(--color-muted)]">{order.customerPhone}</p>
                      {order.city && (
                        <p className="text-xs text-[var(--color-muted)]">{order.city}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-muted)]">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-4 font-bold text-[var(--color-text)]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--color-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("fr-TN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </ClickableRow>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[var(--color-border)] px-5 py-3 text-xs text-[var(--color-muted)]">
            Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
            {(activeStatus !== "ALL" || q) && " (filtered)"}
          </div>
        </div>
      )}
    </div>
  );
}
