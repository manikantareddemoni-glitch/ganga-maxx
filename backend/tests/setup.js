import { beforeAll, afterAll } from 'vitest';

// Use production backend URL for E2E testing
process.env.API_URL = 'https://ganga-maxx-backend.onrender.com';

beforeAll(async () => {
  console.log('Testing against LIVE server:', process.env.API_URL);
});

afterAll(async () => {
  // Can clean up mock data here if needed
});

