// supabaseClient.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://jvriplwcuhaoskmjqhhy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cmlwbHdjdWhhb3NrbWpxaGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDgxMTQsImV4cCI6MjA3MjUyNDExNH0.mUQnUOLZj7SvPIalCwWZdp7QcZhdmUDJ6a1n2SLakGA"; // paste your anon key here

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log("🔌 Supabase client initialized");