# Myoko 2026 Treasury - User Guide

Welcome to the Myoko 2026 Treasury app! This guide will walk you through all the features and how to use them.

## Overview

The app has two main modes: **Public Mode** (for all participants) and **Treasurer Mode** (for managing expenses).

| Feature | Public Mode | Treasurer Mode |
|---------|-------------|----------------|
| View Dashboard | ✅ | ✅ |
| View Participants & Balances | ✅ | ✅ |
| View Expenses | ✅ | ✅ |
| View Settlement Suggestions | ✅ | ✅ |
| Add New Expenses | ❌ | ✅ |
| Modify Participants | ❌ | ❌ (via Google Sheets) |

---

## Public Mode (No Passcode Required)

### 1. Home Dashboard

When you first open the app, you'll see the **Home Dashboard** with:

*   **Remaining Funds**: The total money left in JPY and SGD.
*   **Total Collected**: How much the group has pooled together.
*   **Total Spent**: How much has been spent so far.
*   **Budget Health**: Shows if the group is "Comfortable", "Tight", or "Over Budget".
*   **Trip Duration**: Days remaining in the trip.
*   **Recent Activity**: The 3 most recent expenses.

### 2. Participants Page

Tap the **People** icon at the bottom to see all participants and their financial status.

For each person, you'll see:

*   **Name**: The participant's name.
*   **Paid**: How much they contributed upfront in SGD.
*   **Used**: Their fair share of expenses in SGD.
*   **Net Balance**: 
    - **Green (positive)**: They should receive money back.
    - **Red (negative)**: They owe money to the group.

### 3. Expenses Page

Tap the **Expenses** icon to see a chronological list of all transactions.

You can **filter by person** using the chips at the top. Each expense shows:

*   **Date**: When the expense occurred.
*   **Description**: What was purchased.
*   **Amount & Currency**: How much in JPY or SGD.
*   **Paid By**: Who paid for it.

### 4. Settlement Page

Tap the **Settle** icon to see the settlement calculator.

This page shows **"If we settle today"** with suggested minimal transfers to balance everyone out. For example:

> Alice sends S$50 to Bob  
> Charlie sends S$100 to Dave

This algorithm minimizes the total number of transactions needed.

---

## Treasurer Mode (Passcode Required)

### Unlocking Treasurer Mode

1. Tap the **Lock icon** at the bottom right of the navigation bar.
2. Enter the passcode: **`2026`** (or the custom passcode set by the group).
3. Tap **Unlock**.

Once unlocked, you'll see the **Add Expense** form.

### Adding an Expense

1. **Enter Amount**: Type the expense amount in the large input field.
2. **Select Currency**: Choose **JPY** or **SGD** using the toggle buttons.
3. **Description**: Enter what was purchased (e.g., "Dinner at Izakaya", "Lift Passes").
4. **Paid By**: Select who paid for the expense from the grid of participant names.
5. **Date**: The date defaults to today but can be changed.
6. **Submit**: Tap **Add Expense** to save.

The expense will be immediately added to Google Sheets and visible to all participants.

### Logging Out

Tap the **Logout** button in the top-right corner of the Treasurer page to exit Treasurer Mode.

---

## Managing Participants and Settings

**Important**: Participants and settings are managed directly in the **Google Sheet**, not through the app.

### Adding a New Participant

1. Open your Google Sheet (the one connected to this app).
2. Go to the **Participants** sheet.
3. Add a new row with:
   - **Name**: The participant's name.
   - **Amount Paid (SGD)**: How much they contributed upfront.
   - **Status**: "Paid" or "Pending".
   - **Email (Optional)**: Their email address.

4. Save the sheet. The app will automatically pick up the new participant on the next refresh.

### Editing Expenses

1. Open your Google Sheet.
2. Go to the **Expenses** sheet.
3. Edit the row directly in the sheet (date, description, amount, etc.).
4. Save. The app will refresh within a few minutes.

### Changing Settings

1. Open your Google Sheet.
2. Go to the **Settings** sheet.
3. Update values like:
   - **FX_RATE_SGD_JPY**: The exchange rate (e.g., 112.5).
   - **TRIP_START_DATE**: When the trip begins (YYYY-MM-DD format).
   - **TRIP_END_DATE**: When the trip ends.
   - **DAILY_BUDGET_JPY**: Per-person daily budget.

4. Save. Changes take effect on the next app refresh.

---

## Troubleshooting

### "No API URL provided" Error

This means the Google Sheets API URL hasn't been set up yet. Follow the setup instructions in the main README.md to deploy the Google Apps Script and add the URL to your environment variables.

### Data Not Updating

The app caches data for 5 minutes to save bandwidth. If you want to see the latest changes immediately, refresh the page (F5 or pull-to-refresh on mobile).

### Passcode Not Working

Make sure you're entering the correct passcode. The default is **`2026`**. If it's been changed, ask the group treasurer for the new passcode.

### Missing Participants or Expenses

Check the Google Sheet to make sure:

1. The data is in the correct sheet (Participants or Expenses).
2. There are no empty rows above the data.
3. The column headers match exactly (case-sensitive).

---

## Tips & Tricks

*   **Mobile Optimization**: The app is designed for mobile phones. For best experience, use on your phone during the trip.
*   **Offline Support**: If you lose internet connection, the app will show the last cached data. Expenses added offline will sync once you're back online.
*   **Quick Expense Entry**: The Treasurer can quickly add expenses by keeping the same currency and payer selected—just change the amount and description.
*   **Settlement Accuracy**: The settlement calculator assumes equal splits. If you need custom splits, edit the Google Sheet directly.

---

## Questions?

For technical support or feature requests, refer to the main README.md or contact the group administrator.
