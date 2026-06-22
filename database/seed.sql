INSERT INTO users (name, email, password_hash, role, theme_preference) VALUES
('Ganga Maxx Admin', 'admin@gangamaxx.com', '$2a$10$W8gFhG5xTfZ1TUD7ixKw8uQ6S1eUMDyrM6MG13fjzwEVavN/4q3eq', 'admin', 'dark')
ON CONFLICT (email) DO NOTHING;

INSERT INTO customers (id, company_name, contact_name, email, phone, status) VALUES
(1, 'Sri Balaji Traders', 'Ramesh Kumar', 'ramesh@balajitraders.in', '+91 98480 11223', 'active'),
(2, 'Metro Fresh Retail', 'Anita Rao', 'finance@metrofresh.in', '+91 90004 77881', 'active'),
(3, 'Deccan Wholesale Co.', 'Imran Sheikh', 'accounts@deccanwholesale.in', '+91 97033 41018', 'paused'),
(4, 'Nava Foods Distribution', 'Meena Iyer', 'meena@navafoods.in', '+91 98852 40091', 'active'),
(5, 'Krishna Super Mart', 'Vikram Jain', 'vikram@krishnamart.in', '+91 91210 78654', 'blocked')
ON CONFLICT (id) DO NOTHING;

INSERT INTO credit_accounts (customer_id, credit_limit, outstanding_amount, status) VALUES
(1, 850000, 434000, 'active'),
(2, 1200000, 612500, 'active'),
(3, 650000, 191250, 'suspended'),
(4, 950000, 216000, 'active'),
(5, 500000, 143600, 'closed')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO invoices (customer_id, invoice_no, invoice_date, due_date, total_amount, paid_amount, status) VALUES
(1, 'GMX-INV-1042', '2026-06-08', '2026-07-08', 186000, 0, 'pending'),
(1, 'GMX-INV-1031', '2026-05-01', '2026-05-31', 338000, 90000, 'partially_paid'),
(2, 'GMX-INV-1009', '2026-03-14', '2026-04-28', 812500, 200000, 'overdue'),
(3, 'GMX-INV-0988', '2026-03-07', '2026-03-28', 251250, 60000, 'overdue'),
(4, 'GMX-INV-1045', '2026-05-29', '2026-06-28', 329900, 113900, 'partially_paid'),
(5, 'GMX-INV-0911', '2026-02-03', '2026-02-18', 203600, 60000, 'overdue')
ON CONFLICT (invoice_no) DO NOTHING;

INSERT INTO payments (customer_id, invoice_id, amount, payment_method, reference_no, payment_date) VALUES
(1, 2, 90000, 'Bank Transfer', 'GMX-PAY-211', '2026-05-28'),
(2, 3, 200000, 'NEFT', 'GMX-PAY-218', '2026-05-30'),
(4, 5, 113900, 'UPI', 'GMX-PAY-222', '2026-06-06'),
(1, 2, 125000, 'UPI', 'GMX-PAY-224', '2026-06-06')
ON CONFLICT (reference_no) DO NOTHING;

INSERT INTO account_statements (customer_id, transaction_date, type, reference_no, description, debit, credit) VALUES
(1, '2026-05-01', 'Debit', 'GMX-INV-1031', 'Monthly consolidated invoice', 338000, 0),
(1, '2026-05-28', 'Credit', 'GMX-PAY-211', 'Bank transfer received', 0, 90000),
(1, '2026-06-06', 'Credit', 'GMX-PAY-224', 'UPI payment received', 0, 125000),
(1, '2026-06-08', 'Debit', 'GMX-INV-1042', 'Invoice for marketplace supplies', 186000, 0),
(2, '2026-03-14', 'Debit', 'GMX-INV-1009', 'High value wholesale invoice', 812500, 0),
(2, '2026-05-30', 'Credit', 'GMX-PAY-218', 'NEFT payment received', 0, 200000),
(3, '2026-03-07', 'Debit', 'GMX-INV-0988', 'Distribution invoice', 251250, 0),
(3, '2026-04-05', 'Credit', 'GMX-PAY-175', 'Partial transfer received', 0, 60000);

INSERT INTO aging_reports (customer_id, invoice_id, invoice_no, due_date, days_overdue, bucket, priority, balance) VALUES
(4, 5, 'GMX-INV-1045', '2026-06-28', 0, 'Current', 'Normal', 216000),
(1, 2, 'GMX-INV-1031', '2026-05-31', 18, '0-30 Days', 'Medium', 248000),
(2, 3, 'GMX-INV-1009', '2026-04-28', 41, '31-60 Days', 'High', 612500),
(3, 4, 'GMX-INV-0988', '2026-03-28', 72, '61-90 Days', 'Critical', 191250),
(5, 6, 'GMX-INV-0911', '2026-02-18', 110, '90+ Days', 'Critical', 143600);

INSERT INTO notifications (user_id, type, title, message, created_at) VALUES
(1, 'payment', 'Payment received', 'Metro Fresh Retail paid Rs 2,00,000', '2026-06-08 10:15:00'),
(1, 'invoice', 'Invoice overdue', 'GMX-INV-1009 crossed 45 days', '2026-06-08 09:35:00'),
(1, 'customer', 'New customer added', 'Nava Foods Distribution joined credit accounts', '2026-06-07 17:20:00'),
(1, 'statement', 'Statement generated', 'May statement exported for Sri Balaji Traders', '2026-06-07 15:10:00');
