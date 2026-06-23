import { describe, it, expect, beforeAll } from 'vitest';

describe('CUSTOMER MANAGEMENT MODULE', () => {
  const API_URL = process.env.API_URL || 'https://ganga-maxx-backend.onrender.com';
  let adminToken = '';
  const testEmail = 'admin@gangamaxx.com';
  const testPassword = 'admin123';
  const mockCustomerEmail = 'unique_customer_test@example.com';

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

  it('CUST-001: Add Customer', async () => {
    const res = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        company_name: 'Test Customer LLC ' + Date.now(),
        contact_name: 'John Test',
        email: `unique_${Date.now()}@example.com`, // Make unique to avoid duplicate error
        phone: '1234567890',
        credit_limit: 50000,
        payment_terms: 30,
        status: 'active'
      })
    });
    const data = await res.json();
    if (res.status !== 201) console.error(data);
    expect(res.status).toBe(201);
    expect(data).toHaveProperty('id');
  });

  it('CUST-002: Duplicate Customer Code', async () => {
    // Attempt to add the exact same customer again
    const res = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        company_name: 'Duplicate LLC',
        contact_name: 'Jane Test',
        email: 'ramesh@balajitraders.in', // Existing email from seed
        phone: '0987654321',
        credit_limit: 100000,
        payment_terms: 15,
        status: 'active'
      })
    });

    expect(res.status).not.toBe(201); // Should fail due to duplicate email
  });
});
