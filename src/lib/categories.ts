// ===== מערכת הקטגוריות הקנונית =====

export interface CategoryDef {
  name: string
  color: string
  icon: string // emoji לתצוגה
}

// סט קנוני חכם — "מזון וסופר" ו"מסעדות ואוכל בחוץ" נשארות נפרדות
export const CANONICAL_CATEGORIES: CategoryDef[] = [
  { name: 'מזון וסופר', color: '#5f7f5f', icon: '🛒' },
  { name: 'מסעדות ואוכל בחוץ', color: '#d08a4f', icon: '🍽️' },
  { name: 'פנאי ובילוי', color: '#7b6bb0', icon: '🎭' },
  { name: 'קניות ואופנה', color: '#d489ad', icon: '🛍️' },
  { name: 'בית וריהוט', color: '#94965a', icon: '🏠' },
  { name: 'בריאות וטיפוח', color: '#cf5b6a', icon: '⚕️' },
  { name: 'דלק ותחבורה', color: '#4a8fb0', icon: '⛽' },
  { name: 'תקשורת וטכנולוגיה', color: '#36a0a0', icon: '💻' },
  { name: 'תיירות ונסיעות', color: '#e3b34d', icon: '✈️' },
  { name: 'ילדים', color: '#9b8ec9', icon: '🧸' },
  { name: 'תרומות', color: '#b08a3a', icon: '🤝' },
  { name: 'חשבונות ושירותים', color: '#6f8f86', icon: '🧾' },
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

// מיפוי ברירת מחדל מ"ענף" של הבנק (כאל/ויזה) → קטגוריה קנונית
export const DEFAULT_CATEGORY_MAP: Record<string, string> = {
  // אוכל
  'מזון ומשקאות': 'מזון וסופר',
  סופרמרקט: 'מזון וסופר',
  מסעדות: 'מסעדות ואוכל בחוץ',
  'בתי קפה': 'מסעדות ואוכל בחוץ',
  'מזון מהיר': 'מסעדות ואוכל בחוץ',
  // פנאי
  'פנאי בילוי': 'פנאי ובילוי',
  'פנאי ובילוי': 'פנאי ובילוי',
  אירועים: 'פנאי ובילוי',
  בידור: 'פנאי ובילוי',
  ספורט: 'פנאי ובילוי',
  // קניות
  אופנה: 'קניות ואופנה',
  'הלבשה והנעלה': 'קניות ואופנה',
  // בית
  'ריהוט ובית': 'בית וריהוט',
  'כלי בית': 'בית וריהוט',
  'חשמל ואלקטרוניקה': 'בית וריהוט',
  // בריאות וטיפוח
  'רפואה ובריאות': 'בריאות וטיפוח',
  בריאות: 'בריאות וטיפוח',
  'בריאות ויופי': 'בריאות וטיפוח',
  'טיפוח ויופי': 'בריאות וטיפוח',
  'בתי מרקחת': 'בריאות וטיפוח',
  // תחבורה
  אנרגיה: 'דלק ותחבורה',
  דלק: 'דלק ותחבורה',
  תחבורה: 'דלק ותחבורה',
  'רכב ותחבורה': 'דלק ותחבורה',
  חניה: 'דלק ותחבורה',
  // טכנולוגיה
  'תקשורת ומחשבים': 'תקשורת וטכנולוגיה',
  'מחשבים ותוכנה': 'תקשורת וטכנולוגיה',
  // תיירות
  תיירות: 'תיירות ונסיעות',
  'נסיעות ותיירות': 'תיירות ונסיעות',
  טיסות: 'תיירות ונסיעות',
  'בתי מלון': 'תיירות ונסיעות',
  // ילדים
  ילדים: 'ילדים',
  צעצועים: 'ילדים',
  // תרומות
  'עמותות ותרומות': 'תרומות',
  // חשבונות ושירותים
  ביטוח: 'חשבונות ושירותים',
  חשבונות: 'חשבונות ושירותים',
  שירותים: 'חשבונות ושירותים',
  'ממשל ומיסים': 'חשבונות ושירותים',
  חינוך: 'חשבונות ושירותים',
  // אחר
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
