"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";

import { bulkUpdateOrderStatus, bulkDeleteOrders, bulkAddOrderNote } from "@/actions/orderActions";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { ConfirmDialog } from "./ConfirmDialog";
import { PrintableOrders } from "./PrintableOrders";
import type { SerializedOrder, OrderStatus, ContactInfo } from "@/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

const PAGE_SIZES = [10, 25, 50, 100];

type SortField = "createdAt" | "customerName" | "total" | "status";

function BulkNoteDialog({
  count,
  isPending,
  onConfirm,
  onCancel,
}: {
  count: number;
  isPending: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <p className="text-sm font-bold text-[var(--color-text)]">
            Add note to {count} order{count !== 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            This replaces any existing note on the selected orders.
          </p>
          <textarea
            autoFocus
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note…"
            className="mt-3 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={isPending}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadOrdersCsv(rows: SerializedOrder[]) {
  const headers = [
    "Order Number", "Customer Name", "Phone", "Email", "City",
    "Items", "Subtotal", "Discount", "Shipping", "Total", "Status", "Date",
  ];
  const lines = [headers.map(csvEscape).join(",")];
  for (const o of rows) {
    lines.push(
      [
        o.orderNumber,
        o.customerName,
        o.customerPhone,
        o.customerEmail ?? "",
        o.city ?? "",
        String(o.items.reduce((s, i) => s + i.quantity, 0)),
        o.subtotal.toFixed(3),
        o.discountAmount.toFixed(3),
        o.shippingCost.toFixed(3),
        o.total.toFixed(3),
        o.status,
        new Date(o.createdAt).toISOString(),
      ]
        .map((f) => csvEscape(String(f)))
        .join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function OrdersTable({
  orders: initialOrders,
  totalCount,
  storeInfo,
}: {
  orders: SerializedOrder[];
  totalCount: number;
  storeInfo: ContactInfo;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // local copy so bulk actions can reflect instantly, without waiting on a full re-fetch
  const [orders, setOrders] = useState(initialOrders);
  useEffect(() => setOrders(initialOrders), [initialOrders]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkNoteOpen, setBulkNoteOpen] = useState(false);
  const [printOrders, setPrintOrders] = useState<SerializedOrder[] | null>(null);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Number(searchParams.get("pageSize") ?? "25");
  const sortBy = (searchParams.get("sortBy") as SortField | null) ?? "createdAt";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc" | null) ?? "desc";
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const allSelected = orders.length > 0 && selected.size === orders.length;

  useEffect(() => {
    if (!printOrders) return;
    const t = setTimeout(() => {
      window.print();
      setPrintOrders(null);
    }, 50);
    return () => clearTimeout(t);
  }, [printOrders]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSort(field: SortField) {
    const nextDir = sortBy === field && sortDir === "desc" ? "asc" : "desc";
    updateParams({ sortBy: field, sortDir: nextDir });
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));
  }

  const selectedOrders = orders.filter((o) => selected.has(o.id));

  function handleBulkStatus(status: OrderStatus) {
    const ids = Array.from(selected);
    const previous = orders;
    // reflect the change immediately — the row's status select is keyed on
    // `${id}-${status}` below, so it remounts with the right value right away
    setOrders((prev) => prev.map((o) => (selected.has(o.id) ? { ...o, status } : o)));
    startTransition(async () => {
      const res = await bulkUpdateOrderStatus(ids, status);
      if (!res.success) setOrders(previous);
      router.refresh();
    });
  }

  function handleBulkDelete() {
    setBulkDeleteConfirm(false);
    const ids = Array.from(selected);
    const previous = orders;
    setOrders((prev) => prev.filter((o) => !selected.has(o.id)));
    setSelected(new Set());
    startTransition(async () => {
      const res = await bulkDeleteOrders(ids);
      if (!res.success) setOrders(previous);
      router.refresh();
    });
  }

  function handleBulkNote(note: string) {
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkAddOrderNote(ids, note);
      setBulkNoteOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 print:space-y-0">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-4 py-3 print:hidden">
          <span className="text-sm font-semibold text-[var(--color-text)]">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              disabled={isPending}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleBulkStatus(e.target.value as OrderStatus);
                e.target.value = "";
              }}
              className="rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text)] outline-none disabled:opacity-40"
            >
              <option value="" disabled>
                Change status…
              </option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setBulkNoteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
            >
              <StickyNote className="h-3.5 w-3.5" />
              Add note
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => downloadOrdersCsv(selectedOrders)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setPrintOrders(selectedOrders)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setBulkDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              title="Clear selection"
              className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white print:hidden">
        {/* Desktop table — lg and up */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded accent-[var(--color-accent)]"
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Order
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  <button type="button" onClick={() => handleSort("customerName")} className="inline-flex items-center gap-1 hover:text-[var(--color-text)]">
                    Customer <SortIcon field="customerName" />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Items
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  <button type="button" onClick={() => handleSort("total")} className="inline-flex items-center gap-1 hover:text-[var(--color-text)]">
                    Total <SortIcon field="total" />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  <button type="button" onClick={() => handleSort("status")} className="inline-flex items-center gap-1 hover:text-[var(--color-text)]">
                    Status <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  <button type="button" onClick={() => handleSort("createdAt")} className="inline-flex items-center gap-1 hover:text-[var(--color-text)]">
                    Date <SortIcon field="createdAt" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {orders.map((order) => {
                const href = `/admin/orders/${order.orderNumber}`;
                return (
                  <tr key={order.id} className="transition hover:bg-[var(--color-bg)]/60">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="h-4 w-4 rounded accent-[var(--color-accent)]"
                      />
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-4">
                        <span className="font-mono text-xs font-bold text-[var(--color-muted)]">
                          {order.orderNumber}
                        </span>
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-4">
                        <p className="font-semibold text-[var(--color-text)]">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-xs text-[var(--color-muted)]">{order.customerEmail}</p>
                        )}
                        <p className="text-xs text-[var(--color-muted)]">{order.customerPhone}</p>
                        {order.city && <p className="text-xs text-[var(--color-muted)]">{order.city}</p>}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-4 text-[var(--color-muted)]">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-4 font-bold text-[var(--color-text)]">
                        {formatPrice(order.total)}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusSelect
                        key={`${order.id}-${order.status}`}
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-5 py-4 text-xs text-[var(--color-muted)]">
                        {new Date(order.createdAt).toLocaleDateString("fr-TN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile/tablet card list — below lg */}
        <div className="divide-y divide-[var(--color-border)] lg:hidden">
          {orders.map((order) => {
            const href = `/admin/orders/${order.orderNumber}`;
            return (
              <div key={order.id} className="flex gap-3 p-4">
                <input
                  type="checkbox"
                  checked={selected.has(order.id)}
                  onChange={() => toggleSelect(order.id)}
                  className="mt-1 h-4 w-4 shrink-0 rounded accent-[var(--color-accent)]"
                />
                <div className="min-w-0 flex-1">
                  <Link href={href} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-[var(--color-muted)]">
                        {new Date(order.createdAt).toLocaleDateString("fr-TN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="shrink-0 font-bold text-[var(--color-text)]">{formatPrice(order.total)}</p>
                    </div>
                    <p className="font-mono text-xs font-bold text-[var(--color-muted)]">{order.orderNumber}</p>
                  </Link>

                  <div className="mt-2">
                    <OrderStatusSelect
                      key={`${order.id}-${order.status}`}
                      orderId={order.id}
                      currentStatus={order.status}
                    />
                  </div>

                  <Link href={href} className="mt-2 block">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {order.customerName} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                    {order.city && <p className="text-xs text-[var(--color-muted)]">{order.city}</p>}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <span>
              Showing {orders.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount}
            </span>
            <select
              value={pageSize}
              onChange={(e) => updateParams({ pageSize: e.target.value, page: "1" })}
              className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--color-text)] outline-none"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="rounded-lg border border-[var(--color-border)] bg-white p-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-semibold text-[var(--color-text)]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="rounded-lg border border-[var(--color-border)] bg-white p-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Print-only area — one order per page, no admin chrome */}
      {printOrders && <PrintableOrders orders={printOrders} storeInfo={storeInfo} />}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${selected.size} order${selected.size !== 1 ? "s" : ""}?`}
          message="This permanently removes the selected orders. This cannot be undone."
          isPending={isPending}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />
      )}

      {bulkNoteOpen && (
        <BulkNoteDialog
          count={selected.size}
          isPending={isPending}
          onConfirm={handleBulkNote}
          onCancel={() => setBulkNoteOpen(false)}
        />
      )}
    </div>
  );
}
