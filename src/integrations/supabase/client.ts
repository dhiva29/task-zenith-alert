// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rnmzeduohcxtgdrnajfd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXplZHVvaGN4dGdkcm5hamZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjYyNTEsImV4cCI6MjA2Nzc0MjI1MX0.YJHyKeiZf-z_lCV-OulOv8vZexf2_khGGTK6pym9mis";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});