import { StatCard } from '../ui/StatCard'
import type { Expense, MonthData, MonthKey } from '../../lib/types'
import {
  averageTransaction,
  monthTotalSpending,
  topCategory,
  transactionCount,
} from '../../store/selectors'
import { formatCurrency, formatNumber } from '../../lib/format'
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label='סה"כ הוצאות' value={formatCurrency(total)} icon="💸" />
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
