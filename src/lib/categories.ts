// ===== מערכת הקטגוריות הקנונית =====

export interface CategoryDef {
  name: string
  color: string
  icon: string // emoji לתצוגה
}

// סט קנוני חכם — "מזון וסופר" ו"מסעדות ואוכל בחוץ" נשארות נפרדות
export const CANONICAL_CATEGORIES: CategoryDef[] = [
  { name: 'מזון וסופר', color: '#5f7f5f', icon: '🛒' },
  { name: 'מסעדות ואוכל בחוץ', color: '#c97b4a', icon: '🍽️' },
  { name: 'פנאי ובילוי', color: '#7b6bb0', icon: '🎭' },
  { name: 'קניות ואופנה', color: '#d08bb0', icon: '🛍️' },
  { name: 'דלק ותחבורה', color: '#4a8fb0', icon: '⛽' },
  { name: 'תקשורת וטכנולוגיה', color: '#3aa0a0', icon: '💻' },
  { name: 'בריאות', color: '#cf5b6a', icon: '⚕️' },
  { name: 'חשבונות ובית', color: '#8a8f5f', icon: '🏠' },
  { name: 'תרומות', color: '#b08a3a', icon: '🤝' },
  { name: 'אחר', color: '#8f8c85', icon: '📦' },
]

export const CATEGORY_NAMES = CANONICAL_CATEGORIES.map((c) => c.name)

const _byName: Record<string, CategoryDef> = Object.fromEntries(
  CANONICAL_CATEGORIES.map((c) => [c.name, c]),
)

export function getCategoryDef(name: string): CategoryDef {
  return _byName[name] ?? { name, color: '#8f8c85', icon: '📦' }
}

export function categoryColor(name: string): string {
  return getCategoryDef(name).color
}

export function categoryIcon(name: string): string {
  return getCategoryDef(name).icon
}

// מיפוי ברירת מחדל מ"ענף" של הבנק → קטגוריה קנונית
export const DEFAULT_CATEGORY_MAP: Record<string, string> = {
  'מזון ומשקאות': 'מזון וסופר',
  מסעדות: 'מסעדות ואוכל בחוץ',
  'פנאי בילוי': 'פנאי ובילוי',
  אירועים: 'פנאי ובילוי',
  'עמותות ותרומות': 'תרומות',
  אנרגיה: 'דלק ותחבורה',
  תחבורה: 'דלק ותחבורה',
  'תקשורת ומחשבים': 'תקשורת וטכנולוגיה',
  אופנה: 'קניות ואופנה',
  'בריאות ויופי': 'בריאות',
  בריאות: 'בריאות',
  שונות: 'אחר',
}

// מיפוי ענף → קנונית, עם דריסות ידניות מה-store
export function mapCategory(
  rawCategory: string,
  userMap: Record<string, string>,
): string {
  return (
    userMap[rawCategory] ??
    DEFAULT_CATEGORY_MAP[rawCategory] ??
    rawCategory ??
    'אחר'
  )
}
