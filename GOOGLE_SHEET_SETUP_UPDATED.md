# Google Sheet Setup Guide - Myoko 2026 Treasury (Updated)

## Overview

Your Myoko 2026 Treasury app reads and writes data from a Google Sheet via a custom Google Apps Script. This guide explains how to set up your sheet and update the script to support the new features (custom splits, categories, payment tracking).

---

## Step 1: Create Your Google Sheet Structure

You need **5 sheets** in your Google Sheet:

### Sheet 1: Settings

This sheet contains trip-wide configuration.

| Column | Value | Example |
|--------|-------|---------|
| FX_RATE_SGD_JPY | Exchange rate | 100 |
| TRIP_START_DATE | Trip start date | 2026-01-15 |
| TRIP_END_DATE | Trip end date | 2026-02-16 |
| DAILY_BUDGET_JPY | Daily budget | 50000 |

**Setup:**
1. Create a new sheet named `Settings`
2. Add the headers and values as shown above
3. Leave the first row as headers, put values in row 2

---

### Sheet 2: Participants

This sheet lists all trip participants and their initial funding.

| Name | Amount_Paid_SGD | Status |
|------|-----------------|--------|
| Aileen | 500 | Paid |
| Jonathan | 500 | Paid |
| Nicolette | 500 | Paid |
| Leonard | 500 | Paid |
| Dom | 500 | Paid |
| Gail | 500 | Paid |
| Julia | 500 | Paid |
| Justin | 500 | Paid |
| Chris | 500 | Paid |
| Cors | 500 | Paid |
| Sheng | 500 | Paid |

**Setup:**
1. Create a new sheet named `Participants`
2. Add all 11 names with their initial funding amounts
3. Status should be either "Paid" or "Pending"

---

### Sheet 3: Expenses

This sheet records all trip expenses. **This is the most important sheet.**

| ID | Date | Description | Amount | Currency | Paid_By | Split_Method | Split_With | Category | Notes |
|----|------|-------------|--------|----------|---------|--------------|-----------|----------|-------|
| 1 | 2026-01-15 | Dinner | 15000 | JPY | Aileen | Equal | | Food | |
| 2 | 2026-01-15 | Lunch | 8000 | JPY | Jonathan | Custom | Nicolette,Sheng,Aileen | Food | Shared with 3 people |

**Column Explanations:**

- **ID**: Unique identifier (auto-increment: 1, 2, 3, etc.)
- **Date**: Expense date (YYYY-MM-DD format)
- **Description**: What was purchased
- **Amount**: Numeric amount (no currency symbols)
- **Currency**: Either "JPY" or "SGD"
- **Paid_By**: Name of person who paid (must match Participants sheet)
- **Split_Method**: Either "Equal" (everyone shares) or "Custom" (specific people)
- **Split_With**: For custom splits, comma-separated names (e.g., "Nicolette,Sheng,Aileen"). Leave blank for Equal splits.
- **Category**: One of: Food, Transport, Accommodation, Activities
- **Notes**: Optional notes about the expense

**Setup:**
1. Create a new sheet named `Expenses`
2. Add the headers in row 1
3. Start entering expenses from row 2

---

### Sheet 4: Payments

This sheet tracks actual payments made between members to settle debts.

| ID | Date | From | To | Amount | Currency | Notes |
|----|------|------|-----|--------|----------|-------|
| 1 | 2026-02-10 | Jonathan | Aileen | 250 | SGD | Settlement payment |

**Column Explanations:**

- **ID**: Unique identifier
- **Date**: Payment date (YYYY-MM-DD)
- **From**: Who paid (payer)
- **To**: Who received (payee)
- **Amount**: Amount paid
- **Currency**: "SGD" or "JPY"
- **Notes**: Optional notes

**Setup:**
1. Create a new sheet named `Payments`
2. Add the headers in row 1
3. Add payment records as they occur

---

### Sheet 5: Categories (Reference)

This is a reference sheet listing valid expense categories.

| Category |
|----------|
| Food |
| Transport |
| Accommodation |
| Activities |

**Setup:**
1. Create a new sheet named `Categories`
2. This is just for reference—the app will use these values

---

## Step 2: Update Your Google Apps Script

Your Google Apps Script needs to be updated to handle the new fields. Follow these steps:

### Access Your Apps Script

1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**
3. Replace all code in `Code.gs` with the updated script below

### Updated Google Apps Script Code

