import { useState } from 'react'
import type { AccountType } from '../../lib/types'
import { useStore } from '../../store/useStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { TextInput, Field } from '../ui/Input'

export function AddAccount() {
  const addAccount = useStore((s) => s.addAccount)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('savings')

  const submit = () => {
    if (!name.trim()) return
    addAccount(name.trim(), type)
    setName('')
    setType('savings')
    setOpen(false)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        + הוספת חשבון
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="הוספת חשבון חדש"
        footer={
          <>
            <Button onClick={submit}>יצירה</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              ביטול
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="שם החשבון">
            <TextInput
              autoFocus
              value={name}
              placeholder="למשל: קופת גמל, קרן השתלמות, פיקדון"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-ink-500">
              סוג החשבון
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'savings', label: 'חיסכון', icon: '🏦' },
                  { id: 'investment', label: 'השקעה', icon: '📈' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setType(opt.id)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    type === opt.id
                      ? 'border-sage-500 bg-sage-50 text-sage-700'
                      : 'border-sand-200 bg-white text-ink-500 hover:bg-sand-50'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
