'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setResending(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      setError('メールアドレスが取得できませんでした')
      setResending(false)
      return
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      setError('送信に失敗しました。しばらく待ってから再試行してください。')
    } else {
      setResent(true)
    }

    setResending(false)
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">NailKarte</h1>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">メールを確認してください</h2>
        <p className="text-sm text-gray-500 mb-6">
          確認メールを送信しました。<br />
          メール内のリンクをクリックして登録を完了してください。
        </p>

        {resent && (
          <p className="text-sm text-success bg-green-50 px-4 py-3 rounded-2xl mb-4">
            再送信しました
          </p>
        )}
        {error && (
          <p className="text-sm text-danger bg-red-50 px-4 py-3 rounded-2xl mb-4">{error}</p>
        )}

        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {resending ? '送信中...' : 'メールが届かない場合は再送信'}
        </button>
      </div>
    </div>
  )
}
