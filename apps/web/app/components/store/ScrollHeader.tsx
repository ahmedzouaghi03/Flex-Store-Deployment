"use client";

import { useEffect, useState } from "react";

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
        scrolled
          ? "bg-white/95 border-[var(--color-border)] shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          : "bg-white/90 border-[var(--color-border)]"
      }`}
    >
      <div
        className={`h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent transition-opacity duration-300 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 transition-all duration-300 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        {children}
      </div>
    </header>
  );
}
