import { Settings, Participant, Expense, Payment } from './types';

// This URL will be provided by the user after they deploy the Google Apps Script
// For development, we can use a mock or a placeholder
const API_URL = import.meta.env.VITE_GOOGLE_SHEETS_API_URL || '';

export interface AppData {
  settings: Settings;
  participants: Participant[];
  expenses: Expense[];
  payments?: Payment[];
  lastUpdated: string;
}

const CACHE_KEY = 'myoko_treasury_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchData(): Promise<AppData> {
  // 1. Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    // Return cached data if fresh enough, but still fetch in background to update
    if (age < CACHE_DURATION) {
      // If we have an API URL, fetch in background to update cache for next time
      if (API_URL) {
        fetchFromApi().catch(console.error);
      }
      return data;
    }
  }

  // 2. Fetch from API
  if (!API_URL) {
    console.warn('No API URL provided, returning mock data');
    return getMockData();
  }

  return fetchFromApi();
}

async function fetchFromApi(): Promise<AppData> {
  try {
    const response = await fetch(`${API_URL}?action=getData`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    // Transform raw data to match our types if necessary
    // The Google Apps Script returns keys matching our types mostly, but let's be safe
    const formattedData: AppData = {
      settings: normalizeSettings(data.settings),
      participants: normalizeParticipants(data.participants),
      expenses: normalizeExpenses(data.expenses),
      lastUpdated: new Date().toISOString()
    };

    // Update cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: formattedData,
      timestamp: Date.now()
    }));

    return formattedData;
  } catch (error) {
    console.error('Fetch error:', error);
    // Fallback to cache if available (even if stale)
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached).data;
    }
    throw error;
  }
}

export async function addExpense(expense: Omit<Expense, 'id'>, passcode: string): Promise<boolean> {
  if (!API_URL) {
    console.warn('No API URL, simulating add expense');
    return true;
  }

  // Simple passcode check (client-side for now, but should be server-side ideally)
  // In a real app, we'd send this to the server
  const correctPasscode = import.meta.env.VITE_TREASURER_PASSCODE;
  if (passcode !== correctPasscode) {
    throw new Error('Invalid passcode');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        ...expense,
        action: 'addExpense' // This is handled by the doPost in Apps Script
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Invalidate cache to force refresh
      localStorage.removeItem(CACHE_KEY);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Add expense error:', error);
    return false;
  }
}

// --- NORMALIZATION HELPERS ---

function normalizeSettings(raw: any): Settings {
  return {
    fxRate: Number(raw.FX_RATE_SGD_JPY) || 110,
    tripStartDate: raw.TRIP_START_DATE || '',
    tripEndDate: raw.TRIP_END_DATE || '',
    dailyBudgetJpy: Number(raw.DAILY_BUDGET_JPY) || 15000
  };
}

function normalizeParticipants(raw: any[]): Participant[] {
  return raw.map(p => ({
    name: p.Name || p.name,
    amountPaidSgd: Number(p['Amount Paid (SGD)'] || p['amount paid (sgd)'] || 0),
    status: p.Status || p.status || 'Pending',
    email: p.Email || p.email || ''
  }));
}

function normalizeExpenses(raw: any[]): Expense[] {
  return raw.map((e, index) => ({
    id: `exp-${index}`, // Generate a temporary ID
    date: e.Date || e.date,
    description: e.Description || e.description,
    amount: Number(e.Amount || e.amount),
    currency: (e.Currency || e.currency) as 'SGD' | 'JPY',
    paidBy: e['Paid By'] || e['paid by'],
    splitMethod: e['Split Method'] || e['split method'] || 'Equal'
  }));
}

// --- MOCK DATA ---
function getMockData(): AppData {
  return {
    settings: {
      fxRate: 112.5,
      tripStartDate: '2026-01-15',
      tripEndDate: '2026-01-22',
      dailyBudgetJpy: 15000
    },
    participants: [
      { name: 'Alice', amountPaidSgd: 2500, status: 'Paid', email: '' },
      { name: 'Bob', amountPaidSgd: 2500, status: 'Paid', email: '' },
      { name: 'Charlie', amountPaidSgd: 0, status: 'Pending', email: '' },
      { name: 'Dave', amountPaidSgd: 1000, status: 'Pending', email: '' }
    ],
    expenses: [
      { id: '1', date: '2026-01-15', description: 'Shinkansen Tickets', amount: 44000, currency: 'JPY', paidBy: 'Alice', splitMethod: 'Equal' },
      { id: '2', date: '2026-01-15', description: 'Bento Boxes', amount: 4800, currency: 'JPY', paidBy: 'Bob', splitMethod: 'Equal' },
      { id: '3', date: '2026-01-16', description: 'Lift Passes (2 Days)', amount: 120000, currency: 'JPY', paidBy: 'Alice', splitMethod: 'Equal' },
      { id: '4', date: '2026-01-16', description: 'Dinner at Udon Place', amount: 12000, currency: 'JPY', paidBy: 'Charlie', splitMethod: 'Equal' }
    ],
    lastUpdated: new Date().toISOString()
  };
}
