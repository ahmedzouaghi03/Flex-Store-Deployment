"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Send, RotateCcw } from "lucide-react";
import { submitContact } from "@/actions/contactActions";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await submitContact({ name, email, subject, message });
      if (!res.success) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setSent(true);
    });
  }

  function resetForm() {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setError("");
    setSent(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-10 text-center shadow-sm">
        <div className="rounded-full bg-[var(--color-green-bright)] p-3">
          <CheckCircle2 className="h-8 w-8 text-[var(--color-accent)]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text)]">Message sent!</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Thanks {name.split(" ")[0]}! We&apos;ll get back to you soon.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
        >
          <RotateCcw className="h-4 w-4" />
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--color-text)]">Full Name *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inp} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--color-text)]">Email *</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inp} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" className={inp} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">Message *</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us how we can help..."
          className={inp}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {isPending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
