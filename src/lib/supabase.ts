import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseKey || "placeholder-key";

export const supabase = createClient(url, key);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && supabaseUrl !== "https://placeholder.supabase.co"
);
