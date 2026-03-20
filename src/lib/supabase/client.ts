import { createBrowserClient } from '@supabase/ssr'

// ブラウザ専用クライアント（ANON_KEY）
// Client Components でのみ使用する
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
