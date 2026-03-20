import { createClient } from '@/lib/supabase/server'
import TopBar from '@/components/layout/TopBar'
import Link from 'next/link'

export const metadata = { title: 'ダッシュボード' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 月次集計
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ data: owner }, { data: treatments }, { count: customerCount }] = await Promise.all([
    supabase.from('owners').select('name, subscription_status').eq('id', user!.id).single(),
    supabase
      .from('treatments')
      .select('price, menu_name, treatment_date')
      .eq('owner_id', user!.id)
      .gte('treatment_date', monthStart),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user!.id),
  ])

  const monthlyRevenue = treatments?.reduce((sum, t) => sum + (t.price ?? 0), 0) ?? 0
  const monthlyCount = treatments?.length ?? 0

  return (
    <div>
      <TopBar title="ダッシュボード" />

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* ウェルカム */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            こんにちは、{owner?.name ?? ''}さん
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {now.getMonth() + 1}月の施術状況
          </p>
        </div>

        {/* 月次サマリー */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">今月の売上</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ¥{monthlyRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">今月の施術数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{monthlyCount}件</p>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">クイックアクション</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/customers"
              className="flex flex-col items-center gap-2 p-4 bg-primary-light rounded-2xl hover:bg-pink-100 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium text-primary">顧客一覧</span>
            </Link>
            <div className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-2xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-quick">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-medium text-quick">⚡ クイック入力</span>
            </div>
          </div>
        </div>

        {/* 顧客数 */}
        {customerCount !== null && customerCount === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-gray-500 text-sm">まだ顧客が登録されていません</p>
            <Link
              href="/customers"
              className="inline-block mt-3 text-sm text-primary font-medium hover:underline"
            >
              最初の顧客を登録する →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
