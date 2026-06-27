import { CANONICAL_CATEGORIES } from '../lib/categories'
import { Select } from './ui/Input'

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CategorySelect({ value, onChange, className }: Props) {
  // ודא שהערך הנוכחי קיים גם אם אינו בסט הקנוני
  const inList = CANONICAL_CATEGORIES.some((c) => c.name === value)
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {!inList && value && <option value={value}>{value}</option>}
      {CANONICAL_CATEGORIES.map((c) => (
        <option key={c.name} value={c.name}>
          {c.icon} {c.name}
        </option>
      ))}
    </Select>
  )
}
