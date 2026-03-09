import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the storage file path from a full Supabase storage URL.
 * Works for both public and signed URL formats.
 * Returns null if the input is already a plain path (no http).
 */
export function extractStoragePath(fileUrl: string, bucket: string): string | null {
  // If it's not a URL (no protocol), treat it as a plain path already
  if (!fileUrl.startsWith("http")) return fileUrl;

  try {
    const url = new URL(fileUrl);
    // Matches /storage/v1/object/public/<bucket>/<path>
    // or /storage/v1/object/sign/<bucket>/<path>
    const regex = new RegExp(`/storage/v1/object/(?:public|sign)/${bucket}/(.+?)(?:\\?|$)`);
    const match = url.pathname.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * Creates a signed URL for a private storage bucket file.
 * Accepts both full storage URLs (legacy) and plain file paths (new).
 * Falls back to the original value if path extraction fails.
 */
export async function getSignedUrl(
  fileUrl: string,
  bucket: string,
  expiresIn = 3600
): Promise<string> {
  const path = extractStoragePath(fileUrl, bucket);
  if (!path) return fileUrl;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) return fileUrl;
  return data.signedUrl;
}
