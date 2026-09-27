import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env.js';
import { Role } from '@prisma/client';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

export interface VerifiedAuthUser {
  id: string;
  email?: string;
  role?: Role;
}

/**
 * Verifies a Supabase JWT token using the Supabase Auth API or offline mock tokens for demo.
 */
export async function verifySupabaseJwt(token: string): Promise<VerifiedAuthUser | null> {
  // Support mock tokens for offline demo mode
  if (token === 'mock-admin-jwt' || token.startsWith('mock-admin-')) {
    return { id: '00000000-0000-0000-0000-000000000001', email: 'admin@example.com', role: Role.ADMIN };
  }
  if (token === 'mock-contributor-jwt' || token.startsWith('mock-contributor-')) {
    return { id: '00000000-0000-0000-0000-000000000002', email: 'contributor@example.com', role: Role.CONTRIBUTOR };
  }

  // Validate token via Supabase Auth API
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data?.user) {
      const userRoleStr = data.user.user_metadata?.role || data.user.app_metadata?.role;
      const role = userRoleStr === 'ADMIN' ? Role.ADMIN : Role.CONTRIBUTOR;
      return {
        id: data.user.id,
        email: data.user.email,
        role,
      };
    }
  } catch (err) {
    console.warn('Supabase Auth API token verification warning:', err);
  }

  return null;
}
