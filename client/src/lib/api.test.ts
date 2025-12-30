import { describe, it, expect } from 'vitest';

describe('Google Sheets API Connection', () => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzmnB-iSSTi-BPB1GxPTAIpKlE-M49qrVw35CTduZ8hLYfNconbhYerrWqdmCuRfvNl/exec';

  it('should connect to the Google Sheets API endpoint', async () => {
    const response = await fetch(`${API_URL}?action=getData`);
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
  }, { timeout: 15000 });

  it('should return valid JSON data from the API', async () => {
    const response = await fetch(`${API_URL}?action=getData`);
    const data = await response.json();
    
    expect(data).toBeDefined();
    expect(data.settings).toBeDefined();
    expect(data.participants).toBeDefined();
    expect(data.expenses).toBeDefined();
  }, { timeout: 15000 });

  it('should have the correct data structure', async () => {
    const response = await fetch(`${API_URL}?action=getData`);
    const data = await response.json();
    
    // Verify settings
    expect(data.settings.FX_RATE_SGD_JPY).toBeGreaterThan(0);
    expect(data.settings.TRIP_START_DATE).toBeTruthy();
    expect(data.settings.TRIP_END_DATE).toBeTruthy();
    
    // Verify participants
    expect(Array.isArray(data.participants)).toBe(true);
    expect(data.participants.length).toBeGreaterThanOrEqual(11);
    
    // Verify expenses
    expect(Array.isArray(data.expenses)).toBe(true);
  }, { timeout: 15000 });

  it('should have all 11 expected participants', async () => {
    const response = await fetch(`${API_URL}?action=getData`);
    const data = await response.json();
    
    const names = data.participants.map((p: any) => p.Name || p.name);
    const expectedNames = [
      'Aileen', 'Jonathan', 'Nicolette', 'Leonard', 'Dom',
      'Gail', 'Julia', 'Justin', 'Chris', 'Cors', 'Sheng'
    ];
    
    expectedNames.forEach(name => {
      expect(names).toContain(name);
    });
  }, { timeout: 15000 });
});
