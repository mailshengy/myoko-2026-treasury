/**
 * Myoko 2026 Treasury - Google Apps Script API
 * 
 * This script exposes a JSON API for the Google Sheet to allow:
 * 1. Reading all data (Participants, Expenses, Settings)
 * 2. Adding new expenses (Treasurer only)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Deploy as Web App (Execute as: Me, Who has access: Anyone)
 * 5. Copy the Deployment URL
 */

// --- CONFIGURATION ---
const SHEETS = {
  SETTINGS: 'Settings',
  PARTICIPANTS: 'Participants',
  EXPENSES: 'Expenses'
};

// --- API ENTRY POINT ---

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  // Wait for up to 30 seconds for other processes to finish
  lock.tryLock(30000);
  
  try {
    const action = e.parameter.action || 'getData';
    
    if (action === 'getData') {
      return jsonResponse(getAllData());
    } 
    else if (action === 'addExpense') {
      // Parse the POST body
      const data = JSON.parse(e.postData.contents);
      return jsonResponse(addExpense(data));
    }
    else {
      return errorResponse('Unknown action');
    }
  } catch (error) {
    return errorResponse(error.toString());
  } finally {
    lock.releaseLock();
  }
}

// --- CORE FUNCTIONS ---

function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  return {
    settings: getSettings(ss),
    participants: getParticipants(ss),
    expenses: getExpenses(ss),
    lastUpdated: new Date().toISOString()
  };
}

function getSettings(ss) {
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet) return {};
  
  const data = sheet.getDataRange().getValues();
  const settings = {};
  
  // Assume Key-Value pairs in columns A and B
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    if (key) settings[key] = value;
  }
  
  return settings;
}

function getParticipants(ss) {
  const sheet = ss.getSheetByName(SHEETS.PARTICIPANTS);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase());
  const participants = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Skip empty rows
    if (!row[0]) continue;
    
    const participant = {};
    headers.forEach((header, index) => {
      participant[header] = row[index];
    });
    participants.push(participant);
  }
  
  return participants;
}

function getExpenses(ss) {
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase());
  const expenses = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Skip empty rows
    if (!row[0]) continue;
    
    const expense = {};
    headers.forEach((header, index) => {
      expense[header] = row[index];
    });
    expenses.push(expense);
  }
  
  // Sort by date descending (newest first)
  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function addExpense(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  
  if (!sheet) throw new Error('Expenses sheet not found');
  
  // Validate required fields
  if (!data.date || !data.description || !data.amount || !data.currency || !data.paidBy) {
    throw new Error('Missing required fields');
  }
  
  // Append row
  // Columns: Date, Description, Amount, Currency, Paid By, Split Method
  sheet.appendRow([
    data.date,
    data.description,
    data.amount,
    data.currency,
    data.paidBy,
    data.splitMethod || 'Equal'
  ]);
  
  return { success: true, message: 'Expense added successfully' };
}

// --- UTILITIES ---

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  return jsonResponse({ error: true, message: message });
}

// --- SETUP HELPER ---
// Run this function once to create the sheets if they don't exist
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Settings Sheet
  let settingsSheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SHEETS.SETTINGS);
    settingsSheet.appendRow(['Key', 'Value', 'Description']);
    settingsSheet.appendRow(['FX_RATE_SGD_JPY', 110, '1 SGD = ? JPY']);
    settingsSheet.appendRow(['TRIP_START_DATE', '2026-01-15', 'YYYY-MM-DD']);
    settingsSheet.appendRow(['TRIP_END_DATE', '2026-01-22', 'YYYY-MM-DD']);
    settingsSheet.appendRow(['DAILY_BUDGET_JPY', 15000, 'Per person per day']);
  }
  
  // 2. Participants Sheet
  let participantsSheet = ss.getSheetByName(SHEETS.PARTICIPANTS);
  if (!participantsSheet) {
    participantsSheet = ss.insertSheet(SHEETS.PARTICIPANTS);
    participantsSheet.appendRow(['Name', 'Amount Paid (SGD)', 'Status', 'Email (Optional)']);
    participantsSheet.appendRow(['Alice', 2000, 'Paid', '']);
    participantsSheet.appendRow(['Bob', 2000, 'Paid', '']);
    participantsSheet.appendRow(['Charlie', 0, 'Pending', '']);
  }
  
  // 3. Expenses Sheet
  let expensesSheet = ss.getSheetByName(SHEETS.EXPENSES);
  if (!expensesSheet) {
    expensesSheet = ss.insertSheet(SHEETS.EXPENSES);
    expensesSheet.appendRow(['Date', 'Description', 'Amount', 'Currency', 'Paid By', 'Split Method']);
    expensesSheet.appendRow(['2026-01-15', 'Dinner at Izakaya', 15000, 'JPY', 'Alice', 'Equal']);
    expensesSheet.appendRow(['2026-01-16', 'Lift Passes', 30000, 'JPY', 'Bob', 'Equal']);
  }
}
