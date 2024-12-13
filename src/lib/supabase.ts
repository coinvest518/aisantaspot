import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvthtjkxbskxcbxpsfko.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dGh0amt4YnNreGNieHBzZmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzU0NDAsImV4cCI6MjAyNTQxMTQ0MH0.hCpgGpYWiruE-0GXxhv6_GAVf2YOAZTPiZF5cVGdC0M';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string | null;
  referral_code: string | null;
  earnings: number;
  created_at: string;
};

export type Referral = {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed';
  created_at: string;
};