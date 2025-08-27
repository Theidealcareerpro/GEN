// theidealprogen/src/lib/server/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Supabase env missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Server APIs will fail.");
}

export const supa = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
