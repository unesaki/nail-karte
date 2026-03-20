'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Sentry セットアップ後にここを有効化:
    // import * as Sentry from '@sentry/nextjs'
    // Sentry.captureException(error)
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary mb-4">500</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
        <p className="text-gray-500 text-sm mb-8">
          予期しないエラーが発生しました。<br />
          しばらく経ってから再度お試しください。
        </p>
        <button
          onClick={reset}
          className="inline-block bg-primary hover:bg-primary-deep text-white font-medium px-8 py-3 rounded-2xl transition-colors"
        >
          もう一度試す
        </button>
      </div>
    </div>
  )
}
