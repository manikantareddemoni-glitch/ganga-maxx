export const customers = [
  { id: 1, company_name: 'Sri Balaji Traders', contact_name: 'Ramesh Kumar', email: 'ramesh@balajitraders.in', phone: '+91 98480 11223', credit_limit: 850000, payment_terms: 30, status: 'active', outstanding: 248000 },
  { id: 2, company_name: 'Metro Fresh Retail', contact_name: 'Anita Rao', email: 'finance@metrofresh.in', phone: '+91 90004 77881', credit_limit: 1200000, payment_terms: 45, status: 'active', outstanding: 612500 },
  { id: 3, company_name: 'Deccan Wholesale Co.', contact_name: 'Imran Sheikh', email: 'accounts@deccanwholesale.in', phone: '+91 97033 41018', credit_limit: 650000, payment_terms: 21, status: 'paused', outstanding: 191250 },
  { id: 4, company_name: 'Nava Foods Distribution', contact_name: 'Meena Iyer', email: 'meena@navafoods.in', phone: '+91 98852 40091', credit_limit: 950000, payment_terms: 30, status: 'active', outstanding: 329900 },
  { id: 5, company_name: 'Krishna Super Mart', contact_name: 'Vikram Jain', email: 'vikram@krishnamart.in', phone: '+91 91210 78654', credit_limit: 500000, payment_terms: 15, status: 'blocked', outstanding: 143600 }
];

export const dashboard = {
  metrics: {
    totalCustomers: 148,
    totalOutstanding: 8324800,
    totalOverdue: 2196400,
    pendingInvoices: 312,
    todaysCollections: 684500
  },
  revenue: [
    { month: 'Jan', collections: 1650000 },
    { month: 'Feb', collections: 1820000 },
    { month: 'Mar', collections: 1585000 },
    { month: 'Apr', collections: 2140000 },
    { month: 'May', collections: 2395000 },
    { month: 'Jun', collections: 2680000 }
  ],
  aging: [
    { bucket: 'Current', value: 3820000 },
    { bucket: '0-30 Days', value: 2110000 },
    { bucket: '31-60 Days', value: 1175000 },
    { bucket: '61-90 Days', value: 689000 },
    { bucket: '90+ Days', value: 529800 }
  ],
  activities: [
    { id: 1, type: 'payment', title: 'Payment received', message: 'Metro Fresh Retail paid Rs 2,85,000', createdAt: '10 minutes ago' },
    { id: 2, type: 'invoice', title: 'Invoice overdue', message: 'GMX-INV-1029 crossed 45 days', createdAt: '32 minutes ago' },
    { id: 3, type: 'customer', title: 'Customer added', message: 'Nava Foods Distribution joined credit accounts', createdAt: '1 hour ago' },
    { id: 4, type: 'statement', title: 'Statement generated', message: 'April statement exported for Sri Balaji Traders', createdAt: '2 hours ago' }
  ]
};

export const collectionActions = [
  { id: 1, customer: 'Metro Fresh Retail', invoice_no: 'GMX-INV-1009', days_overdue: 41, amount: 612500, owner: 'Accounts Manager', priority: 'High', action: 'Call finance team and confirm payment date' },
  { id: 2, customer: 'Deccan Wholesale Co.', invoice_no: 'GMX-INV-0988', days_overdue: 72, amount: 191250, owner: 'Sales Admin', priority: 'Critical', action: 'Escalate before next credit order approval' },
  { id: 3, customer: 'Krishna Super Mart', invoice_no: 'GMX-INV-0911', days_overdue: 110, amount: 143600, owner: 'Owner', priority: 'Critical', action: 'Block further credit and request settlement' },
  { id: 4, customer: 'Sri Balaji Traders', invoice_no: 'GMX-INV-1031', days_overdue: 18, amount: 248000, owner: 'Salesman', priority: 'Medium', action: 'Send reminder with latest statement' }
];

export const ledgerRows = [
  { id: 1, transaction_date: '2026-06-08T14:30:00', type: 'Debit', reference_no: 'GMX-INV-1042', description: 'Invoice for marketplace supplies', debit: 186000, credit: 0, running_balance: 428000 },
  { id: 2, transaction_date: '2026-06-06T09:15:00', type: 'Credit', reference_no: 'GMX-PAY-224', description: 'UPI payment received', debit: 0, credit: 125000, running_balance: 242000 },
  { id: 3, transaction_date: '2026-06-02T11:45:00', type: 'Debit', reference_no: 'GMX-INV-1036', description: 'Monthly consolidated invoice', debit: 242000, credit: 0, running_balance: 367000 },
  { id: 4, transaction_date: '2026-05-28T16:20:00', type: 'Credit', reference_no: 'GMX-PAY-211', description: 'Bank transfer received', debit: 0, credit: 90000, running_balance: 125000 }
];

export const agingRows = [
  { bucket: 'Current', company_name: 'Nava Foods Distribution', invoice_no: 'GMX-INV-1045', due_date: '2026-06-28', days_overdue: 0, priority: 'Normal', balance: 216000 },
  { bucket: '0-30 Days', company_name: 'Sri Balaji Traders', invoice_no: 'GMX-INV-1031', due_date: '2026-05-21', days_overdue: 18, priority: 'Medium', balance: 248000 },
  { bucket: '31-60 Days', company_name: 'Metro Fresh Retail', invoice_no: 'GMX-INV-1009', due_date: '2026-04-28', days_overdue: 41, priority: 'High', balance: 612500 },
  { bucket: '61-90 Days', company_name: 'Deccan Wholesale Co.', invoice_no: 'GMX-INV-0988', due_date: '2026-03-28', days_overdue: 72, priority: 'Critical', balance: 191250 },
  { bucket: '90+ Days', company_name: 'Krishna Super Mart', invoice_no: 'GMX-INV-0911', due_date: '2026-02-18', days_overdue: 110, priority: 'Critical', balance: 143600 }
];
