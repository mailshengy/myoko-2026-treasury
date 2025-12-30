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
  splitMethod: 'Equal' | 'Custom'; // 'Equal' = all participants, 'Custom' = specific people
  splitWith?: string[]; // For custom splits: array of participant names who share this expense
  category?: string; // e.g., 'Food', 'Transport', 'Accommodation', 'Activities'
  notes?: string; // Additional details
}

export interface Payment {
  id: string;
  date: string;
  from: string; // Who paid
  to: string; // Who received
  amount: number;
  currency: 'SGD' | 'JPY';
  notes?: string;
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

export interface AppData {
  settings: Settings;
  participants: Participant[];
  expenses: Expense[];
  payments: Payment[];
  lastUpdated: string;
}
