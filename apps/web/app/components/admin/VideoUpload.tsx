"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle2, Video } from "lucide-react";

export function VideoUpload({ hasVideo }: { hasVideo: boolean }) {
  const [uploaded, setUploaded] = useState(hasVideo);
  const [version, setVersion] = useState(0);
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
      const res = await fetch("/api/upload/video", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      setVersion(Date.now());
      setUploaded(true);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // stable src on first render (version === 0 → no query string)
  const videoSrc = version > 0 ? `/store-video.mp4?v=${version}` : `/store-video.mp4`;

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
        style={{ aspectRatio: "16/9" }}
      >
        {uploaded ? (
          <video key={videoSrc} src={videoSrc} controls className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--color-muted)]">
            <Video className="h-12 w-12 opacity-30" />
            <p className="text-sm">No video uploaded yet</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          </div>
        )}
        {success && !uploading && (
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

      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading…" : uploaded ? "Replace Video" : "Upload Video"}
      </button>
      <p className="text-xs text-[var(--color-muted)]">
        Recommended: MP4, 16:9 format. This appears in the &quot;Our Story&quot; section.
      </p>
    </div>
  );
}
