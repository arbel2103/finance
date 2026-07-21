import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { NumberInput, TextInput, Field } from '../ui/Input'
import { monthLabel } from '../../lib/date'

// כפתור קטן להוספת הכנסה ידנית לחודש הנבחר (נכנס ל"הכנסות נוספות")
export function ManualIncomeButton() {
  const selectedMonth = useStore((s) => s.selectedMonth)
  const addExtraIncome = useStore((s) => s.addExtraIncome)

  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')

  const submit = () => {
    const amt = Number(amount)
    if (!label.trim() || !amt) return
    addExtraIncome(selectedMonth, label.trim(), amt)
    setLabel('')
    setAmount('')
    setOpen(false)
  }

  return (
    <>
      <Button variant="subtle" onClick={() => setOpen(true)}>
        ＋ הכנסה
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`הוספת הכנסה — ${monthLabel(selectedMonth)}`}
        footer={
          <>
            <Button onClick={submit}>הוספה</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              סגירה
            </Button>
          </>
        }
      >
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="תיאור">
              <TextInput
                autoFocus
                value={label}
                placeholder="למשל: מתנה, בונוס, החזר"
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </Field>
          </div>
          <div className="w-32">
            <Field label="סכום">
              <NumberInput
                value={amount}
                placeholder="0"
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </Field>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-ink-400">
          ההכנסה מתווספת ל"הכנסות נוספות" של החודש ונכללת בסך ההכנסות (משכורת +
          הכנסות נוספות).
        </p>
      </Modal>
    </>
  )
}
