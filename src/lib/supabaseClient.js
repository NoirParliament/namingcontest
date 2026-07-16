// Single shared Supabase client for the whole app.
//
// Reads config from Vite env vars (see .env.example). The anon key is safe to
// ship to the browser — Row-Level Security in the database is what actually
// protects data, not the key. Never put the service_role key here.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surface a clear message instead of a cryptic runtime error if the .env
  // file is missing during local dev.
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.'
  );
}

export const supabase = createClient(url, anonKey);
