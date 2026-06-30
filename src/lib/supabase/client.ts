import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Note: Using untyped client to ensure compatibility with the new sb_publishable key format.
  // Type safety is maintained at the component level through explicit type imports.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