```javascript
function doGet(e) {
  const action = e.parameter.action || 'getData';
  
  if (action === 'getData') {
    return ContentService.createTextOutput(JSON.stringify(getData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  const payload = JSON.parse(e.postData.contents);
  
  if (action === 'addExpense') {
    return ContentService.createTextOutput(JSON.stringify(addExpense(payload)))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'addPayment') {
    return ContentService.createTextOutput(JSON.stringify(addPayment(payload)))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get Settings
  const settingsSheet = ss.getSheetByName('Settings');
  const settingsData = settingsSheet.getDataRange().getValues();
  const settings = {
    FX_RATE_SGD_JPY: settingsData[1][1],
    TRIP_START_DATE: formatDate(settingsData[1][1]),
    TRIP_END_DATE: formatDate(settingsData[2][1]),
    DAILY_BUDGET_JPY: settingsData[3][1]
  };
  
  // Get Participants
  const participantsSheet = ss.getSheetByName('Participants');
  const participantsData = participantsSheet.getDataRange().getValues();
  const participants = [];
  for (let i = 1; i < participantsData.length; i++) {
    participants.push({
      Name: participantsData[i][0],
      Amount_Paid_SGD: participantsData[i][1],
      Status: participantsData[i][2]
    });
  }
  
  // Get Expenses
  const expensesSheet = ss.getSheetByName('Expenses');
  const expensesData = expensesSheet.getDataRange().getValues();
  const expenses = [];
  for (let i = 1; i < expensesData.length; i++) {
    if (expensesData[i][0]) { // Skip empty rows
      const splitWith = expensesData[i][7] ? expensesData[i][7].split(',').map(s => s.trim()) : [];
      expenses.push({
        ID: expensesData[i][0],
        Date: formatDate(expensesData[i][1]),
        Description: expensesData[i][2],
        Amount: expensesData[i][3],
        Currency: expensesData[i][4],
        Paid_By: expensesData[i][5],
        Split_Method: expensesData[i][6],
        Split_With: splitWith,
        Category: expensesData[i][8],
        Notes: expensesData[i][9]
      });
    }
  }
  
  // Get Payments
  const paymentsSheet = ss.getSheetByName('Payments');
  const paymentsData = paymentsSheet.getDataRange().getValues();
  const payments = [];
  for (let i = 1; i < paymentsData.length; i++) {
    if (paymentsData[i][0]) { // Skip empty rows
      payments.push({
        ID: paymentsData[i][0],
        Date: formatDate(paymentsData[i][1]),
        From: paymentsData[i][2],
        To: paymentsData[i][3],
        Amount: paymentsData[i][4],
        Currency: paymentsData[i][5],
        Notes: paymentsData[i][6]
      });
    }
  }
  
  return {
    settings: settings,
    participants: participants,
    expenses: expenses,
    payments: payments,
    lastUpdated: new Date().toISOString()
  };
}

function addExpense(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const expensesSheet = ss.getSheetByName('Expenses');
    
    // Get next ID
    const allData = expensesSheet.getDataRange().getValues();
    const nextId = allData.length;
    
    // Format split_with as comma-separated string
    const splitWith = data.splitWith ? data.splitWith.join(',') : '';
    
    // Add new row
    expensesSheet.appendRow([
      nextId,
      data.date,
      data.description,
      data.amount,
      data.currency,
      data.paidBy,
      data.splitMethod,
      splitWith,
      data.category || 'Food',
      data.notes || ''
    ]);
    
    return { success: true, message: 'Expense added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function addPayment(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const paymentsSheet = ss.getSheetByName('Payments');
    
    // Get next ID
    const allData = paymentsSheet.getDataRange().getValues();
    const nextId = allData.length;
    
    // Add new row
    paymentsSheet.appendRow([
      nextId,
      data.date,
      data.from,
      data.to,
      data.amount,
      data.currency,
      data.notes || ''
    ]);
    
    return { success: true, message: 'Payment recorded successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}
```

### Deploy the Updated Script

1. Click **Deploy** → **New Deployment**
2. Select **Type**: "Web app"
3. Select **Execute as**: Your Google account
4. Select **Who has access**: "Anyone"
5. Click **Deploy**
6. Copy the new deployment URL (it will look like: `https://script.google.com/macros/s/...`)

---

## Step 3: Update Your App Configuration

If your Google Apps Script URL changed, update it in your Myoko 2026 Treasury app:

1. Go to the Management UI → **Settings** → **Secrets**
2. Update `VITE_GOOGLE_SHEETS_API_URL` with your new script URL

---

## Step 4: Test the Connection

1. Go back to your Myoko 2026 Treasury app
2. Refresh the page
3. Try adding an expense in Treasurer mode
4. Check your Google Sheet to verify the expense was added

---

## Troubleshooting

### "Error occurred when trying to add expense"

**Possible causes:**
1. Google Apps Script URL is incorrect or outdated
2. Sheet names don't match exactly (case-sensitive): Settings, Participants, Expenses, Payments, Categories
3. Column headers don't match the script expectations
4. Script hasn't been redeployed after updates

**Solution:**
- Verify all sheet names are exactly as listed above
- Check that column headers match the script
- Redeploy the Apps Script and update the URL in your app

### Expenses not appearing in Google Sheet

**Possible causes:**
1. The Apps Script is using an old version
2. The Expenses sheet doesn't have the correct column headers
3. The script doesn't have permission to edit the sheet

**Solution:**
- Make sure you're the owner of the Google Sheet
- Verify the script was deployed with "Anyone" access
- Check that the Expenses sheet has all 10 columns

### "Split_With shows as blank for Equal splits"

This is normal! For Equal splits, the `Split_With` column is intentionally left blank because everyone participates. For Custom splits, it will show the comma-separated names.

---

## Data Format Reference

### Date Format
All dates should be in **YYYY-MM-DD** format (e.g., 2026-01-15)

### Currency
Use exactly "JPY" or "SGD" (case-sensitive)

### Split Method
- **Equal**: Everyone shares the expense equally
- **Custom**: Only specific people in Split_With share the expense

### Categories
Valid categories are: Food, Transport, Accommodation, Activities

---

## Next Steps

Once your Google Sheet is set up:

1. **Add Expenses**: Use the Treasurer mode to add expenses (they'll appear in the Expenses sheet)
2. **Track Payments**: Record actual payments in the Payments sheet
3. **View Reports**: Use the Trip Summary page to generate reports
4. **Settlement**: The app automatically calculates who owes whom

---

## Questions?

If you encounter issues:
1. Check that all sheet names match exactly
2. Verify column headers are correct
3. Make sure the Apps Script was redeployed
4. Confirm the new script URL is in your app configuration
