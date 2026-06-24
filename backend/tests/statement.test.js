import { describe, it, expect, beforeAll } from 'vitest';

describe('CREDIT ACCOUNT STATEMENT MODULE', () => {
  const API_URL = process.env.API_URL || 'https://ganga-maxx-backend.onrender.com';
  let adminToken = '';
  const testEmail = 'admin@gangamaxx.com';
  const testPassword = 'admin123';
  const customerId = 1; // Assuming customer 1 exists from seed data

  beforeAll(async () => {
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await loginRes.json();
    adminToken = data.token;
  });

  it('CAS-001: Generate Statement', async () => {
    const res = await fetch(`${API_URL}/api/reports/statement/${customerId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('customer');
    expect(data).toHaveProperty('transactions');
    expect(Array.isArray(data.transactions)).toBe(true);
  });

  it('CAS-002: Date Range Filter', async () => {
    const from = '2026-01-01';
    const to = '2026-12-31';
    const res = await fetch(`${API_URL}/api/reports/statement/${customerId}?from=${from}&to=${to}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.from).toBe(from);
    expect(data.to).toBe(to);
  });
});
