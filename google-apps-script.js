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
