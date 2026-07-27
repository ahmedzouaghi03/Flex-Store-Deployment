import { ShieldCheck, Truck, RefreshCw, Headphones, Star, Users, Leaf } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    desc: "Carefully selected materials that stand the test of time. Every stitch, every sole, built to last.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Orders dispatched quickly across Tunisia. We get your shoes to your door without the wait.",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    desc: "Not the right fit? Returns are simple and hassle-free. Your satisfaction comes first.",
  },
  {
    icon: Headphones,
    title: "Always Here",
    desc: "Real support from real people, whenever you need us. No bots, no runaround.",
  },
];

const STATS = [
  { value: "500+", label: "Happy customers" },
  { value: "50+",  label: "Shoe models" },
  { value: "100%", label: "Made with care" },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-br from-[var(--color-green-dark)] via-[var(--color-green)] to-[var(--color-green-mid)] py-24">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 60% 40%, var(--color-green-bright) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">About Us</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
            Crafted for Every Step
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/70">
            At Flex Comfort Shoes, we believe great footwear shouldn&apos;t be a compromise.
            Every pair is designed with your comfort in mind — light, flexible, and built to last.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)]">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-1 sm:px-4">
                <p className="text-xl font-black text-[var(--color-accent)] sm:text-3xl md:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-muted)] sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">Our Story</p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">Born from a love of comfort</h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                Flex Comfort Shoes was founded with a simple idea: shoes should feel as good as they look.
                We noticed that most comfortable shoes sacrifice style, and stylish shoes sacrifice comfort.
                We decided to change that.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                Each model in our collection goes through careful development to make sure it delivers
                on both fronts — so you can look sharp and feel great all day long.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Star,  label: "Top Rated",       desc: "Consistently praised by customers" },
                { icon: Leaf,  label: "Eco Conscious",   desc: "Mindful of our environmental impact" },
                { icon: Users, label: "Community First", desc: "Built for the people who wear us" },
                { icon: ShieldCheck, label: "Guaranteed", desc: "Quality you can count on" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)]/10">
                    <Icon className="h-4 w-4 text-[var(--color-accent)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--color-text)]">{label}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-[var(--color-border)] py-20 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">What Drives Us</p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">Our Commitments</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10">
                  <Icon className="h-6 w-6 text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-text)]">{title}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--color-border)] py-16 bg-[var(--color-bg)]">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Ready to find your perfect pair?</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Browse our full collection and experience the difference.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)]"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-8 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
