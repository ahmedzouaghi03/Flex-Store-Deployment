"use client";

import { useState } from "react";

export function HeroImage({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="relative flex w-full flex-col items-center justify-center gap-4 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-sm"
        style={{ aspectRatio: "4/5" }}
      >
        <svg
          className="h-16 w-16 text-white/20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-center text-sm text-white/30">
          Add a hero photo from
          <br />
          <code className="text-white/50">Admin → Store Settings</code>
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Flex Comfort Shoes"
      onError={() => setFailed(true)}
      className="relative w-full rounded-3xl border border-white/20 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
      style={{ aspectRatio: "4/5" }}
    />
  );
}
