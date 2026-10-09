import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Vite environment variables or dynamic stored config
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let customUrl: string = envUrl;
let customKey: string = envKey;

// Check if user set credentials via in-app config
try {
  const storedUrl = localStorage.getItem('supabase_custom_url');
  const storedKey = localStorage.getItem('supabase_custom_key');
  if (storedUrl && storedKey) {
    customUrl = storedUrl;
    customKey = storedKey;
  }
} catch {
  // Ignore in SSR / strict sandbox environments
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    customUrl &&
    customKey &&
    customUrl.startsWith('https://') &&
    customUrl.includes('.supabase.co') &&
    customKey.length > 20
  );
}

export function getSupabaseCredentials(): { url: string; key: string } {
  return {
    url: customUrl,
    key: customKey,
  };
}

export function updateSupabaseCredentials(url: string, key: string) {
  customUrl = url.trim();
  customKey = key.trim();
  try {
    localStorage.setItem('supabase_custom_url', customUrl);
    localStorage.setItem('supabase_custom_key', customKey);
  } catch {}
  cachedClient = null; // Reset cache so new client is instantiated
}

export function clearSupabaseCredentials() {
  customUrl = envUrl;
  customKey = envKey;
  try {
    localStorage.removeItem('supabase_custom_url');
    localStorage.removeItem('supabase_custom_key');
  } catch {}
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(customUrl, customKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials are not configured yet. Please enter your project URL and Anon Key.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Invalid Supabase client configuration.' };
  }

  try {
    const { data, error } = await client.from('growth_packages').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, notify that migration schema needs to be run
      if (error.code === '42P01' || error.message.includes('relation "public.growth_packages" does not exist')) {
        return {
          success: false,
          message: 'Connected to Supabase project, but tables are missing. Please execute the SQL migration script from the Admin tab.',
        };
      }
      return { success: false, message: `Supabase error: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to live Supabase backend!' };
  } catch (err: any) {
    return { success: false, message: `Connection failed: ${err?.message || String(err)}` };
  }
}
