import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/store/ContactForm";
import { getContactInfo } from "@/actions/storeConfigActions";

function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export default async function ContactPage() {
  const contact = await getContactInfo();

  const INFO = [
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: Phone, label: "Phone", value: contact.phone, href: phoneHref(contact.phone) },
    { icon: MapPin, label: "Location", value: contact.location, href: null as string | null },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-br from-[var(--color-green-dark)] via-[var(--color-green)] to-[var(--color-green-mid)] py-20">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 60% 40%, var(--color-green-bright) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Contact</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Get in Touch</h1>
          <p className="mx-auto mt-4 max-w-md text-base text-white/70">
            Have a question about an order, a product, or just want to say hello?
            We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 md:grid-cols-[1fr_1.6fr]">

            {/* Info cards */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Contact Info</h2>
              {INFO.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10">
                    <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
                    {href ? (
                      <a href={href} className="mt-0.5 text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">{value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Response Time</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{contact.responseTime}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  We read every message and reply as quickly as we can.
                </p>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">Send a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
