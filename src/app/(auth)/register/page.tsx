'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/verify-email')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">NailKarte</h1>
        <p className="text-sm text-gray-500 mt-1">30日間無料トライアル</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        {/* ステップインジケーター */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {step === 1 ? 'アカウント作成' : 'お名前を教えてください'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {step === 1 ? 'Step 1 / 2 — メールアドレスとパスワード' : 'Step 2 / 2 — プロフィール'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="nail@example.com"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（8文字以上）
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード確認
              </label>
              <input
                id="password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            {error && (
              <p className="text-sm text-danger bg-red-50 px-4 py-3 rounded-2xl">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-deep text-white font-medium py-3 rounded-2xl transition-colors"
            >
              次へ
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                お名前（サロン名）
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="山田ネイル"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            {error && (
              <p className="text-sm text-danger bg-red-50 px-4 py-3 rounded-2xl">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-2xl transition-colors hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary-deep text-white font-medium py-3 rounded-2xl transition-colors disabled:opacity-60"
              >
                {loading ? '登録中...' : '登録する'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
