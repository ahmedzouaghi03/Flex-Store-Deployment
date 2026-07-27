"use client";

import { useState, useTransition } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { updateOrderNotes } from "@/actions/orderActions";

export function OrderNotesCard({ orderId, initialNotes }: { orderId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes);
  const [isPending, startTransition] = useTransition();

  function startEdit() {
    setDraft(notes);
    setEditing(true);
  }

  function save() {
    const value = draft.trim();
    setEditing(false);
    startTransition(async () => {
      const res = await updateOrderNotes(orderId, value);
      if (res.success) setNotes(value);
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Notes</h2>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            disabled={isPending}
            className="rounded-lg p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-accent)] disabled:opacity-40"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a note about this order…"
            className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--color-green-mid)]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">{notes || "No notes from customer"}</p>
      )}
    </div>
  );
}
