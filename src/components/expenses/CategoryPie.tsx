import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategorySlice } from '../../store/selectors'
import { categoryColor } from '../../lib/categories'
import { formatCurrency } from '../../lib/format'

interface Props {
  data: CategorySlice[]
  activeCategory: string | null
  onSlice: (category: string | null) => void
}

export function CategoryPie({ data, activeCategory, onSlice }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-400">
        אין נתונים להצגה — טען קובץ אקסל לחודש זה.
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative h-64 w-64 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={96}
              paddingAngle={2}
              stroke="none"
              onClick={(_, idx) => {
                const cat = data[idx].category
                onSlice(activeCategory === cat ? null : cat)
              }}
            >
              {data.map((d) => (
                <Cell
                  key={d.category}
                  fill={categoryColor(d.category)}
                  opacity={
                    activeCategory && activeCategory !== d.category ? 0.3 : 1
                  }
                  className="cursor-pointer outline-none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => formatCurrency(Number(v), true)}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e9e5db',
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-ink-400">סה"כ</span>
          <span className="text-lg font-semibold num">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* מקרא לחיץ */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full">
        {data.map((d) => {
          const pct = total ? Math.round((d.value / total) * 100) : 0
          const active = activeCategory === d.category
          return (
            <button
              key={d.category}
              onClick={() => onSlice(active ? null : d.category)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-right transition-colors ${
                active ? 'bg-sand-100' : 'hover:bg-sand-50'
              } ${activeCategory && !active ? 'opacity-50' : ''}`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: categoryColor(d.category) }}
              />
              <span className="flex-1 text-sm text-ink-700 truncate">
                {d.category}
              </span>
              <span className="text-sm font-medium num">{formatCurrency(d.value)}</span>
              <span className="w-9 text-left text-xs text-ink-400 num">{pct}%</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
