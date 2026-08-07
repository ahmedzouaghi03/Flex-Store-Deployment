"use client";

import { useState } from "react";
import { X } from "lucide-react";

// Tag-style keyword list — type a keyword, press Enter (or comma) to add it as a chip.
// Backed by the same comma-separated string the DB stores. Shared by the SEO settings
// page and the Product/Category SEO sections so all three behave identically.
export function KeywordsInput({
  value,
  onChange,
  inputClassName,
}: {
  value: string;
  onChange: (next: string) => void;
  inputClassName: string;
}) {
  const keywords = value.split(",").map((k) => k.trim()).filter(Boolean);
  const [input, setInput] = useState("");

  function addKeyword() {
    const kw = input.trim();
    if (!kw || keywords.includes(kw)) {
      setInput("");
      return;
    }
    onChange([...keywords, kw].join(", "));
    setInput("");
  }

  function removeKeyword(kw: string) {
    onChange(keywords.filter((k) => k !== kw).join(", "));
  }

  return (
    <div className="space-y-2">
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs font-medium text-[var(--color-text)]"
            >
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                className="text-[var(--color-muted)] transition hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addKeyword();
            }
          }}
          placeholder="Type a keyword, then press Enter…"
          className={`${inputClassName} min-w-0 flex-1`}
        />
        <button
          type="button"
          onClick={addKeyword}
          disabled={!input.trim()}
          className="shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
