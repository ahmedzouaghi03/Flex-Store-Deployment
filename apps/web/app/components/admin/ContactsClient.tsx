"use client";

import { useState, useTransition } from "react";
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { markContactRead, deleteContact } from "@/actions/contactActions";
import { ConfirmDialog } from "./ConfirmDialog";

type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  user: { id: string; name: string } | null;
};

function ContactRow({ contact, onUpdate }: { contact: Contact; onUpdate: (id: string, patch: Partial<Contact>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleRead() {
    startTransition(async () => {
      await markContactRead(contact.id, !contact.isRead);
      onUpdate(contact.id, { isRead: !contact.isRead });
    });
  }

  function handleDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      await deleteContact(contact.id);
      onUpdate(contact.id, { id: "__deleted__" });
    });
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition ${
        contact.isRead
          ? "border-[var(--color-border)] bg-white"
          : "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-4 p-4 sm:p-5">
        {/* Unread dot */}
        <div className="mt-1 shrink-0">
          {contact.isRead ? (
            <MailOpen size={18} className="text-[var(--color-muted)]" />
          ) : (
            <Mail size={18} className="text-[var(--color-accent)]" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--color-text)]">{contact.name}</p>
            {!contact.isRead && (
              <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                New
              </span>
            )}
          </div>
          <p className="break-all text-sm text-[var(--color-muted)]">{contact.email}</p>
          {contact.subject && (
            <p className="mt-0.5 break-words text-sm font-medium text-[var(--color-text)]">{contact.subject}</p>
          )}
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {new Date(contact.createdAt).toLocaleDateString("fr-TN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {contact.user && (
              <span className="ml-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-muted)]">
                Registered user
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={toggleRead}
            disabled={isPending}
            title={contact.isRead ? "Mark as unread" : "Mark as read"}
            className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-accent)] disabled:opacity-50"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : contact.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
            title="Delete"
            className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded message */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-4">
          <p className="whitespace-pre-wrap text-sm text-[var(--color-text)]">{contact.message}</p>
          <a
            href={`mailto:${contact.email}?subject=Re: ${contact.subject ?? "Your message"}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <Mail size={12} />
            Reply via email
          </a>
        </div>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Delete this message?"
          message={`This will permanently delete the message from ${contact.name}.`}
          isPending={isPending}
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

export function ContactsClient({ contacts: initial }: { contacts: Contact[] }) {
  const [contacts, setContacts] = useState(initial);

  function handleUpdate(id: string, patch: Partial<Contact>) {
    if (patch.id === "__deleted__") {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } else {
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center text-sm text-[var(--color-muted)]">
        No messages yet. Contact form submissions will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((c) => (
        <ContactRow key={c.id} contact={c} onUpdate={handleUpdate} />
      ))}
    </div>
  );
}
