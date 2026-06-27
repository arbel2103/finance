import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { NumberInput, Select, Field } from '../ui/Input'
import { addMonths, monthLabel } from '../../lib/date'

export function InvestmentInput() {
  const accounts = useStore((s) => s.accounts)
  const selectedMonth = useStore((s) => s.selectedMonth)
  const addInvestment = useStore((s) => s.addInvestment)

  const [month, setMonth] = useState(selectedMonth)
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')

  const monthOptions = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < 18; i++) set.add(addMonths(selectedMonth, -i))
    return [...set].sort().reverse()
  }, [selectedMonth])

  const submit = () => {
    const amt = Number(amount)
    const acc = accountId || accounts[0]?.id
    if (!amt || !acc) return
    addInvestment(month, amt, acc)
    setAmount('')
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-400">
          כדי לתעד השקעות, צריך קודם להוסיף חשבון בטאב "מעקב הון".
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-ink-700">תיעוד השקעה חדשה</h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <Field label="חודש">
          <Select value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="סכום שהושקע">
          <NumberInput
            value={amount}
            placeholder="0"
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </Field>
        <Field label="חשבון יעד">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Button onClick={submit}>הוסף השקעה</Button>
      </div>
    </Card>
  )
}
