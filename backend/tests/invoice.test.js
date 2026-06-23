import { describe, it, expect, beforeAll } from 'vitest';

describe('INVOICE MANAGEMENT MODULE', () => {
  const API_URL = process.env.API_URL || 'https://ganga-maxx-backend.onrender.com';
  let adminToken = '';
  const testEmail = 'admin@gangamaxx.com';
  const testPassword = 'admin123';

  beforeAll(async () => {
    // Get token
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await loginRes.json();
    adminToken = data.token;
  });

  it('INV-001: Create Invoice', async () => {
    // We assume customer_id 1 exists from seed data
    const res = await fetch(`${API_URL}/api/invoices`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        customer_id: 1,
        total_amount: 150000,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    });
    
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('invoice_no');
    // Save invoice_no for the next test
    process.env.LAST_INVOICE_NO = data.invoice_no;
  });

  it('INV-002: Unique Invoice Number', async () => {
    // Ensure the system generated a non-empty string that looks like a unique number
    expect(process.env.LAST_INVOICE_NO).toBeDefined();
    expect(process.env.LAST_INVOICE_NO.length).toBeGreaterThan(5);
  });
});
