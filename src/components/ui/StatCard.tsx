import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: string
  accent?: boolean
  onClick?: () => void
}

export function StatCard({ label, value, sub, icon, accent, onClick }: StatCardProps) {
  const clickable = !!onClick
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 border shadow-soft transition-shadow ${
        accent
          ? 'bg-sage-600 border-sage-700 text-white'
          : 'bg-white border-sand-200/70 text-ink-900'
      } ${clickable ? 'cursor-pointer hover:shadow-card' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium ${accent ? 'text-sage-50' : 'text-ink-500'}`}
        >
          {label}
        </span>
        {icon && <span className="text-base opacity-80">{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight num">{value}</div>
      {sub && (
        <div className={`mt-1 text-xs ${accent ? 'text-sage-50/90' : 'text-ink-400'}`}>
          {sub}
        </div>
      )}
    </div>
  )
}
