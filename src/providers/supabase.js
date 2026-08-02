import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabase(env) {
  if (!client) {
    client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY
    );
  }

  return client;
}