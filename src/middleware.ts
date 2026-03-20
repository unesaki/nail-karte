import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 認証不要のパブリックルート
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/verify-email',
  '/auth/callback',
  '/pricing',
  '/legal',
]

// API Routes（Webhook等）は認証をスキップ
const API_SKIP_ROUTES = [
  '/api/stripe/webhook',
  '/api/line/webhook',
  '/api/cron',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API スキップ対象
  if (API_SKIP_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // 環境変数未設定時はスキップ（開発初期セットアップ前）
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // パブリックルートはそのまま通す
  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/')
  )

  // 未認証 → /login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 認証済みでパブリックルート → /dashboard
  if (user && isPublic && pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // メール未確認チェック
  if (user && !user.email_confirmed_at && pathname !== '/verify-email') {
    return NextResponse.redirect(new URL('/verify-email', request.url))
  }

  // サブスク有効チェック（/dashboard 以降の保護ルートのみ）
  const isProtectedRoute =
    !isPublic && pathname !== '/verify-email' && pathname !== '/onboarding'

  if (user && user.email_confirmed_at && isProtectedRoute) {
    const { data: owner } = await supabase
      .from('owners')
      .select('subscription_status, trial_end')
      .eq('id', user.id)
      .single()

    if (owner) {
      const isActive =
        owner.subscription_status === 'active' ||
        owner.subscription_status === 'trialing'

      const trialExpired =
        owner.subscription_status === 'trialing' &&
        owner.trial_end &&
        new Date(owner.trial_end) < new Date()

      if (!isActive || trialExpired) {
        if (pathname !== '/pricing') {
          return NextResponse.redirect(new URL('/pricing', request.url))
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|og-image.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
