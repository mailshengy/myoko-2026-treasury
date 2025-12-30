import { Balance, Expense, Participant, Settlement, Settings } from './types';

/**
 * Calculates the financial standing of each participant.
 * 
 * Logic:
 * 1. Convert all expenses to SGD using the FX rate.
 * 2. Calculate total group spending.
 * 3. Determine each person's fair share (Total / N).
 * 4. Calculate Net Balance = (Initial Funding + Expenses Paid converted to SGD) - Fair Share.
 */
export function calculateBalances(
  participants: Participant[],
  expenses: Expense[],
  settings: Settings
): Balance[] {
  const balances: Balance[] = participants.map(p => ({
    name: p.name,
    paidSgd: p.amountPaidSgd,
    paidJpy: 0,
    shareSgd: 0,
    netBalanceSgd: 0
  }));

  // 1. Sum up expenses paid by each person
  expenses.forEach(expense => {
    const payer = balances.find(b => b.name === expense.paidBy);
    if (payer) {
      if (expense.currency === 'SGD') {
        payer.paidSgd += expense.amount;
      } else {
        payer.paidJpy += expense.amount;
      }
    }
  });

  // 2. Calculate total pool in SGD
  // Total Pool = Sum of all initial funding + Sum of all expenses paid out of pocket (converted)
  // Wait, the logic is simpler:
  // Net Balance = (What I put in) - (What I consumed)
  // What I put in = Initial Funding + Out of pocket expenses
  // What I consumed = Total Group Spend / N (assuming equal split)

  let totalGroupSpendSgd = 0;

  expenses.forEach(expense => {
    let amountSgd = expense.amount;
    if (expense.currency === 'JPY') {
      amountSgd = expense.amount / settings.fxRate;
    }
    totalGroupSpendSgd += amountSgd;
  });

  const sharePerPerson = totalGroupSpendSgd / participants.length;

  // 3. Calculate final balances
  balances.forEach(b => {
    // Convert JPY spending to SGD credit
    const outOfPocketSgd = b.paidJpy / settings.fxRate;
    
    // Total Contribution = Initial Funding + Out of Pocket Expenses
    const totalContribution = b.paidSgd + outOfPocketSgd;
    
    b.shareSgd = sharePerPerson;
    b.netBalanceSgd = totalContribution - sharePerPerson;
  });

  return balances;
}

/**
 * Generates a list of minimized transfers to settle debts.
 * Uses a greedy algorithm: match biggest debtor with biggest creditor.
 */
export function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = [];
  
  // Separate into debtors (negative balance) and creditors (positive balance)
  // Clone to avoid mutating original array
  let debtors = balances
    .filter(b => b.netBalanceSgd < -0.01) // Use epsilon for float comparison
    .map(b => ({ name: b.name, amount: Math.abs(b.netBalanceSgd) }))
    .sort((a, b) => b.amount - a.amount); // Descending

  let creditors = balances
    .filter(b => b.netBalanceSgd > 0.01)
    .map(b => ({ name: b.name, amount: b.netBalanceSgd }))
    .sort((a, b) => b.amount - a.amount); // Descending

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);
    
    if (amount > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amountSgd: amount
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}
