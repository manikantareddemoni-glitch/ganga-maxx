// Mock data has been cleared per user request to avoid showing demo data.
// The frontend will now gracefully fall back to empty states if offline.

export const customers = [];

export const dashboard = {
  metrics: {
    totalCustomers: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    pendingInvoices: 0,
    todaysCollections: 0
  },
  revenue: [],
  aging: [],
  activities: []
};

export const collectionActions = [];

export const ledgerRows = [];

export const agingRows = [];
