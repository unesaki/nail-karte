import { createClient } from '@supabase/supabase-js'

// SERVICE_ROLE_KEY クライアント
// API Routes 専用。絶対にクライアントサイドに渡さない。
// RLS をバイパスするため、必ずサーバーサイドでのみ使用すること。
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
