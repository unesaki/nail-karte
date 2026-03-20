import BottomNav from '@/components/layout/BottomNav'
import SideNav from '@/components/layout/SideNav'

// 認証後のアプリレイアウト（Nav あり）
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      {/* PC: SideNav */}
      <SideNav />

      {/* メインコンテンツ */}
      <main className="md:ml-60 pb-20 md:pb-0">
        {children}
      </main>

      {/* スマホ: BottomNav */}
      <BottomNav />
    </div>
  )
}
