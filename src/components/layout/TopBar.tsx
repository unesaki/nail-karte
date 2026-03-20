'use client'

interface TopBarProps {
  title: string
  right?: React.ReactNode
}

export default function TopBar({ title, right }: TopBarProps) {
  return (
    <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 sticky top-0 z-40">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </header>
  )
}
