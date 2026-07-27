"use client";

import { useState } from "react";

export function LogoImage({ height = 40, src }: { height?: number; src?: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="rounded-lg bg-[var(--color-green)] px-2.5 py-1 text-sm font-black tracking-wide text-white">
        FLEX
      </span>
    );
  }

  return (
    <img
      src={src}
      alt="Store logo"
      onError={() => setFailed(true)}
      style={{ height, width: "auto" }}
      className="object-contain"
    />
  );
}
