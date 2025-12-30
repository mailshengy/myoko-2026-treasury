# Google Sheet Setup Guide - Myoko 2026 Treasury

This guide explains how to create and manage your Google Sheet that powers the Myoko 2026 Treasury app.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Create** and select **Blank spreadsheet**
3. Name it: **"Myoko 2026 Treasury"**
4. You now have your master data source!

## Step 2: Create the Required Sheets

Your Google Sheet needs **three sheets**. Delete the default "Sheet1" and create these:

### Sheet 1: Settings

This sheet stores trip configuration and exchange rates.

| Key | Value | Description |
|-----|-------|-------------|
| FX_RATE_SGD_JPY | 112.5 | 1 SGD = ? JPY (update as needed) |
| TRIP_START_DATE | 2026-01-15 | Trip start date (YYYY-MM-DD) |
| TRIP_END_DATE | 2026-01-22 | Trip end date (YYYY-MM-DD) |
| DAILY_BUDGET_JPY | 15000 | Per-person daily budget |

**How to create it:**
1. Create a new sheet named "Settings"
2. In row 1: Headers "Key" and "Value"
3. Add the rows above with your trip details

### Sheet 2: Participants

This sheet lists all group members and their initial contributions.

| Name | Amount Paid (SGD) | Status | Email (Optional) |
|------|-------------------|--------|------------------|
| Aileen | 0 | Pending | |
| Jonathan | 0 | Pending | |
| Nicolette | 0 | Pending | |
| Leonard | 0 | Pending | |
| Dom | 0 | Pending | |
| Gail | 0 | Pending | |
| Julia | 0 | Pending | |
| Justin | 0 | Pending | |
| Chris | 0 | Pending | |
| Cors | 0 | Pending | |
| Sheng | 0 | Pending | |

**How to create it:**
1. Create a new sheet named "Participants"
2. In row 1: Headers "Name", "Amount Paid (SGD)", "Status", "Email (Optional)"
3. Add all 11 names starting from row 2
4. Set initial amounts to 0 (or update if people have already paid)
5. Set Status to "Pending" or "Paid"

### Sheet 3: Expenses

This sheet records all group expenses.

| Date | Description | Amount | Currency | Paid By | Split Method | Notes |
|------|-------------|--------|----------|---------|--------------|-------|
| 2026-01-15 | Shinkansen Tickets | 44000 | JPY | Aileen | Equal | |
| 2026-01-15 | Welcome Dinner | 12000 | JPY | Jonathan | Equal | |

**How to create it:**
1. Create a new sheet named "Expenses"
2. In row 1: Headers "Date", "Description", "Amount", "Currency", "Paid By", "Split Method", "Notes"
3. Add expenses as they occur
4. **Currency**: "JPY" or "SGD"
5. **Split Method**: "Equal" (for now; future versions can support custom splits)
6. **Notes**: Optional field for additional details

---

## Step 3: Deploy the Google Apps Script

This script creates an API endpoint so the app can read and write to your sheet.

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code
4. Copy and paste the code from `google-apps-script.js` in this repository
5. Click **Deploy > New Deployment**
6. Select type: **Web App**
7. Set **Execute as**: Your email address
8. Set **Who has access**: **Anyone**
9. Click **Deploy**
10. Copy the **Web App URL** (it looks like `https://script.google.com/macros/s/XXXXX/exec`)

---

## Step 4: Connect the App to Your Sheet

1. In the Myoko 2026 Treasury app, you need to set the environment variable:
   ```
   VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

2. If deploying to Vercel:
   - Go to your Vercel project settings
   - Add this as an environment variable
   - Redeploy

3. If running locally:
   - Create a `.env.local` file in the project root
   - Add the line above
   - Restart the dev server

---

## Step 5: Verify Connection

1. Open the Myoko 2026 Treasury app
2. Go to the **Home** page
3. You should see your participants and any expenses you've added
4. If you see "mock data", the API URL isn't set correctly

---

## Managing Your Data

### Adding a New Participant

1. Open your Google Sheet
2. Go to the **Participants** sheet
3. Add a new row with the person's name and initial payment
4. Save
5. The app will pick up the change within 5 minutes

### Recording an Expense

**Option A: Via the App (Treasurer Mode)**
1. Tap the **Lock icon** in the app
2. Enter passcode: `2026`
3. Fill in the expense form
4. Tap **Add Expense**

**Option B: Directly in Google Sheet**
1. Open your Google Sheet
2. Go to the **Expenses** sheet
3. Add a new row with date, description, amount, currency, who paid, and split method
4. Save
5. The app will refresh within 5 minutes

### Updating Settings

1. Open your Google Sheet
2. Go to the **Settings** sheet
3. Update values like FX rate, trip dates, or daily budget
4. Save
5. The app will reflect changes on next refresh

---

## Troubleshooting

### "No API URL provided" in the App

**Problem**: The app is showing mock data instead of your real data.

**Solution**:
1. Make sure you deployed the Google Apps Script (see Step 3)
2. Copy the Web App URL
3. Add it to your environment variables
4. Restart the app

### Changes Not Appearing in the App

**Problem**: You edited the Google Sheet but the app still shows old data.

**Solution**:
1. The app caches data for 5 minutes
2. Refresh the page (F5 or pull-to-refresh on mobile)
3. Or wait 5 minutes for automatic refresh

### "Cannot find module" Error in Apps Script

**Problem**: The Apps Script deployment failed.

**Solution**:
1. Go back to Apps Script
2. Make sure all the code was pasted correctly
3. Check for any red error indicators
4. Try deploying again

---

## Tips for Success

*   **Keep it organized**: Add expenses immediately after they happen, while you remember the details
*   **Use consistent names**: Make sure participant names in Expenses match exactly with Participants sheet
*   **Update FX rate daily**: If the exchange rate changes significantly, update it in Settings
*   **Add notes**: Use the Notes column in Expenses for context (e.g., "Shared with 3 people only")
*   **Backup your sheet**: Google Sheets auto-saves, but consider downloading a copy periodically

---

## Next Steps

Once your Google Sheet is set up and connected:
1. Add all initial participant payments in the Participants sheet
2. Start recording expenses as they happen during the trip
3. Check the app's Settlement page to see who owes whom
4. Use the app to manage the group's finances transparently!
