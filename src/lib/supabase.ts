import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

// Standardize Supabase URL
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://rtoscuhyfcsyuuoukrkw.supabase.co').trim();
// If the URL ends with /rest/v1/, it's likely a mistake from copying from the dashboard settings
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_o4qVms-jOW4Te4294R_aZA_KLvgstEy').trim();

const isStripeKey = supabaseAnonKey.startsWith('sb_publishable');
const isInvalidKey = supabaseAnonKey && !supabaseAnonKey.includes('.') && !supabaseAnonKey.startsWith('eyJ');

if (isStripeKey) {
  console.warn('NOTICE: The API key provided (starting with "sb_publishable") appears to be a Stripe key. Falling back to Demo Mode with local storage.');
}

if (isInvalidKey) {
  console.warn('NOTICE: The Supabase API key is invalid or incomplete. Falling back to Demo Mode with local storage.');
}

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey && !isStripeKey && !isInvalidKey;

// Export either real supabase or mock
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (mockSupabase as any);
