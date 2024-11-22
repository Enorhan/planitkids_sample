import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vaisxrwuuhkrlqjgxjll.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaXN4cnd1dWhrcmxxamd4amxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMjk2MTMsImV4cCI6MjA0NzcwNTYxM30.GseqZvB_bWZjyKgR96aZDaH-lIJ_DYtLJCgHeS1jf3k'; // Found in your Supabase dashboard
export const supabase = createClient(supabaseUrl, supabaseKey);