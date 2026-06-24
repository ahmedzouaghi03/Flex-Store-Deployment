import { getSession } from "@/lib/session";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return <AdminShell role={session?.role ?? null}>{children}</AdminShell>;
}
