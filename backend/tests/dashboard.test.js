import { describe, it, expect, beforeAll } from 'vitest';

describe('DASHBOARD & ANALYTICS MODULE', () => {
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

  it('DASH-001 & DASH-002: Dashboard Overview & KPI Data', async () => {
    const res = await fetch(`${API_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    
    // Check KPIs
    expect(data).toHaveProperty('metrics');
    expect(data.metrics).toHaveProperty('totalReceivables');
    expect(data.metrics).toHaveProperty('overdueAmount');
    
    // Check Aging Data
    expect(data).toHaveProperty('agingData');
    expect(Array.isArray(data.agingData)).toBe(true);
  });
});
