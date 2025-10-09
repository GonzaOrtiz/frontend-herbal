import type { CentroApoyoExpense } from '../hooks/useCentrosApoyo';

export interface CentroApoyoCategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface CentroApoyoExpenseSummary {
  total: number;
  periodTotal: number;
  outOfPeriodTotal: number;
  categories: CentroApoyoCategoryBreakdown[];
}

export function buildCentrosApoyoSummary(expenses: CentroApoyoExpense[]): CentroApoyoExpenseSummary {
  let total = 0;
  let periodTotal = 0;
  let outOfPeriodTotal = 0;
  const categoryTotals = new Map<string, number>();

  for (const expense of expenses) {
    const amount = Number.isFinite(expense.monto) ? expense.monto : 0;
    total += amount;
    if (expense.esGastoDelPeriodo) {
      periodTotal += amount;
    } else {
      outOfPeriodTotal += amount;
    }
    const key = expense.categoria || 'Sin categoría';
    categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + amount);
  }

  const categories: CentroApoyoCategoryBreakdown[] = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total,
    periodTotal,
    outOfPeriodTotal,
    categories,
  };
}
