import { Balance, Settlement } from './types';
import type { AppData } from './api';
import { calculateBalances, calculateSettlements } from './settlement';

/**
 * Generates a trip summary report as a string that can be printed or exported
 */
export function generateTripSummary(data: AppData, balances: Balance[], settlements: Settlement[]): string {
  const tripStart = new Date(data.settings.tripStartDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const tripEnd = new Date(data.settings.tripEndDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let report = '';
  report += '═══════════════════════════════════════════════════════════════\n';
  report += '                    MYOKO 2026 TRIP SUMMARY\n';
  report += '═══════════════════════════════════════════════════════════════\n\n';

  // Trip Details
  report += 'TRIP DETAILS\n';
  report += '───────────────────────────────────────────────────────────────\n';
  report += `Dates: ${tripStart} to ${tripEnd}\n`;
  report += `Participants: ${data.participants.length}\n`;
  report += `Exchange Rate: 1 SGD = ¥${data.settings.fxRate}\n\n`;

  // Financial Summary
  report += 'FINANCIAL SUMMARY\n';
  report += '───────────────────────────────────────────────────────────────\n';
  
  const totalExpensesSgd = data.expenses.reduce((sum, e) => {
    const amountSgd = e.currency === 'SGD' ? e.amount : e.amount / data.settings.fxRate;
    return sum + amountSgd;
  }, 0);

  const totalCollected = data.participants.reduce((sum, p) => sum + p.amountPaidSgd, 0);
  
  report += `Total Collected: S$${totalCollected.toFixed(2)}\n`;
  report += `Total Spent: S$${totalExpensesSgd.toFixed(2)}\n`;
  report += `Remaining: S$${(totalCollected - totalExpensesSgd).toFixed(2)}\n\n`;

  // Participant Balances
  report += 'PARTICIPANT BALANCES\n';
  report += '───────────────────────────────────────────────────────────────\n';
  report += 'Name                    Paid        Share       Balance\n';
  report += '───────────────────────────────────────────────────────────────\n';
  
  balances.forEach(b => {
    const name = b.name.padEnd(20);
    const paid = `S$${b.paidSgd.toFixed(2)}`.padEnd(12);
    const share = `S$${b.shareSgd.toFixed(2)}`.padEnd(12);
    const balance = b.netBalanceSgd >= 0 ? `+S$${b.netBalanceSgd.toFixed(2)}` : `-S$${Math.abs(b.netBalanceSgd).toFixed(2)}`;
    report += `${name} ${paid} ${share} ${balance}\n`;
  });
  report += '\n';

  // Settlement Instructions
  report += 'SETTLEMENT INSTRUCTIONS\n';
  report += '───────────────────────────────────────────────────────────────\n';
  
  if (settlements.length > 0) {
    settlements.forEach((s, index) => {
      report += `${index + 1}. ${s.from} sends S$${s.amountSgd.toFixed(2)} to ${s.to}\n`;
    });
  } else {
    report += 'Everyone is settled! No transfers needed.\n';
  }
  report += '\n';

  // Expense Breakdown
  report += 'EXPENSE BREAKDOWN\n';
  report += '───────────────────────────────────────────────────────────────\n';
  report += 'Date        Description              Amount      Paid By\n';
  report += '───────────────────────────────────────────────────────────────\n';
  
  const sortedExpenses = [...data.expenses].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedExpenses.forEach(e => {
    const date = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const desc = e.description.substring(0, 20).padEnd(20);
    const amount = `${e.currency === 'SGD' ? 'S$' : '¥'}${e.amount}`.padEnd(12);
    const paidBy = e.paidBy;
    report += `${date}      ${desc} ${amount} ${paidBy}\n`;
  });
  report += '\n';

  // Footer
  report += '═══════════════════════════════════════════════════════════════\n';
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += 'Myoko 2026 Treasury App\n';
  report += '═══════════════════════════════════════════════════════════════\n';

  return report;
}

/**
 * Exports the trip summary as a downloadable text file
 */
export function downloadTripSummary(data: AppData, balances: Balance[], settlements: Settlement[]): void {
  const summary = generateTripSummary(data, balances, settlements);
  
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(summary));
  element.setAttribute('download', `Myoko-2026-Trip-Summary-${new Date().toISOString().split('T')[0]}.txt`);
  element.style.display = 'none';
  
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Exports the trip summary as HTML for printing
 */
export function generateTripSummaryHTML(data: AppData, balances: Balance[], settlements: Settlement[]): string {
  const tripStart = new Date(data.settings.tripStartDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const tripEnd = new Date(data.settings.tripEndDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const totalExpensesSgd = data.expenses.reduce((sum, e) => {
    const amountSgd = e.currency === 'SGD' ? e.amount : e.amount / data.settings.fxRate;
    return sum + amountSgd;
  }, 0);

  const totalCollected = data.participants.reduce((sum, p) => sum + p.amountPaidSgd, 0);

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Myoko 2026 Trip Summary</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2C3E50;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #F5F5F0;
    }
    h1 {
      text-align: center;
      border-bottom: 3px solid #2C3E50;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      background: #2C3E50;
      color: white;
      padding: 10px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .summary-box {
      background: white;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 8px;
      border-left: 4px solid #8FA89B;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      margin-bottom: 20px;
    }
    th {
      background: #2C3E50;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #E0E0E0;
    }
    tr:hover {
      background: #F5F5F0;
    }
    .positive {
      color: #8FA89B;
      font-weight: bold;
    }
    .negative {
      color: #C7826B;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #2C3E50;
      font-size: 12px;
      color: #2C3E50;
    }
    @media print {
      body { background: white; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>🏔️ Myoko 2026 Trip Summary</h1>
  
  <div class="summary-box">
    <strong>Trip Dates:</strong> ${tripStart} to ${tripEnd}<br>
    <strong>Participants:</strong> ${data.participants.length}<br>
    <strong>Exchange Rate:</strong> 1 SGD = ¥${data.settings.fxRate}
  </div>

  <h2>Financial Summary</h2>
  <table>
    <tr>
      <td><strong>Total Collected</strong></td>
      <td><strong>S$${totalCollected.toFixed(2)}</strong></td>
    </tr>
    <tr>
      <td><strong>Total Spent</strong></td>
      <td><strong>S$${totalExpensesSgd.toFixed(2)}</strong></td>
    </tr>
    <tr>
      <td><strong>Remaining</strong></td>
      <td><strong>S$${(totalCollected - totalExpensesSgd).toFixed(2)}</strong></td>
    </tr>
  </table>

  <h2>Participant Balances</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Paid</th>
        <th>Fair Share</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody>
      ${balances.map(b => `
        <tr>
          <td>${b.name}</td>
          <td>S$${b.paidSgd.toFixed(2)}</td>
          <td>S$${b.shareSgd.toFixed(2)}</td>
          <td class="${b.netBalanceSgd >= 0 ? 'positive' : 'negative'}">
            ${b.netBalanceSgd >= 0 ? '+' : ''}S$${b.netBalanceSgd.toFixed(2)}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Settlement Instructions</h2>
  ${settlements.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${settlements.map(s => `
          <tr>
            <td>${s.from}</td>
            <td>${s.to}</td>
            <td><strong>S$${s.amountSgd.toFixed(2)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : `
    <div class="summary-box">
      ✅ Everyone is settled! No transfers needed.
    </div>
  `}

  <h2>Expense Details</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Amount</th>
        <th>Paid By</th>
        <th>Category</th>
      </tr>
    </thead>
    <tbody>
      ${[...data.expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(e => `
        <tr>
          <td>${new Date(e.date).toLocaleDateString()}</td>
          <td>${e.description}</td>
          <td>${e.currency === 'SGD' ? 'S$' : '¥'}${e.amount.toLocaleString()}</td>
          <td>${e.paidBy}</td>
          <td>${e.category || '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    Generated on ${new Date().toLocaleString()}<br>
    Myoko 2026 Treasury App
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Opens the trip summary in a new window for printing
 */
export function printTripSummary(data: AppData, balances: Balance[], settlements: Settlement[]): void {
  const html = generateTripSummaryHTML(data, balances, settlements);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
}
