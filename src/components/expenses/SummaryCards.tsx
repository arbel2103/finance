import { StatCard } from '../ui/StatCard'
import type { Expense, MonthData, MonthKey } from '../../lib/types'
import {
  averageTransaction,
  bankTransfersTotal,
  cardBreakdown,
  monthTotalSpending,
  topCategory,
  transactionCount,
} from '../../store/selectors'
import { formatCard, formatCurrency, formatNumber } from '../../lib/format'
import { categoryIcon } from '../../lib/categories'

interface Props {
  expenses: Expense[]
  month: MonthData | undefined
  mk: MonthKey
}

export function SummaryCards({ expenses, month, mk }: Props) {
  const total = monthTotalSpending(expenses, month, mk)
  const count = transactionCount(expenses, mk)
  const top = topCategory(expenses, mk)
  const avg = averageTransaction(expenses, mk)

  const cards = cardBreakdown(expenses, mk)
  const transfers = bankTransfersTotal(month)
  // הצג פירוט רק כשיש יותר ממקור הוצאות אחד
  const showBreakdown = cards.length + (transfers > 0 ? 1 : 0) > 1

  const breakdown = showBreakdown ? (
    <div className="mt-2 space-y-1 border-t border-sand-200 pt-2">
      {cards.map((c) => (
        <div key={c.card} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-ink-500">
            💳 {formatCard(c.card)}
          </span>
          <span className="font-medium text-ink-700 num">
            {formatCurrency(c.value)}
          </span>
        </div>
      ))}
      {transfers > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-ink-500">🏦 העברה בנקאית</span>
          <span className="font-medium text-ink-700 num">
            {formatCurrency(transfers)}
          </span>
        </div>
      )}
    </div>
  ) : undefined

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-start">
      <StatCard
        label='סה"כ הוצאות (כל הכרטיסים)'
        value={formatCurrency(total)}
        sub={breakdown}
        icon="💸"
      />
      <StatCard label='סה"כ עסקאות' value={formatNumber(count)} icon="🧾" />
      <StatCard
        label="הקטגוריה המובילה"
        value={
          top ? (
            <span className="text-base font-semibold">{top.category}</span>
          ) : (
            '—'
          )
        }
        sub={top ? formatCurrency(top.value) : undefined}
        icon={top ? categoryIcon(top.category) : '🏆'}
      />
      <StatCard label="ממוצע לעסקה" value={formatCurrency(avg)} icon="📊" />
    </div>
  )
}
