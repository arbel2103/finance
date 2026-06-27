import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Expense } from '../../lib/types'
import { useStore } from '../../store/useStore'
import { effectiveAmount } from '../../store/selectors'
import { categoryColor, categoryIcon } from '../../lib/categories'
import { formatCurrency } from '../../lib/format'
import { formatDate } from '../../lib/date'
import { CategorySelect } from '../CategorySelect'
import { NumberInput, Select } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props {
  expenses: Expense[]
}

type EditMode = 'category' | 'refund' | 'goal'

export function ExpenseList({ expenses }: Props) {
  const accounts = useStore((s) => s.accounts)
  const updateExpenseCategory = useStore((s) => s.updateExpenseCategory)
  const setExpenseRefund = useStore((s) => s.setExpenseRefund)
  const setExpenseGoal = useStore((s) => s.setExpenseGoal)

  const [editing, setEditing] = useState<{ id: string; mode: EditMode } | null>(
    null,
  )

  const goalOptions = useMemo(
    () =>
      accounts.flatMap((a) =>
        a.goals.map((g) => ({ id: g.id, label: `${a.name} · ${g.name}` })),
      ),
    [accounts],
  )

  const goalLabel = (goalId?: string) => {
    if (!goalId) return null
    const opt = goalOptions.find((o) => o.id === goalId)
    return opt?.label ?? null
  }

  const toggle = (id: string, mode: EditMode) =>
    setEditing((cur) => (cur && cur.id === id && cur.mode === mode ? null : { id, mode }))

  if (!expenses.length) {
    return (
      <div className="py-10 text-center text-sm text-ink-400">
        אין הוצאות להצגה.
      </div>
    )
  }

  return (
    <div className="divide-y divide-sand-200">
      {expenses.map((e) => {
        const isOpen = editing?.id === e.id
        return (
          <div key={e.id} className="py-2.5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
                style={{ background: `${categoryColor(e.category)}22` }}
              >
                {categoryIcon(e.category)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink-900">
                    {e.merchant}
                  </span>
                  {e.pending && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                      בקליטה
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <span>{formatDate(e.date)}</span>
                  <span>·</span>
                  <span style={{ color: categoryColor(e.category) }}>
                    {e.category}
                  </span>
                  {e.refund > 0 && (
                    <span className="text-emerald-600">
                      · הוחזר {formatCurrency(e.refund)}
                    </span>
                  )}
                  {e.savingsGoalId && (
                    <span className="text-sage-600">· 🎯 {goalLabel(e.savingsGoalId)}</span>
                  )}
                </div>
              </div>

              <div className="text-left shrink-0">
                <div className="text-sm font-semibold num">
                  {formatCurrency(effectiveAmount(e), true)}
                </div>
                {e.refund > 0 && (
                  <div className="text-[11px] text-ink-400 line-through num">
                    {formatCurrency(e.chargeAmount ?? e.txnAmount, true)}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <IconBtn label="קטגוריה" active={isOpen && editing?.mode === 'category'} onClick={() => toggle(e.id, 'category')}>
                  🏷️
                </IconBtn>
                <IconBtn label="החזר" active={isOpen && editing?.mode === 'refund'} onClick={() => toggle(e.id, 'refund')}>
                  ↩️
                </IconBtn>
                <IconBtn
                  label="שיוך חיסכון"
                  active={isOpen && editing?.mode === 'goal'}
                  onClick={() => toggle(e.id, 'goal')}
                >
                  🎯
                </IconBtn>
              </div>
            </div>

            {isOpen && (
              <div className="mt-2 rounded-xl bg-sand-50 p-3">
                {editing?.mode === 'category' && (
                  <div className="max-w-xs">
                    <CategorySelect
                      value={e.category}
                      onChange={(c) => {
                        updateExpenseCategory(e.id, c)
                        setEditing(null)
                      }}
                    />
                  </div>
                )}

                {editing?.mode === 'refund' && (
                  <RefundEditor
                    expense={e}
                    onSave={(v) => {
                      setExpenseRefund(e.id, v)
                      setEditing(null)
                    }}
                  />
                )}

                {editing?.mode === 'goal' && (
                  <div className="max-w-sm">
                    {goalOptions.length === 0 ? (
                      <p className="text-xs text-ink-400">
                        עדיין לא הוגדרו מטרות חיסכון. הוסף מטרה בדף "הון והשקעות".
                      </p>
                    ) : (
                      <Select
                        value={e.savingsGoalId ?? ''}
                        onChange={(ev) => {
                          setExpenseGoal(e.id, ev.target.value || undefined)
                          setEditing(null)
                        }}
                      >
                        <option value="">ללא שיוך</option>
                        {goalOptions.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function IconBtn({
  children,
  label,
  active,
  onClick,
}: {
  children: ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
        active ? 'bg-sage-100' : 'hover:bg-sand-100'
      }`}
    >
      {children}
    </button>
  )
}

function RefundEditor({
  expense,
  onSave,
}: {
  expense: Expense
  onSave: (refund: number) => void
}) {
  const [val, setVal] = useState(String(expense.refund || ''))
  const base = expense.chargeAmount ?? expense.txnAmount
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <span className="mb-1 block text-xs text-ink-500">
          סכום שחבר החזיר לי
        </span>
        <div className="w-40">
          <NumberInput
            autoFocus
            value={val}
            placeholder="0"
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave(Number(val) || 0)}
          />
        </div>
      </div>
      <div className="text-xs text-ink-400">
        הסכום החדש:{' '}
        <span className="font-medium text-ink-700 num">
          {formatCurrency(Math.max(0, base - (Number(val) || 0)), true)}
        </span>
      </div>
      <Button size="sm" onClick={() => onSave(Number(val) || 0)}>
        שמירה
      </Button>
    </div>
  )
}
