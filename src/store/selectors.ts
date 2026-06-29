import type {
  Account,
  Expense,
  Goal,
  InvestmentEntry,
  MonthData,
  MonthKey,
} from '../lib/types'

// סכום אפקטיבי של הוצאה: סכום חיוב (או עסקה אם בקליטה) פחות החזר
export function effectiveAmount(e: Expense): number {
  const base = e.chargeAmount ?? e.txnAmount
  return Math.max(0, base - (e.refund || 0))
}

export function monthExpenses(expenses: Expense[], mk: MonthKey): Expense[] {
  return expenses.filter((e) => e.monthKey === mk)
}

// סך הוצאות אשראי (בלי העברות בנקאיות ידניות)
export function creditTotal(expenses: Expense[], mk: MonthKey): number {
  return monthExpenses(expenses, mk).reduce((s, e) => s + effectiveAmount(e), 0)
}

export function bankTransfersTotal(month: MonthData | undefined): number {
  if (!month) return 0
  return month.bankTransfers.reduce((s, t) => s + t.amount, 0)
}

// סך הוצאות חודשי כולל = אשראי + העברות בנקאיות
export function monthTotalSpending(
  expenses: Expense[],
  month: MonthData | undefined,
  mk: MonthKey,
): number {
  return creditTotal(expenses, mk) + bankTransfersTotal(month)
}

export function monthIncome(month: MonthData | undefined): number {
  if (!month) return 0
  return (
    month.salary + month.extraIncome.reduce((s, i) => s + i.amount, 0)
  )
}

export interface CategorySlice {
  category: string
  value: number
}

// התפלגות לפי קטגוריה (לעוגה) — מאוחד לפי קטגוריה קנונית
export function categoryBreakdown(
  expenses: Expense[],
  mk: MonthKey,
): CategorySlice[] {
  const map = new Map<string, number>()
  for (const e of monthExpenses(expenses, mk)) {
    map.set(e.category, (map.get(e.category) || 0) + effectiveAmount(e))
  }
  return [...map.entries()]
    .map(([category, value]) => ({ category, value }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)
}

export function topCategory(
  expenses: Expense[],
  mk: MonthKey,
): { category: string; value: number } | null {
  const b = categoryBreakdown(expenses, mk)
  return b.length ? b[0] : null
}

export function transactionCount(expenses: Expense[], mk: MonthKey): number {
  return monthExpenses(expenses, mk).length
}

export interface CardSlice {
  card: string
  value: number
  count: number
}

// פירוט הוצאות לפי כרטיס אשראי (מהגבוה לנמוך)
export function cardBreakdown(expenses: Expense[], mk: MonthKey): CardSlice[] {
  const map = new Map<string, { value: number; count: number }>()
  for (const e of monthExpenses(expenses, mk)) {
    const key = e.card || 'כרטיס'
    const cur = map.get(key) || { value: 0, count: 0 }
    cur.value += effectiveAmount(e)
    cur.count += 1
    map.set(key, cur)
  }
  return [...map.entries()]
    .map(([card, v]) => ({ card, value: v.value, count: v.count }))
    .sort((a, b) => b.value - a.value)
}

export function averageTransaction(expenses: Expense[], mk: MonthKey): number {
  const list = monthExpenses(expenses, mk)
  if (!list.length) return 0
  return creditTotal(expenses, mk) / list.length
}

// ===== הון =====

export function accountByGoalId(
  accounts: Account[],
  goalId: string | undefined,
): Account | undefined {
  if (!goalId) return undefined
  return accounts.find((a) => a.goals.some((g) => g.id === goalId))
}

// סך ההוצאות ששויכו לחשבון מסוים (דרך מטרותיו)
export function expensesLinkedToAccount(
  expenses: Expense[],
  account: Account,
): number {
  const goalIds = new Set(account.goals.map((g) => g.id))
  return expenses
    .filter((e) => e.savingsGoalId && goalIds.has(e.savingsGoalId))
    .reduce((s, e) => s + effectiveAmount(e), 0)
}

// יתרה אפקטיבית = יתרה ידנית פחות הוצאות משויכות
export function accountEffectiveBalance(
  account: Account,
  expenses: Expense[],
): number {
  return account.balance - expensesLinkedToAccount(expenses, account)
}

// סכום ששויך למטרה
export function goalAllocated(goal: Goal, expenses: Expense[]): number {
  return expenses
    .filter((e) => e.savingsGoalId === goal.id)
    .reduce((s, e) => s + effectiveAmount(e), 0)
}

// כמה חסר למטרה (null אם אין יעד)
export function goalRemaining(goal: Goal, expenses: Expense[]): number | null {
  if (goal.targetAmount === undefined || goal.targetAmount === null) return null
  return Math.max(0, goal.targetAmount - goalAllocated(goal, expenses))
}

// סך החסר לכל מטרות החשבון (רק מטרות עם יעד)
export function accountRemainingToGoals(
  account: Account,
  expenses: Expense[],
): number {
  return account.goals.reduce((s, g) => {
    const r = goalRemaining(g, expenses)
    return s + (r ?? 0)
  }, 0)
}

export function totalByType(
  accounts: Account[],
  expenses: Expense[],
  type: 'savings' | 'investment',
): number {
  return accounts
    .filter((a) => a.type === type)
    .reduce((s, a) => s + accountEffectiveBalance(a, expenses), 0)
}

export function totalCapital(
  accounts: Account[],
  expenses: Expense[],
  checkingAmount: number,
): number {
  return (
    totalByType(accounts, expenses, 'savings') +
    totalByType(accounts, expenses, 'investment') +
    checkingAmount
  )
}

// ===== השקעות =====

export function investmentsByMonth(
  investments: InvestmentEntry[],
  mk: MonthKey,
): InvestmentEntry[] {
  return investments.filter((i) => i.monthKey === mk)
}

export function investmentMonthTotal(
  investments: InvestmentEntry[],
  mk: MonthKey,
): number {
  return investmentsByMonth(investments, mk).reduce((s, i) => s + i.amount, 0)
}

// ===== כללי =====

// כל החודשים שיש בהם נתונים (מהישן לחדש)
export function allDataMonths(
  months: Record<MonthKey, MonthData>,
  expenses: Expense[],
  investments: InvestmentEntry[],
): MonthKey[] {
  const set = new Set<MonthKey>(Object.keys(months))
  expenses.forEach((e) => set.add(e.monthKey))
  investments.forEach((i) => set.add(i.monthKey))
  return [...set].sort()
}
