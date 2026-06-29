import * as XLSX from 'xlsx'
import type { Expense, MonthKey } from './types'
import { excelSerialToISO, monthKeyFromISO } from './date'
import { mapCategory } from './categories'

// זיהוי שורת ביט / "שונות"
export function isBitRow(rawCategory: string, merchant: string): boolean {
  const m = (merchant || '').toUpperCase()
  return (
    rawCategory.trim() === 'שונות' ||
    m.includes('BIT') ||
    m.includes('ביט') ||
    m.includes('PAYBOX') ||
    m.includes('פייבוקס')
  )
}

function normalize(v: unknown): string {
  return String(v ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return v
  const cleaned = String(v).replace(/[₪,\s]/g, '')
  const n = Number(cleaned)
  return isNaN(n) ? null : n
}

function toISO(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return excelSerialToISO(v)
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  // פורמט dd/mm/yyyy
  const s = String(v).trim()
  const m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})$/)
  if (m) {
    const [, d, mo, y] = m
    const year = y.length === 2 ? 2000 + Number(y) : Number(y)
    return `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

const HEADER_ALIASES: Record<string, string> = {
  'תאריך עסקה': 'date',
  'שם בית עסק': 'merchant',
  'סכום עסקה': 'txn',
  'סכום חיוב': 'charge',
  'סוג עסקה': 'type',
  ענף: 'category',
  הערות: 'note',
}

export interface ParseResult {
  expenses: Expense[]
  total: number
  bitCount: number
  monthKey: MonthKey // החודש שזוהה אוטומטית מתאריכי העסקאות
  card: string // מזהה הכרטיס שזוהה (4 ספרות / שם קובץ)
}

// זיהוי מזהה הכרטיס מתוך כותרת הדוח, ובגיבוי משם הקובץ
function detectCard(titleText: string, fileName: string): string {
  // "...לכרטיס ויזה ... המסתיים ב-8806"
  let m = titleText.match(/מסתיים\s*ב[-\s]*?(\d{3,4})/)
  if (m) return m[1]
  m = titleText.match(/כרטיס[^\d]{0,30}?(\d{4})\b/)
  if (m) return m[1]
  // מתוך שם הקובץ: "...ויזה 8806 - 05.26.xlsx"
  m = fileName.match(/(?:ויזה|כרטיס|card|mastercard|visa)\D{0,10}(\d{4})/i)
  if (m) return m[1]
  m = fileName.match(/\b(\d{4})\b/)
  if (m) return m[1]
  // גיבוי: שם הקובץ ללא סיומת
  const base = fileName.replace(/\.[^.]+$/, '').trim()
  return base || 'כרטיס'
}

// קביעת חודש היעד מתוך תאריכי העסקאות — החודש השכיח ביותר (ובשוויון, המאוחר)
function detectMonth(isoDates: string[]): MonthKey {
  const counts = new Map<MonthKey, number>()
  for (const iso of isoDates) {
    const mk = monthKeyFromISO(iso)
    counts.set(mk, (counts.get(mk) || 0) + 1)
  }
  let best: MonthKey = isoDates.length ? monthKeyFromISO(isoDates[0]) : ''
  let bestCount = -1
  for (const [mk, c] of counts) {
    if (c > bestCount || (c === bestCount && mk > best)) {
      best = mk
      bestCount = c
    }
  }
  return best
}

let _seq = 0
function uid(prefix = 'e'): string {
  _seq += 1
  return `${prefix}_${Date.now().toString(36)}_${_seq}`
}

/**
 * מפרסר קובץ אקסל של דוח אשראי (כאל/ויזה) לרשימת הוצאות.
 * החודש והכרטיס נקבעים אוטומטית מתוך הקובץ.
 * @param buffer תוכן הקובץ
 * @param userMap מיפוי ענף→קטגוריה (דריסות המשתמש)
 * @param fileName שם הקובץ (לגיבוי זיהוי הכרטיס)
 */
export function parseExpensesFromBuffer(
  buffer: ArrayBuffer,
  userMap: Record<string, string>,
  fileName = '',
): ParseResult {
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    blankrows: false,
  })

  // איתור שורת הכותרת
  let headerIdx = -1
  for (let i = 0; i < rows.length; i++) {
    const cells = (rows[i] || []).map(normalize)
    if (cells.some((c) => c.includes('בית עסק'))) {
      headerIdx = i
      break
    }
  }
  if (headerIdx === -1) {
    throw new Error('לא נמצאה שורת כותרת תקינה בקובץ. ודא שזהו דוח עסקאות אשראי.')
  }

  // טקסט הכותרת (השורות שלפני שורת הכותרת) לזיהוי מספר הכרטיס
  const titleText = rows
    .slice(0, headerIdx)
    .map((r) => (r || []).map(normalize).join(' '))
    .join(' ')
  const card = detectCard(titleText, fileName)

  // מיפוי עמודות לפי כותרת
  const headerCells = (rows[headerIdx] || []).map(normalize)
  const col: Record<string, number> = {}
  headerCells.forEach((label, idx) => {
    const key = HEADER_ALIASES[label]
    if (key && col[key] === undefined) col[key] = idx
  })

  // ברירת מחדל לעמודות אם הכותרת לא תאמה (מבנה כאל הקבוע: A–G)
  if (col.date === undefined) col.date = 0
  if (col.merchant === undefined) col.merchant = 1
  if (col.txn === undefined) col.txn = 2
  if (col.charge === undefined) col.charge = 3
  if (col.type === undefined) col.type = 4
  if (col.category === undefined) col.category = 5
  if (col.note === undefined) col.note = 6

  const expenses: Expense[] = []
  let total = 0
  let bitCount = 0

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] || []
    const merchant = normalize(row[col.merchant])
    const iso = toISO(row[col.date])
    // שורת footer / שורות ריקות — אין תאריך תקין או אין שם בית עסק
    if (!merchant || !iso) continue

    const txn = toNumber(row[col.txn])
    const charge = toNumber(row[col.charge])
    if (txn === null && charge === null) continue // לא שורת הוצאה

    const rawCategory = normalize(row[col.category]) || 'שונות'
    const note = normalize(row[col.note])
    const pending = note.includes('קליטה') || charge === null
    const bit = isBitRow(rawCategory, merchant)
    if (bit) bitCount++

    const exp: Expense = {
      id: uid(),
      monthKey: '', // ייקבע אחרי זיהוי החודש מהתאריכים
      card,
      date: iso,
      merchant,
      rawCategory,
      category: mapCategory(rawCategory, userMap),
      txnAmount: txn ?? charge ?? 0,
      chargeAmount: charge,
      refund: 0,
      pending,
      isBit: bit,
    }
    expenses.push(exp)
    total += (charge ?? txn ?? 0)
  }

  // זיהוי החודש מהתאריכים ושיוך כל ההוצאות לאותו חודש
  const monthKey = detectMonth(expenses.map((e) => e.date))
  for (const e of expenses) e.monthKey = monthKey

  return { expenses, total, bitCount, monthKey, card }
}
