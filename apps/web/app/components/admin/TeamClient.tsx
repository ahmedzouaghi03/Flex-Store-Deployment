"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, X, Shield, UserMinus, ChevronDown, Loader2, Pencil } from "lucide-react";
import {
  addTeamMember,
  updateMemberRole,
  removeTeamMember,
} from "@/actions/teamActions";
import type { TeamMember } from "@/actions/teamActions";
import { ConfirmDialog } from "./ConfirmDialog";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-sm font-bold text-[var(--color-accent)]">
      {initials(name)}
    </div>
  );
}

function RoleBadge({ role }: { role: "ADMIN" | "SUPER_ADMIN" }) {
  return role === "SUPER_ADMIN" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      <Shield className="h-2.5 w-2.5" /> Super Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-accent)]">
      Admin
    </span>
  );
}

// ── Add member form ───────────────────────────────────────────────────────────
function AddMemberForm({ onDone }: { onDone: () => void }) {
  const [, start] = useTransition();
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]     = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    start(async () => {
      const res = await addTeamMember({ name: name.trim(), email: email.trim(), password, role });
      if (!res.success) {
        setError(res.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      onDone();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--color-text)]">Add Team Member</p>
        <button type="button" onClick={onDone} className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-muted)]">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Ben Ali" className={inp} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-muted)]">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@flex.tn" className={inp} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-muted)]">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={inp} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-muted)]">Role</label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
              className={`${inp} appearance-none pr-8`}
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Add Member
        </button>
        <button type="button" onClick={onDone} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Member card ───────────────────────────────────────────────────────────────
function MemberCard({
  member,
  isSelf,
  isSuperAdmin,
}: {
  member: TeamMember;
  isSelf: boolean;
  isSuperAdmin: boolean;
}) {
  const [, start] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleRoleChange(newRole: "ADMIN" | "SUPER_ADMIN") {
    setLoading("role");
    setError("");
    start(async () => {
      const res = await updateMemberRole(member.id, newRole);
      if (!res.success) setError(res.error ?? "Failed.");
      setLoading(null);
    });
  }

  async function handleRemove() {
    setConfirmOpen(false);
    setLoading("remove");
    setError("");
    start(async () => {
      const res = await removeTeamMember(member.id);
      if (!res.success) setError(res.error ?? "Failed.");
      setLoading(null);
    });
  }

  const joined = new Date(member.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4">
      <Avatar name={member.name} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-[var(--color-text)] truncate">{member.name}</p>
          {isSelf && (
            <span className="rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              You
            </span>
          )}
          <RoleBadge role={member.role} />
        </div>
        <p className="mt-0.5 hidden text-xs text-[var(--color-muted)] truncate sm:block">{member.email}</p>
        <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">Joined {joined}</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      {isSuperAdmin && (
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/admin/team/${member.id}/edit`}
            title="Edit member"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[var(--color-muted)] hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)] transition"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          {!isSelf && (
            <>
              {member.role === "ADMIN" ? (
                <button
                  onClick={() => handleRoleChange("SUPER_ADMIN")}
                  disabled={loading !== null}
                  title="Promote to Super Admin"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition disabled:opacity-40"
                >
                  {loading === "role" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
                  Promote
                </button>
              ) : (
                <button
                  onClick={() => handleRoleChange("ADMIN")}
                  disabled={loading !== null}
                  title="Demote to Admin"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)] hover:text-amber-600 hover:border-amber-200 transition disabled:opacity-40"
                >
                  {loading === "role" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
                  Demote
                </button>
              )}
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={loading !== null}
                title="Remove from team"
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[var(--color-muted)] hover:border-red-200 hover:text-red-500 transition disabled:opacity-40"
              >
                {loading === "remove" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-3.5 w-3.5" />}
              </button>
            </>
          )}
        </div>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Remove from team?"
          message={`${member.name} will lose admin access to the store.`}
          confirmLabel="Remove"
          isPending={loading === "remove"}
          onConfirm={handleRemove}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function TeamClient({
  members,
  currentUserId,
  isSuperAdmin,
}: {
  members: TeamMember[];
  currentUserId: string;
  isSuperAdmin: boolean;
}) {
  const [showForm, setShowForm] = useState(false);

  const superAdmins = members.filter((m) => m.role === "SUPER_ADMIN");
  const admins      = members.filter((m) => m.role === "ADMIN");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-muted)]">
          {members.length} member{members.length !== 1 ? "s" : ""} with admin access
        </p>
        {isSuperAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && <AddMemberForm onDone={() => setShowForm(false)} />}

      {/* Super Admins */}
      {superAdmins.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
            Super Admins
          </p>
          <div className="space-y-2">
            {superAdmins.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                isSelf={m.id === currentUserId}
                isSuperAdmin={isSuperAdmin}
              />
            ))}
          </div>
        </section>
      )}

      {/* Admins */}
      {admins.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
            Admins
          </p>
          <div className="space-y-2">
            {admins.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                isSelf={m.id === currentUserId}
                isSuperAdmin={isSuperAdmin}
              />
            ))}
          </div>
        </section>
      )}

      {members.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
          <p className="text-sm text-[var(--color-muted)]">No team members yet.</p>
        </div>
      )}
    </div>
  );
}
