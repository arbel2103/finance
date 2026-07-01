import { useMemo, useState } from 'react'
import { StatCard } from '../ui/StatCard'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { NumberInput, Field } from '../ui/Input'
import { useStore } from '../../store/useStore'
import { collectSavingLinks, totalByType, totalCapital } from '../../store/selectors'
import { formatCurrency } from '../../lib/format'
import { formatDate } from '../../lib/date'

export function CapitalSummary() {
  const accounts = useStore((s) => s.accounts)
  const expenses = useStore((s) => s.expenses)
  const months = useStore((s) => s.months)
  const checking = useStore((s) => s.checking)
  const setChecking = useStore((s) => s.setChecking)

  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')

  const links = useMemo(
    () => collectSavingLinks(expenses, months, accounts),
    [expenses, months, accounts],
  )
  const investments = totalByType(accounts, links, 'investment')
  const savings = totalByType(accounts, links, 'savings')
  const total = totalCapital(accounts, links, checking.amount)

  const openChecking = () => {
    setVal(checking.amount ? String(checking.amount) : '')
    setOpen(true)
  }
  const save = () => {
    setChecking(Number(val) || 0)
    setOpen(false)
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label='סה"כ השקעות' value={formatCurrency(investments)} icon="📈" />
        <StatCard label='סה"כ חסכונות' value={formatCurrency(savings)} icon="🏦" />
        <StatCard
          label="עו״ש"
          value={formatCurrency(checking.amount)}
          sub={`עודכן ${formatDate(checking.updatedAt)} · לחץ לעדכון`}
          icon="✏️"
          onClick={openChecking}
        />
        <StatCard label='סה"כ הון' value={formatCurrency(total)} icon="💎" accent />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="עדכון יתרת עו״ש"
        footer={
          <>
            <Button onClick={save}>שמירה</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              ביטול
            </Button>
          </>
        }
      >
        <Field label="יתרה נוכחית בעו״ש">
          <NumberInput
            autoFocus
            value={val}
            placeholder="0"
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        </Field>
      </Modal>
    </>
  )
}
