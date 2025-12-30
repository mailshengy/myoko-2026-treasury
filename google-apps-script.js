// Sheet names
const SHEETS = {
  SETTINGS: 'Settings',
  PARTICIPANTS: 'Participants',
  EXPENSES: 'Expenses',
  PAYMENTS: 'Payments',
  CATEGORIES: 'Categories'
};

// Main doPost handler
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'getData') {
      return ContentService.createTextOutput(JSON.stringify(getData()));
    } else if (action === 'addExpense') {
      const result = addExpense(data);
      return ContentService.createTextOutput(JSON.stringify(result));
    } else if (action === 'addPayment') {
      const result = addPayment(data);
      return ContentService.createTextOutput(JSON.stringify(result));
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }));
  }
}

// doGet for direct access
function doGet(e) {
  try {
    return ContentService.createTextOutput(JSON.stringify(getData()));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }));
  }
}

// Get all data
function getData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const settingsSheet = ss.getSheetByName(SHEETS.SETTINGS);
  const participantsSheet = ss.getSheetByName(SHEETS.PARTICIPANTS);
  const expensesSheet = ss.getSheetByName(SHEETS.EXPENSES);
  const paymentsSheet = ss.getSheetByName(SHEETS.PAYMENTS);
  
  return {
    settings: getSheetData(settingsSheet, true),
    participants: getSheetData(participantsSheet),
    expenses: getSheetData(expensesSheet),
    payments: getSheetData(paymentsSheet),
    lastUpdated: new Date().toISOString()
  };
}

// Get sheet data as array of objects
function getSheetData(sheet, isSettings = false) {
  if (!sheet) return isSettings ? {} : [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return isSettings ? {} : [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  if (isSettings) {
    // Convert settings to key-value object
    const result = {};
    rows.forEach(row => {
      if (row[0]) result[row[0]] = row[1];
    });
    return result;
  }
  
  // Convert rows to array of objects
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

// Add expense
function addExpense(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  
  if (!sheet) throw new Error('Expenses sheet not found');
  
  // Validate required fields
  if (!data.date || !data.description || !data.amount || !data.currency || !data.paidBy) {
    throw new Error('Missing required fields');
  }
  
  // Get the next ID
  const allData = sheet.getDataRange().getValues();
  const nextId = allData.length;
  
  // Format split_with as comma-separated string if it's an array
  const splitWith = Array.isArray(data.splitWith) ? data.splitWith.join(',') : (data.splitWith || '');
  
  // Append row with all columns
  // Columns: ID, Date, Description, Amount, Currency, Paid_By, Split_Method, Split_With, Category, Notes
  sheet.appendRow([
    nextId,
    data.date,
    data.description,
    data.amount,
    data.currency,
    data.paidBy,
    data.splitMethod || 'Equal',
    splitWith,
    data.category || 'Food',
    data.notes || ''
  ]);
  
  return { success: true, message: 'Expense added successfully' };
}

// Add payment
function addPayment(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.PAYMENTS);
  
  // Create Payments sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.PAYMENTS);
    sheet.appendRow(['ID', 'Date', 'From', 'To', 'Amount', 'Currency', 'Notes']);
  }
  
  // Validate required fields
  if (!data.date || !data.from || !data.to || !data.amount || !data.currency) {
    throw new Error('Missing required payment fields');
  }
  
  // Get the next ID
  const allData = sheet.getDataRange().getValues();
  const nextId = allData.length;
  
  // Append row
  sheet.appendRow([
    nextId,
    data.date,
    data.from,
    data.to,
    data.amount,
    data.currency,
    data.notes || ''
  ]);
  
  return { success: true, message: 'Payment recorded successfully' };
}
