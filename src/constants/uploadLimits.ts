/**
 * Max file sizes for course material uploads.
 * Enforced client-side to avoid OOM / Expo Go crashes when reading entire file into memory.
 * Keep PDF/script conservative; video can be larger but still bounded.
 */
export const MAX_PDF_SCRIPT_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  const mb = bytes / (1024 * 1024);
  return mb >= 100 ? `${mb.toFixed(0)} MB` : `${mb.toFixed(1)} MB`;
}
