import { getContacts } from "@/actions/contactActions";
import { ContactsClient } from "@/components/admin/ContactsClient";

export async function ContactsContent() {
  const contacts = await getContacts();
  const unread = contacts.filter((c) => !c.isRead).length;

  return (
    <>
      <p className="text-sm text-[var(--color-muted)]">
        {contacts.length} message{contacts.length !== 1 ? "s" : ""}
        {unread > 0 && (
          <span className="ml-2 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-bold text-white">
            {unread} unread
          </span>
        )}
      </p>

      <ContactsClient contacts={contacts} />
    </>
  );
}
