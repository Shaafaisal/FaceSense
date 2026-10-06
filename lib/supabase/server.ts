import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client. Uses the service role so Route Handlers can
 * persist analyses/feedback without user auth. Never import this from client components.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
