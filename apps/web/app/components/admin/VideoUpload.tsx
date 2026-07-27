"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Video } from "lucide-react";
import { saveVideoSettings } from "@/actions/storeSettingsActions";
import Uploader from "./Uploader";

export function VideoUpload({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleUploadComplete(res: { ufsUrl: string; url: string }[]) {
    const uploaded = res[0]?.ufsUrl;
    if (!uploaded) return;
    setError("");
    setSuccess(false);
    startTransition(async () => {
      const result = await saveVideoSettings({ videoUrl: uploaded });
      if (result.success) {
        setUrl(uploaded);
        setSuccess(true);
      } else {
        setError(result.error ?? "Failed to save video");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
        style={{ aspectRatio: "16/9" }}
      >
        {url ? (
          <video key={url} src={url} controls className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--color-muted)]">
            <Video className="h-12 w-12 opacity-30" />
            <p className="text-sm">No video uploaded yet</p>
          </div>
        )}

        {pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          </div>
        )}
        {success && !pending && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Uploader
        endpoint="storeVideo"
        buttonText={url ? "Replace Video" : "Upload Video"}
        handleUploadComplete={handleUploadComplete}
      />
      <p className="text-xs text-[var(--color-muted)]">
        Recommended: MP4, 16:9 format. This appears in the &quot;Our Story&quot; section.
      </p>
    </div>
  );
}
