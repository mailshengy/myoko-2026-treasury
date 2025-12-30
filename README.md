# Myoko 2026 Treasury

A lightweight, friendly group travel treasury management app for the Myoko 2026 ski trip. Built with Next.js and Google Sheets.

## Features

*   **Dashboard**: Real-time view of remaining funds, budget health, and trip duration.
*   **Participants**: Track who paid what and who owes whom.
*   **Expenses**: Searchable list of all transactions.
*   **Settlement**: "If we settle today" calculator showing minimized transfers.
*   **Treasurer Mode**: Passcode-protected interface to add expenses on the go.
*   **Offline Support**: Caches data for viewing even with spotty connection.

## Setup Instructions

### 1. Google Sheets Setup

1.  Create a new Google Sheet.
2.  Go to **Extensions > Apps Script**.
3.  Copy the content of `google-apps-script.js` from this repository into the script editor.
4.  Run the `setupSheets()` function once to create the required sheets (Settings, Participants, Expenses).
5.  Click **Deploy > New Deployment**.
6.  Select type: **Web App**.
7.  Set **Execute as**: "Me".
8.  Set **Who has access**: "Anyone".
9.  Click **Deploy** and copy the **Web App URL**.

### 2. Environment Variables

Create a `.env.local` file (or set these in Vercel):

```bash
VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_TREASURER_PASSCODE=2026
```

### 3. Run Locally

```bash
pnpm install
pnpm dev
```

### 4. Deploy to Vercel

1.  Push this code to GitHub.
2.  Import the project into Vercel.
3.  Add the Environment Variables from step 2.
4.  Deploy!

## Design Philosophy

**Japandi Minimalism**: Combines Japanese rustic minimalism with Scandinavian functionality.
*   **Colors**: Warm Paper (#F5F5F0), Ink Blue (#2C3E50), Soft Sage (#8FA89B), Terracotta (#C7826B).
*   **Typography**: Playfair Display (Headings) + Satoshi (Body) + JetBrains Mono (Data).

## Tech Stack

*   **Frontend**: React 19, Vite, Tailwind CSS 4
*   **Backend**: Google Apps Script (Serverless)
*   **Database**: Google Sheets
*   **Hosting**: Vercel (Static Export)
