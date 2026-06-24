import { describe, it, expect, beforeAll } from 'vitest';

describe('PAYMENT MANAGEMENT MODULE', () => {
  const API_URL = process.env.API_URL || 'https://ganga-maxx-backend.onrender.com';
  let adminToken = '';
  const testEmail = 'admin@gangamaxx.com';
  const testPassword = 'admin123';
  const testReference = `PAY-TEST-${Date.now()}`;

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

  it('PAY-001: Record Payment', async () => {
    // We assume customer_id 1 and invoice_id 1 exist from seed data
    const res = await fetch(`${API_URL}/api/payments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        customer_id: 1,
        invoice_id: 1,
        amount: 5000,
        method: 'Bank Transfer',
        reference_no: testReference,
        payment_date: new Date().toISOString().split('T')[0]
      })
    });
    const data = await res.json();
    if (res.status !== 201) console.error(data);
    expect(res.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.amount).toBe(5000);
  });

  it('PAY-002 & PAY-003: Payment Validation', async () => {
    // Attempting an invalid payment (e.g. negative amount)
    const res = await fetch(`${API_URL}/api/payments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        customer_id: 1,
        invoice_id: 1,
        amount: -5000, // Invalid negative amount
        method: 'Bank Transfer',
        reference_no: `PAY-TEST-${Date.now()}-2`,
        payment_date: new Date().toISOString().split('T')[0]
      })
    });
    
    expect(res.status).not.toBe(201);
  });
});
