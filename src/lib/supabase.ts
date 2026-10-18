import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    (supabaseServiceKey || supabaseAnonKey)
);

// Client for public operations
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, (supabaseServiceKey || supabaseAnonKey)!)
  : null;
