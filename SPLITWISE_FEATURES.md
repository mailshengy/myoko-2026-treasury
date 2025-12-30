# Myoko 2026 Treasury - Splitwise-Like Features

This document outlines the enhanced features that make Myoko 2026 Treasury comparable to Splitwise.

## Features Implemented

### 1. Expense Categorization

Each expense can now be categorized to help track spending patterns:

*   **Food**: Meals, groceries, restaurants
*   **Transport**: Taxis, trains, gas, parking
*   **Accommodation**: Hotels, lodging
*   **Activities**: Tours, attractions, entertainment

Categories appear as badges on the Expenses page and help organize spending by type.

### 2. Expense Notes

Add optional notes to expenses for additional context:

*   "Shared with 3 people only"
*   "Includes breakfast for 2"
*   "Lift pass for 2 days"

Notes are stored in the Google Sheet and can be viewed in the detailed settlement breakdown.

### 3. Settlement Details View

A new **Detailed Breakdown** page shows:

*   **Transaction List**: Who pays whom and how much
*   **Expandable Details**: Click each transaction to see:
     - How much each person paid upfront
     - Their fair share of expenses
     - Their net balance (positive = receive, negative = owe)
*   **Summary Stats**: Total transactions and total amount moved

### 4. Real-Time Balance Tracking

The **Participants** page shows each person's:

*   **Total Paid**: Initial contribution in SGD
*   **Fair Share**: Their portion of group expenses
*   **Net Balance**: Visual indicator (green = owed money, red = owes money)
*   **Progress Bar**: Visual representation of payment vs. consumption

### 5. Multi-Currency Support

*   Track expenses in both **JPY** and **SGD**
*   Automatic conversion using a configurable FX rate
*   All balances calculated in SGD for fair comparison

### 6. Budget Health Indicator

The dashboard shows:

*   **Comfortable**: Spending is below expected pace
*   **Tight**: Spending is close to expected pace
*   **Over Budget**: Spending exceeds expected pace

This helps the group make spending decisions during the trip.

### 7. Expense Filtering

On the Expenses page, filter by:

*   **Person**: See all expenses paid by a specific person
*   **All**: View complete expense history

Future enhancements could add category filtering.

### 8. Debt Simplification Algorithm

The settlement calculator uses a greedy algorithm to minimize transfers:

*   Instead of everyone paying everyone, it consolidates debts
*   Example: Instead of 3 transfers, it might reduce to 2
*   Ensures fairness while reducing transaction complexity

---

## How to Use These Features

### Adding an Expense with Full Details

1. Tap the **Lock icon** to enter Treasurer Mode
2. Enter the **amount**
3. Select **currency** (JPY or SGD)
4. Enter **description** (e.g., "Dinner at Izakaya")
5. Select **who paid**
6. Choose **category** (Food, Transport, etc.)
7. Set the **date**
8. Add optional **notes** for context
9. Tap **Add Expense**

### Viewing Settlement Details

1. Go to the **Settle** page
2. See the quick settlement summary
3. Tap **View Detailed Breakdown** to see:
   - Each transaction with full details
   - Click to expand and see individual balance breakdowns
   - Understand why each person owes/receives money

### Managing Participants

1. Open your Google Sheet
2. Go to the **Participants** sheet
3. Add new people by adding rows
4. Update their initial payments as they contribute
5. Changes sync to the app automatically

---

## Splitwise Comparison

| Feature | Myoko 2026 | Splitwise |
|---------|-----------|-----------|
| Expense Tracking | ✅ | ✅ |
| Multi-Currency | ✅ | ✅ |
| Categories | ✅ | ✅ |
| Notes | ✅ | ✅ |
| Settlement Calculation | ✅ | ✅ |
| Debt Simplification | ✅ | ✅ |
| Budget Tracking | ✅ | ✅ |
| Mobile Optimized | ✅ | ✅ |
| Offline Support | ✅ | Limited |
| No Login Required | ✅ | ❌ |
| Free Forever | ✅ | Freemium |

---

## Future Enhancement Ideas

1. **Custom Splits**: Allow expenses to be split unevenly (e.g., 60/40 instead of equal)
2. **Receipt Photos**: Attach photos of receipts to expenses
3. **Payment History**: Track actual payments made between members
4. **Trip Reports**: Generate PDF summaries of the trip expenses
5. **Recurring Expenses**: Set up daily/weekly recurring costs (e.g., accommodation)
6. **Expense Limits**: Set spending limits per category and get alerts
7. **Export Data**: Download all data as CSV or Excel
8. **Shared Groups**: Create multiple groups for different trips

---

## Technical Implementation

### Data Structure

Expenses now include:

```json
{
  "id": "exp-1",
  "date": "2026-01-15",
  "description": "Dinner at Izakaya",
  "amount": 12000,
  "currency": "JPY",
  "paidBy": "Aileen",
  "splitMethod": "Equal",
  "category": "Food",
  "notes": "Shared with 3 people"
}
```

### Google Sheet Columns

The **Expenses** sheet now has these columns:

| Column | Type | Example |
|--------|------|---------|
| Date | Date | 2026-01-15 |
| Description | Text | Dinner at Izakaya |
| Amount | Number | 12000 |
| Currency | Text | JPY |
| Paid By | Text | Aileen |
| Split Method | Text | Equal |
| Notes | Text | Shared with 3 people |

---

## Tips for Best Results

*   **Add expenses immediately**: Don't wait until the end of the day
*   **Use consistent names**: Make sure names match exactly in Participants sheet
*   **Update FX rate daily**: Exchange rates fluctuate
*   **Add notes for context**: Helps explain unequal spending
*   **Review settlement weekly**: Catch any issues early
*   **Keep Google Sheet as backup**: Download a copy periodically

---

## Support

For questions or feature requests, refer to the main README.md or contact the group administrator.
