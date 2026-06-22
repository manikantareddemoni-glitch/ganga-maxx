CREATE DATABASE IF NOT EXISTS ganga_maxx_credit;
USE ganga_maxx_credit;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS follow_ups;
DROP TABLE IF EXISTS aging_reports;
DROP TABLE IF EXISTS account_statements;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS credit_accounts;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(50) NOT NULL DEFAULT 'analyst',
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(40) NULL,
  theme_preference ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'dark',
  status ENUM('active', 'disabled', 'pending') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(180) NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(40) NOT NULL,
  address TEXT NULL,
  status ENUM('active', 'paused', 'blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_status (status),
  INDEX idx_customers_company (company_name)
);

CREATE TABLE credit_accounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL UNIQUE,
  credit_limit DECIMAL(14,2) NOT NULL DEFAULT 0,
  outstanding_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status ENUM('active', 'suspended', 'closed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_credit_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  invoice_no VARCHAR(60) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  paid_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'partially_paid', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_invoices_customer (customer_id),
  INDEX idx_invoices_due_status (due_date, status)
);

CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  invoice_id BIGINT NULL,
  amount DECIMAL(14,2) NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  reference_no VARCHAR(80) NOT NULL UNIQUE,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  INDEX idx_payments_date (payment_date),
  INDEX idx_payments_customer (customer_id)
);

CREATE TABLE account_statements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  transaction_date DATE NOT NULL,
  type ENUM('Debit', 'Credit') NOT NULL,
  reference_no VARCHAR(80) NOT NULL,
  description VARCHAR(255) NOT NULL,
  debit DECIMAL(14,2) NOT NULL DEFAULT 0,
  credit DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_statements_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_statements_customer_date (customer_id, transaction_date)
);

CREATE TABLE aging_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  invoice_id BIGINT NOT NULL,
  invoice_no VARCHAR(60) NOT NULL,
  due_date DATE NOT NULL,
  days_overdue INT NOT NULL DEFAULT 0,
  bucket ENUM('Current', '0-30 Days', '31-60 Days', '61-90 Days', '90+ Days') NOT NULL,
  priority ENUM('Normal', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Normal',
  balance DECIMAL(14,2) NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aging_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_aging_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  INDEX idx_aging_bucket (bucket)
);

CREATE TABLE follow_ups (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  scheduled_date DATE NOT NULL,
  notes TEXT NOT NULL,
  status ENUM('Pending', 'In Progress', 'Promise To Pay', 'Collected', 'Escalated') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_follow_ups_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_follow_ups_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NULL,
  details TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type ENUM('system', 'invoice', 'payment', 'customer', 'statement', 'follow_up') NOT NULL,
  title VARCHAR(120) NOT NULL,
  message VARCHAR(255) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_notifications_created (created_at)
);
