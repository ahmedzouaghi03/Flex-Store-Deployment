"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import Uploader from "./Uploader";
import { saveLogoUrl } from "@/actions/storeSettingsActions";

export function LogoUpload({
  initialUrl,
  onUploaded,
}: {
  initialUrl: string | null;
  onUploaded?: (url: string) => void;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [imgFailed, setImgFailed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleUploadComplete(res: { ufsUrl: string; url: string }[]) {
    const uploaded = res[0]?.ufsUrl;
    if (!uploaded) return;
    setError("");
    setSuccess(false);
    startTransition(async () => {
      const result = await saveLogoUrl(uploaded);
      if (result.success) {
        setUrl(uploaded);
        setImgFailed(false);
        setSuccess(true);
        onUploaded?.(uploaded);
      } else {
        setError(result.error ?? "Failed to save logo");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
      {/* preview box */}
      <div className="relative flex h-20 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
        {url && !imgFailed ? (
          <img
            key={url}
            src={url}
            alt="Store logo"
            className="max-h-16 max-w-full object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="rounded-lg bg-[var(--color-green)] px-2.5 py-1 text-sm font-black text-white">
            FLEX
          </span>
        )}

        {pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
          </div>
        )}
        {success && !pending && (
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
        <Uploader
          endpoint="storeImage"
          buttonText={url ? "Replace Logo" : "Upload Logo"}
          handleUploadComplete={handleUploadComplete}
        />
        <p className="text-xs text-[var(--color-muted)]">
          PNG or SVG recommended. Appears in the store navbar and admin header.
          <br />
          Transparent background works best.
        </p>
      </div>
    </div>
  );
}
