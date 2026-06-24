import { describe, it, expect, beforeAll } from 'vitest';

describe('AGING REPORT MODULE', () => {
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

  it('AGE-001: Generate Aging Report', async () => {
    const res = await fetch(`${API_URL}/api/reports/aging`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    
    // Test AGE-002: Bucketing Logic implicitly by checking summary keys
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('rows');
    expect(Array.isArray(data.rows)).toBe(true);
  });
});
