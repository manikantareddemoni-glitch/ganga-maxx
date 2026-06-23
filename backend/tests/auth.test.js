import { describe, it, expect } from 'vitest';

describe('AUTHENTICATION MODULE', () => {
  const API_URL = process.env.API_URL || 'https://ganga-maxx-backend.onrender.com';
  // Use the admin123 hash for testing
  const testEmail = 'admin@gangamaxx.com';
  const testPassword = 'admin123';
  const wrongPassword = 'wrongpassword';

  it('AUTH-001: Valid Login', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('token');
    expect(data.user).toHaveProperty('email', testEmail);
  });

  it('AUTH-002: Invalid Password', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: wrongPassword })
    });
    const data = await res.json();
    
    expect(res.status).toBe(401);
    expect(data).toHaveProperty('message');
  });

  it('AUTH-003: Empty Fields', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' })
    });
    
    expect(res.status).not.toBe(200);
  });
});
