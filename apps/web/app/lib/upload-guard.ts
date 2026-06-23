// apps/web/app/lib/upload-guard.ts
import "server-only";

// Maps every accepted MIME type to a safe, canonical extension.
// Extension is always taken from here, never from the client-supplied filename.
export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
};

export const MAX_BYTES = {
  image: 5 * 1024 * 1024, //  5 MB — product images
  logo: 2 * 1024 * 1024, //  2 MB — store logo
  hero: 10 * 1024 * 1024, // 10 MB — hero banner
  video: 100 * 1024 * 1024, // 100 MB — promo video
} as const;

export type UploadKind = keyof typeof MAX_BYTES;

export type UploadValidationError =
  | { ok: false; status: 400 | 413; message: string }
  | { ok: true; ext: string };

/**
 * Validates MIME type against the provided allow-list and enforces the size
 * limit for the given upload kind.
 * Returns either an error descriptor or the safe canonical extension.
 */
export function validateUpload(
  file: File,
  allowedMimes: string[],
  kind: UploadKind,
): UploadValidationError {
  if (!allowedMimes.includes(file.type)) {
    return { ok: false, status: 400, message: "File type not allowed" };
  }

  if (file.size > MAX_BYTES[kind]) {
    const limitMB = MAX_BYTES[kind] / (1024 * 1024);
    return {
      ok: false,
      status: 413,
      message: `File exceeds the ${limitMB} MB limit`,
    };
  }

  // Safe: ext is looked up from our map, never from file.name
  const ext = MIME_TO_EXT[file.type];
  return { ok: true, ext };
}
