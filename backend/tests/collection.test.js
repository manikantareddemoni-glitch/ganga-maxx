import { describe, it, expect, beforeAll } from 'vitest';

describe('COLLECTION ACTIONS MODULE', () => {
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

  it('COL-002: Send Email Reminder', async () => {
    const res = await fetch(`${API_URL}/api/actions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        action: 'send_reminders',
        reminders: [
          {
            customer: 'Test Customer',
            invoice_no: 'INV-TEST-123',
            days_overdue: 45,
            amount: 50000
          }
        ]
      })
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
