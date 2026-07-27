import Link from "next/link";
import { Package, UserCircle, LogIn, UserPlus, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/session";
import { logoutUser } from "@/actions/customerAuthActions";
import { db } from "@shoestore/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export default async function AccountPage() {
  const session = await getSession();
  const t = await getTranslations("Account");

  if (!session) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center space-y-8">
        <div className="flex justify-center">
          <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <UserCircle size={48} className="text-[var(--color-muted)]" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("Title")}</h1>
          <p className="text-[var(--color-muted)]">{t("Subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/account/login"
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-6 transition hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5"
          >
            <div className="rounded-xl bg-[var(--color-bg)] p-3">
              <LogIn size={22} className="text-[var(--color-text)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-text)]">{t("SignIn")}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{t("SignInDesc")}</p>
            </div>
          </Link>
          <Link
            href="/account/register"
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-6 transition hover:border-[var(--color-accent)]/60"
          >
            <div className="rounded-xl bg-[var(--color-accent)]/10 p-3">
              <UserPlus size={22} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-text)]">{t("CreateAccount")}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{t("CreateDesc")}</p>
            </div>
          </Link>
        </div>
      </main>
    );
  }

  const orders = await db.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[var(--color-accent)]/10 p-3">
            <UserCircle size={28} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">{session.name}</h1>
            <p className="text-sm text-[var(--color-muted)]">{session.email}</p>
          </div>
        </div>
        <form action={async () => { "use server"; await logoutUser(); }}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-muted)] transition hover:text-red-600 hover:border-red-200 hover:bg-red-50"
          >
            <LogOut size={14} />
            {t("SignOut")}
          </button>
        </form>
      </div>

      {/* Orders */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold text-[var(--color-text)]">
          <Package size={16} />
          {t("MyOrders")}
          <span className="text-sm font-normal text-[var(--color-muted)]">({orders.length})</span>
        </h2>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-muted)]">
            {t("NoOrders")}{" "}
            <Link href="/shop" className="font-semibold text-[var(--color-accent)] hover:underline">
              {t("StartShopping")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-mono text-xs font-bold text-[var(--color-muted)]">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("fr-TN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {t("Items", { count: order._count.items })}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-[var(--color-text)]">{formatPrice(Number(order.total))}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
