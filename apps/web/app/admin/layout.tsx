import { AdminShell } from "@/components/admin/AdminShell";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { getContacts } from "@/actions/contactActions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [settings, unreadContacts] = await Promise.all([
    getStoreSettings(),
    getContacts({ unreadOnly: true }),
  ]);
  const logoUrl = settings.success ? settings.data?.logoUrl ?? null : null;
  return (
    <AdminShell logoUrl={logoUrl} unreadContactsCount={unreadContacts.length}>
      {children}
    </AdminShell>
  );
}
