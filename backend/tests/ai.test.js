import { describe, it, expect, beforeAll } from 'vitest';

describe('AI FEATURES MODULE', () => {
  const API_URL = process.env.API_URL || 'https://ganga-maxx-backend.onrender.com';
  let adminToken = '';
  const testEmail = 'admin@gangamaxx.com';
  const testPassword = 'admin123';

  beforeAll(async () => {
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await loginRes.json();
    adminToken = data.token;
  });

  it('AI-001: Generate Reminder Text', async () => {
    const res = await fetch(`${API_URL}/api/ai/generate-reminder`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        customerName: 'Test Customer',
        invoiceNo: 'INV-TEST-123',
        daysOverdue: 45,
        amount: 50000,
        tone: 'professional'
      })
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('message');
    expect(typeof data.message).toBe('string');
    expect(data.message.length).toBeGreaterThan(10);
  });
});
