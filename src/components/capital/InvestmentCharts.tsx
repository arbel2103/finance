import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useStore } from '../../store/useStore'
import { Card } from '../ui/Card'
import { monthLabelShort } from '../../lib/date'
import { formatCurrency, formatPercent } from '../../lib/format'
import { accountColor } from './investColors'

export function InvestmentCharts() {
  const accounts = useStore((s) => s.accounts)
  const investments = useStore((s) => s.investments)
  const months = useStore((s) => s.months)

  const investMonths = useMemo(() => {
    const set = new Set<string>()
    investments.forEach((i) => set.add(i.monthKey))
    return [...set].sort()
  }, [investments])

  const colorByAccount = useMemo(() => {
    const map: Record<string, string> = {}
    accounts.forEach((a, i) => (map[a.id] = accountColor(i)))
    return map
  }, [accounts])

  // נתוני גרף ערימה — מפתח לכל חשבון
  const stackedData = useMemo(() => {
    return investMonths.map((mk) => {
      const row: Record<string, number | string> = { label: monthLabelShort(mk) }
      accounts.forEach((a) => {
        row[a.id] = investments
          .filter((inv) => inv.monthKey === mk && inv.accountId === a.id)
          .reduce((s, inv) => s + inv.amount, 0)
      })
      return row
    })
  }, [investMonths, accounts, investments])

  // נתוני אחוז מהמשכורת
  const percentData = useMemo(() => {
    return investMonths.map((mk) => {
      const total = investments
        .filter((inv) => inv.monthKey === mk)
        .reduce((s, inv) => s + inv.amount, 0)
      const salary = months[mk]?.salary ?? 0
      return {
        label: monthLabelShort(mk),
        value: salary > 0 ? (total / salary) * 100 : 0,
        hasSalary: salary > 0,
      }
    })
  }, [investMonths, investments, months])

  if (investMonths.length === 0) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-ink-400">
          עדיין לא תועדו השקעות. הוסף השקעה כדי לראות גרפים.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="space-y-3">
        <h3 className="text-sm font-medium text-ink-700">
          השקעה חודשית לפי חשבון
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stackedData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b6862' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8f8c85' }}
              axisLine={false}
              tickLine={false}
              width={56}
              orientation="right"
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              formatter={(v, name) => [
                formatCurrency(Number(v), true),
                accounts.find((a) => a.id === name)?.name ?? String(name),
              ]}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e9e5db',
                fontSize: 13,
              }}
            />
            <Legend
              formatter={(value) => accounts.find((a) => a.id === value)?.name ?? value}
              wrapperStyle={{ fontSize: 12 }}
            />
            {accounts.map((a) => (
              <Bar
                key={a.id}
                dataKey={a.id}
                stackId="invest"
                fill={colorByAccount[a.id]}
                radius={[4, 4, 0, 0]}
                maxBarSize={56}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-sm font-medium text-ink-700">
          השקעה כאחוז מהמשכורת
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={percentData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b6862' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8f8c85' }}
              axisLine={false}
              tickLine={false}
              width={40}
              orientation="right"
              tickFormatter={(v) => `${Math.round(v)}%`}
            />
            <Tooltip
              formatter={(v) => [formatPercent(Number(v)), 'מהמשכורת']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e9e5db',
                fontSize: 13,
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
              {percentData.map((d, i) => (
                <Cell key={i} fill={d.hasSalary ? '#4a8fb0' : '#cbd5d1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-ink-400">
          חודשים ללא משכורת מוזנת מוצגים כ-0%. הזן משכורת בדף ההוצאות.
        </p>
      </Card>
    </div>
  )
}
