import { StoreHeader } from "@/components/store/StoreHeader";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreHeader />
      {children}
      <footer className="mt-16 border-t border-[var(--color-border)] py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-[var(--color-muted)] sm:px-6">
          © {new Date().getFullYear()} ShoeStore — Powered By IT VISION
        </div>
      </footer>
    </>
  );
}
