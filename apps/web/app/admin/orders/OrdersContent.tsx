import { getOrders, getOrderStats } from "@/actions/orderActions";
import { getContactInfo } from "@/actions/storeConfigActions";
import { formatPrice } from "@/lib/utils";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ShoppingBag, DollarSign, Clock, Truck } from "lucide-react";
import { Suspense } from "react";
import { StatsPeriodToggle } from "@/components/admin/StatsPeriodToggle";

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDir?: string;
  period?: string;
}>;

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

export async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const { status, q, page, pageSize, sortBy, sortDir, period } = await searchParams;

  const validPeriod = period === "7d" || period === "30d" ? period : "today";

  const [ordersResult, statsResult, contactInfo] = await Promise.all([
    getOrders({
      status,
      search: q,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 25,
      sortBy: (sortBy as any) ?? "createdAt",
      sortDir: (sortDir as any) ?? "desc",
    }),
    getOrderStats(validPeriod),
    getContactInfo(),
  ]);

  const orders = ordersResult.success ? (ordersResult.data?.orders ?? []) : [];
  const totalCount = ordersResult.success ? (ordersResult.data?.totalCount ?? 0) : 0;
  const stats = statsResult.success ? statsResult.data : null;
  const activeStatus = status ?? "ALL";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="-mt-2 text-sm text-[var(--color-muted)]">
          {stats?.total ?? 0} order{(stats?.total ?? 0) !== 1 ? "s" : ""}{" "}
          {validPeriod === "today" ? "today" : validPeriod === "7d" ? "in the last 7 days" : "in the last 30 days"}
        </p>
        <Suspense>
          <StatsPeriodToggle />
        </Suspense>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
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

      {/* Table */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-16 text-center text-[var(--color-muted)] print:hidden">
          {activeStatus !== "ALL" || q
            ? "No orders match your filters."
            : "No orders yet. Orders will appear here when customers check out."}
        </div>
      ) : (
        <OrdersTable orders={orders} totalCount={totalCount} storeInfo={contactInfo} />
      )}
    </>
  );
}
