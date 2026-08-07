import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Product not found</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        This shoe may have been removed or is not published yet.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-[var(--color-accent)] hover:underline"
      >
        Back to shop
      </Link>
    </main>
  );
}
