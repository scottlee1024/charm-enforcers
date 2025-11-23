import { createClient } from '@supabase/supabase-js';

// In a production environment, these would typically be loaded from import.meta.env
const supabaseUrl = 'https://clsbfdakktutftidhzdn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc2JmZGFra3R1dGZ0aWRoemRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzkzNDQsImV4cCI6MjA3OTQ1NTM0NH0.6LWBZrGWsrrrSi39_1WxYjjSQkZc1aMkP1s1-KEpFg8';

export const supabase = createClient(supabaseUrl, supabaseKey);