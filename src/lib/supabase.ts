import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const UPLOADS_BUCKET = "kargo-uploads";

let client: SupabaseClient | null = null;

// Privileged (secret-key) client. Server-only: never import from a client component.
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
