import { createClient } from "@supabase/supabase-js";

/**
 * Client com service role (bypass RLS).
 * Usar apenas em contexto server-side confiável (ex.: webhooks), nunca expor ao client.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para o admin client.");
  }
  return createClient(url, key);
}
