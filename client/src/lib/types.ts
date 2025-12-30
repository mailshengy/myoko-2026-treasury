export interface Settings {
  fxRate: number;
  tripStartDate: string;
  tripEndDate: string;
  dailyBudgetJpy: number;
}

export interface Participant {
  name: string;
  amountPaidSgd: number;
  status: 'Paid' | 'Pending';
  email?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: 'SGD' | 'JPY';
  paidBy: string;
  splitMethod: 'Equal' | string; // Could be "Equal" or specific names
}

export interface Balance {
  name: string;
  paidSgd: number;     // Total paid in SGD (initial funding)
  paidJpy: number;     // Total expenses paid in JPY
  shareSgd: number;    // Fair share in SGD
  netBalanceSgd: number; // Positive = receive, Negative = owe
}

export interface Settlement {
  from: string;
  to: string;
  amountSgd: number;
}
