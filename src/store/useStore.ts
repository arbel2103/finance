import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Account,
  AccountType,
  Checking,
  Expense,
  InvestmentEntry,
  MonthData,
  MonthKey,
} from '../lib/types'
import { currentMonthKey } from '../lib/date'

function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function emptyMonth(): MonthData {
  return { imported: false, salary: 0, extraIncome: [], bankTransfers: [] }
}

interface State {
  months: Record<MonthKey, MonthData>
  expenses: Expense[]
  categoryMap: Record<string, string>
  checking: Checking
  accounts: Account[]
  investments: InvestmentEntry[]
  selectedMonth: MonthKey

  // ניווט
  setSelectedMonth: (mk: MonthKey) => void

  // ייבוא והוצאות
  commitImport: (mk: MonthKey, expenses: Expense[]) => void
  clearMonthExpenses: (mk: MonthKey) => void
  updateExpenseCategory: (id: string, category: string) => void
  setExpenseRefund: (id: string, refund: number) => void
  setExpenseGoal: (id: string, goalId: string | undefined) => void

  // הכנסות והעברות
  setSalary: (mk: MonthKey, amount: number) => void
  addExtraIncome: (mk: MonthKey, label: string, amount: number) => void
  removeExtraIncome: (mk: MonthKey, id: string) => void
  addBankTransfer: (mk: MonthKey, label: string, amount: number) => void
  removeBankTransfer: (mk: MonthKey, id: string) => void

  // הון
  setChecking: (amount: number) => void
  addAccount: (name: string, type: AccountType) => void
  removeAccount: (id: string) => void
  updateAccountBalance: (id: string, balance: number) => void
  renameAccount: (id: string, name: string) => void
  addGoal: (accountId: string, name: string, targetAmount?: number) => void
  removeGoal: (accountId: string, goalId: string) => void

  // השקעות
  addInvestment: (mk: MonthKey, amount: number, accountId: string) => void
  removeInvestment: (id: string) => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      months: {},
      expenses: [],
      categoryMap: {},
      checking: { amount: 0, updatedAt: new Date().toISOString() },
      accounts: [],
      investments: [],
      selectedMonth: currentMonthKey(),

      setSelectedMonth: (mk) => set({ selectedMonth: mk }),

      commitImport: (mk, expenses) =>
        set((s) => {
          // החלפת הוצאות החודש בייבוא חדש (מונע כפילות)
          const others = s.expenses.filter((e) => e.monthKey !== mk)
          const month = s.months[mk] ?? emptyMonth()
          return {
            expenses: [...others, ...expenses],
            months: { ...s.months, [mk]: { ...month, imported: true } },
          }
        }),

      clearMonthExpenses: (mk) =>
        set((s) => {
          const month = s.months[mk] ?? emptyMonth()
          return {
            expenses: s.expenses.filter((e) => e.monthKey !== mk),
            months: { ...s.months, [mk]: { ...month, imported: false } },
          }
        }),

      updateExpenseCategory: (id, category) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, category } : e,
          ),
        })),

      setExpenseRefund: (id, refund) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, refund: Math.max(0, refund) } : e,
          ),
        })),

      setExpenseGoal: (id, goalId) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, savingsGoalId: goalId } : e,
          ),
        })),

      setSalary: (mk, amount) =>
        set((s) => {
          const month = s.months[mk] ?? emptyMonth()
          return { months: { ...s.months, [mk]: { ...month, salary: amount } } }
        }),

      addExtraIncome: (mk, label, amount) =>
        set((s) => {
          const month = s.months[mk] ?? emptyMonth()
          return {
            months: {
              ...s.months,
              [mk]: {
                ...month,
                extraIncome: [
                  ...month.extraIncome,
                  { id: uid('inc'), label, amount },
                ],
              },
            },
          }
        }),

      removeExtraIncome: (mk, id) =>
        set((s) => {
          const month = s.months[mk] ?? emptyMonth()
          return {
            months: {
              ...s.months,
              [mk]: {
                ...month,
                extraIncome: month.extraIncome.filter((x) => x.id !== id),
              },
            },
          }
        }),

      addBankTransfer: (mk, label, amount) =>
        set((s) => {
          const month = s.months[mk] ?? emptyMonth()
          return {
            months: {
              ...s.months,
              [mk]: {
                ...month,
                bankTransfers: [
                  ...month.bankTransfers,
                  { id: uid('bt'), label, amount },
                ],
              },
            },
          }
        }),

      removeBankTransfer: (mk, id) =>
        set((s) => {
          const month = s.months[mk] ?? emptyMonth()
          return {
            months: {
              ...s.months,
              [mk]: {
                ...month,
                bankTransfers: month.bankTransfers.filter((x) => x.id !== id),
              },
            },
          }
        }),

      setChecking: (amount) =>
        set({ checking: { amount, updatedAt: new Date().toISOString() } }),

      addAccount: (name, type) =>
        set((s) => ({
          accounts: [
            ...s.accounts,
            {
              id: uid('acc'),
              name,
              type,
              balance: 0,
              updatedAt: new Date().toISOString(),
              goals: [],
            },
          ],
        })),

      removeAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          investments: s.investments.filter((i) => i.accountId !== id),
          // ניתוק הוצאות ששויכו למטרות בחשבון שנמחק
          expenses: s.expenses.map((e) => {
            const acc = s.accounts.find((a) => a.id === id)
            if (acc && e.savingsGoalId && acc.goals.some((g) => g.id === e.savingsGoalId)) {
              return { ...e, savingsGoalId: undefined }
            }
            return e
          }),
        })),

      updateAccountBalance: (id, balance) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id
              ? { ...a, balance, updatedAt: new Date().toISOString() }
              : a,
          ),
        })),

      renameAccount: (id, name) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, name } : a)),
        })),

      addGoal: (accountId, name, targetAmount) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === accountId
              ? {
                  ...a,
                  goals: [...a.goals, { id: uid('goal'), name, targetAmount }],
                }
              : a,
          ),
        })),

      removeGoal: (accountId, goalId) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === accountId
              ? { ...a, goals: a.goals.filter((g) => g.id !== goalId) }
              : a,
          ),
          expenses: s.expenses.map((e) =>
            e.savingsGoalId === goalId ? { ...e, savingsGoalId: undefined } : e,
          ),
        })),

      addInvestment: (mk, amount, accountId) =>
        set((s) => ({
          investments: [
            ...s.investments,
            { id: uid('inv'), monthKey: mk, amount, accountId },
          ],
        })),

      removeInvestment: (id) =>
        set((s) => ({
          investments: s.investments.filter((i) => i.id !== id),
        })),
    }),
    {
      name: 'finance-store',
      version: 1,
    },
  ),
)
