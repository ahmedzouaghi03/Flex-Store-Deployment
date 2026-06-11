"use client";

import { useState } from "react";

export function LogoImage({ height = 40 }: { height?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="rounded-lg bg-[var(--color-green)] px-2.5 py-1 text-sm font-black tracking-wide text-white">
        FLEX
      </span>
    );
  }

  return (
    <img
      src="/store-logo.png"
      alt="Store logo"
      onError={() => setFailed(true)}
      style={{ height, width: "auto" }}
      className="object-contain"
    />
  );
}
