import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">ページが見つかりません</h2>
        <p className="text-gray-500 text-sm mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-primary hover:bg-primary-deep text-white font-medium px-8 py-3 rounded-2xl transition-colors"
        >
          ダッシュボードへ戻る
        </Link>
      </div>
    </div>
  )
}
