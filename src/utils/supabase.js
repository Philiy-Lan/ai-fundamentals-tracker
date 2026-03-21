import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/**
 * Hash a passphrase into a deterministic key using SHA-256.
 * Same phrase on any device = same row in the database.
 */
export async function hashPhrase(phrase) {
  const trimmed = phrase.trim().toLowerCase();
  const encoded = new TextEncoder().encode(trimmed);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Pull progress from Supabase by sync key.
 * Returns the data object or null if not found.
 */
export async function pullProgress(syncKey) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("progress")
    .select("data, updated_at")
    .eq("id", syncKey)
    .single();

  if (error || !data) return null;
  return { data: data.data, updatedAt: data.updated_at };
}

/**
 * Push progress to Supabase. Upserts by sync key.
 */
export async function pushProgress(syncKey, progressData) {
  if (!supabase) return false;
  const { error } = await supabase.from("progress").upsert(
    {
      id: syncKey,
      data: progressData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  return !error;
}
