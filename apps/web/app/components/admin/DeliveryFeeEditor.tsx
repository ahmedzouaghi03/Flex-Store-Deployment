"use client";

import { useState, useTransition } from "react";
import { saveDeliveryFee } from "@/actions/storeConfigActions";
import { formatPrice } from "@/lib/utils";
import { Field, SaveButton, inp } from "./HeroTextEditor";

export function DeliveryFeeEditor({
  initialCents,
  onPreviewChange,
}: {
  initialCents: number;
  onPreviewChange?: (cents: number) => void;
}) {
  const [amount, setAmount] = useState((initialCents / 100).toString());
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(value: string) {
    setAmount(value);
    setSaved(false);
    const parsed = Math.round(Number(value) * 100);
    if (Number.isFinite(parsed) && parsed >= 0) onPreviewChange?.(parsed);
  }

  function handleSave() {
    setError("");
    const parsed = Math.round(Number(amount) * 100);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Enter a valid non-negative amount");
      return;
    }
    startTransition(async () => {
      const res = await saveDeliveryFee(parsed);
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  return (
    <div className="space-y-4">
      <Field label="Delivery fee (DT)">
        <input
          type="number"
          min={0}
          step="0.001"
          value={amount}
          onChange={(e) => handleChange(e.target.value)}
          className={inp}
        />
      </Field>
      <p className="text-xs text-[var(--color-muted)]">
        Charged on every order at checkout. Set to 0 for free delivery.
      </p>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <SaveButton pending={pending} saved={saved} onClick={handleSave} />
    </div>
  );
}

export function DeliveryFeeMiniPreview({ cents }: { cents: number }) {
  const subtotal = 85;
  const deliveryTnd = cents / 100;
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-[var(--color-muted)]">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[var(--color-muted)]">
          <span>Delivery</span>
          <span>{cents === 0 ? "Free" : formatPrice(deliveryTnd)}</span>
        </div>
        <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-bold text-[var(--color-text)]">
          <span>Total</span>
          <span>{formatPrice(subtotal + deliveryTnd)}</span>
        </div>
      </div>
    </div>
  );
}
