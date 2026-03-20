import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !user) {
    logger.error('auth/callback: code exchange failed', { err: error })
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }

  // owners テーブルに INSERT（初回ログイン時）
  const serviceClient = createServiceClient()
  const { data: existingOwner } = await serviceClient
    .from('owners')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingOwner) {
    const name = user.user_metadata?.name ?? user.email?.split('@')[0] ?? '未設定'

    const { error: insertError } = await serviceClient.from('owners').insert({
      id: user.id,
      email: user.email!,
      name,
      subscription_status: 'trialing',
      trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (insertError) {
      logger.error('auth/callback: owners INSERT failed', { err: insertError })
    }

    // オンボーディングへ
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
