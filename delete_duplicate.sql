DELETE FROM credit_accounts WHERE customer_id IN (SELECT id FROM customers WHERE email = 'mani@gmail.com');
DELETE FROM customers WHERE email = 'mani@gmail.com';
