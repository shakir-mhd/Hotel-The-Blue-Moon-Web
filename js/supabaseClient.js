/**
 * Supabase Client Initialization for Hotel The Blue Moon
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uwdvkmromrgxftjtfqqs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3ZHZrbXJvbXJneGZ0anRmcXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NTA0NDgsImV4cCI6MjExMDAyNjQ0OH0.2uK2MWFt9Iukw6D_qcdnMa599FHTmILf9Z2YkR7rCCk';

let supabaseClient = null;

if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Hotel The Blue Moon: Supabase client initialized successfully.");
} else {
  console.warn("Supabase SDK not found on window. Ensure the Supabase CDN script is loaded.");
}

export { supabaseClient };

