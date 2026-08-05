import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/expenses', label: 'מעקב הוצאות', icon: '💳' },
  { to: '/capital', label: 'הון והשקעות', icon: '📈' },
]

/** Download the persisted finance data so it can be imported into TriLife. */
function exportData() {
  const data = localStorage.getItem('finance-store')
  if (!data) {
    alert('לא נמצאו נתונים לייצוא בדפדפן הזה.')
    return
  }
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const today = new Date().toISOString().slice(0, 10)
  a.download = `finance-backup-${today}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* סרגל צד (דסקטופ) */}
      <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-l border-sand-200 bg-white/60 backdrop-blur px-4 py-6 gap-1">
        <div className="px-2 mb-6">
          <div className="text-lg font-semibold text-ink-900">מעקב פיננסי</div>
          <div className="text-xs text-ink-400">ניהול חכם של הכסף שלך</div>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sage-50 text-sage-700'
                  : 'text-ink-500 hover:bg-sand-100 hover:text-ink-900'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={exportData}
          className="mt-auto mx-2 rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-medium text-ink-500 hover:bg-sand-100 hover:text-ink-900 transition-colors text-start"
        >
          ⬇️ ייצוא נתונים ל-TriLife
        </button>
        <div className="px-2 pt-3 text-[11px] leading-relaxed text-ink-400">
          העברנו את הפיננסים ל-TriLife. ייצא כאן וייבא שם.
        </div>
      </aside>

      {/* ניווט עליון (מובייל) */}
      <nav className="md:hidden sticky top-0 z-30 flex items-center gap-1 border-b border-sand-200 bg-white/90 backdrop-blur px-3 py-2">
        <span className="font-semibold text-ink-900 me-2">מעקב פיננסי</span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium ${
                isActive ? 'bg-sage-50 text-sage-700' : 'text-ink-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={exportData}
          className="ms-auto rounded-lg px-2.5 py-1.5 text-sm font-medium text-sage-700"
        >
          ⬇️ ייצוא
        </button>
      </nav>

      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
