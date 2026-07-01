import { getContacts } from "@/actions/contactActions";
import { ContactsClient } from "@/components/admin/ContactsClient";

export default async function AdminContactsPage() {
  const contacts = await getContacts();

  const unread = contacts.filter((c) => !c.isRead).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Contact Messages</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {contacts.length} message{contacts.length !== 1 ? "s" : ""}
          {unread > 0 && (
            <span className="ml-2 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-bold text-white">
              {unread} unread
            </span>
          )}
        </p>
      </div>

      <ContactsClient contacts={contacts} />
    </div>
  );
}
