"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/actions/orderActions";

const STATUSES = [
  { value: "PENDING",   label: "Pending",   color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  { value: "CONFIRMED", label: "Confirmed", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "SHIPPED",   label: "Shipped",   color: "text-purple-700 bg-purple-50 border-purple-200" },
  { value: "DELIVERED", label: "Delivered", color: "text-green-700 bg-green-50 border-green-200" },
  { value: "CANCELLED", label: "Cancelled", color: "text-red-700 bg-red-50 border-red-200" },
  { value: "RETURNED",  label: "Returned",  color: "text-orange-700 bg-orange-50 border-orange-200" },
] as const;

type Status = (typeof STATUSES)[number]["value"];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState<Status>(currentStatus as Status);
  const [, startTransition] = useTransition();

  const current = STATUSES.find((s) => s.value === status);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Status;
    setStatus(next);
    startTransition(async () => {
      await updateOrderStatus(orderId, next);
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition cursor-pointer ${current?.color ?? "text-gray-700 bg-gray-50 border-gray-200"}`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
