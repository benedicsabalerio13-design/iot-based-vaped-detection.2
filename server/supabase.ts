import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;
let currentConfig = { url: '', key: '' };

export function getSupabaseClient(overrideUrl?: string, overrideKey?: string): SupabaseClient | null {
  const url = overrideUrl || process.env.SUPABASE_URL || '';
  const key = overrideKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!url || !key || url.includes('placeholder') || url.includes('udm-campus-safety.supabase.co')) {
    // If using the placeholder, don't attempt live network connection
    return null;
  }

  if (supabaseClient && currentConfig.url === url && currentConfig.key === key) {
    return supabaseClient;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    currentConfig = { url, key };
    return supabaseClient;
  } catch (err) {
    console.error('[Supabase] Client initialization error:', err);
    return null;
  }
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabaseClient(url, key);
    if (!client) {
      return {
        success: false,
        message: 'Supabase URL or Key is missing or invalid. Please check your project credentials.',
      };
    }

    // Try a simple ping query on the sensors table or a system query
    const { data, error } = await client.from('sensors').select('id').limit(1);
    if (error) {
      // If error is relation does not exist, credentials worked, but tables need to be created!
      if (error.code === '42P01' || error.message.includes('relation "public.sensors" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase project! However, the "sensors" table does not exist yet. Please run the supabase-schema.sql script in your Supabase SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Supabase returned an error: ${error.message} (Code: ${error.code || 'N/A'})`,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase PostgreSQL database!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect: ${err.message || 'Unknown network error'}`,
    };
  }
}
