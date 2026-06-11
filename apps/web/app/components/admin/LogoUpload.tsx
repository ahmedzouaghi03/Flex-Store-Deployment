"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

export function LogoUpload({ onUploaded }: { onUploaded?: (v: number) => void }) {
  // version is 0 on first render (server + client match), bumped only after upload
  const [version, setVersion] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSuccess(false);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");

      // bump version client-side only → forces image reload without hydration mismatch
      const v = Date.now();
      setVersion(v);
      onUploaded?.(v);
      setImgFailed(false);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // version === 0 → no query string (stable between server + client on first render)
  const logoSrc = version > 0 ? `/store-logo.png?v=${version}` : `/store-logo.png`;

  return (
    <div className="flex items-start gap-6">
      {/* preview box */}
      <div className="relative flex h-20 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
        {imgFailed ? (
          <span className="rounded-lg bg-[var(--color-green)] px-2.5 py-1 text-sm font-black text-white">
            FLEX
          </span>
        ) : (
          <img
            key={logoSrc}
            src={logoSrc}
            alt="Store logo"
            className="max-h-16 max-w-full object-contain"
            onError={() => setImgFailed(true)}
          />
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
          </div>
        )}
        {success && !uploading && (
          <div className="absolute right-2 top-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        )}
      </div>

      {/* controls */}
      <div className="space-y-2">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload Logo"}
        </button>
        <p className="text-xs text-[var(--color-muted)]">
          PNG or SVG recommended. Appears in the store navbar and admin header.
          <br />
          Transparent background works best.
        </p>
      </div>
    </div>
  );
}
