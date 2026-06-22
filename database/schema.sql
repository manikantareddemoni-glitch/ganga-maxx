-- PostgreSQL Schema for Ganga Maxx

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS aging_reports CASCADE;
DROP TABLE IF EXISTS account_statements CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL DEFAULT 'analyst',
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(40) NULL,
  theme_preference VARCHAR(20) NOT NULL DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark', 'system')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'pending')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL,
  mobile_otp VARCHAR(10) NULL,
  mobile_otp_expiry TIMESTAMP NULL,
  email_otp VARCHAR(10) NULL,
  email_otp_expiry TIMESTAMP NULL,
  mobile_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE
);

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  company_name VARCHAR(180) NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(40) NOT NULL,
  address TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'blocked')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_company ON customers(company_name);

CREATE TABLE credit_accounts (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL UNIQUE,
  credit_limit DECIMAL(14,2) NOT NULL DEFAULT 0,
  outstanding_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_credit_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TRIGGER update_credit_accounts_modtime BEFORE UPDATE ON credit_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  invoice_no VARCHAR(60) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  paid_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_due_status ON invoices(due_date, status);

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  invoice_id BIGINT NULL,
  amount DECIMAL(14,2) NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  reference_no VARCHAR(80) NOT NULL UNIQUE,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_customer ON payments(customer_id);

CREATE TABLE account_statements (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  transaction_date DATE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('Debit', 'Credit')),
  reference_no VARCHAR(80) NOT NULL,
  description VARCHAR(255) NOT NULL,
  debit DECIMAL(14,2) NOT NULL DEFAULT 0,
  credit DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_statements_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_statements_customer_date ON account_statements(customer_id, transaction_date);

CREATE TABLE aging_reports (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  invoice_id BIGINT NOT NULL,
  invoice_no VARCHAR(60) NOT NULL,
  due_date DATE NOT NULL,
  days_overdue INT NOT NULL DEFAULT 0,
  bucket VARCHAR(20) NOT NULL CHECK (bucket IN ('Current', '0-30 Days', '31-60 Days', '61-90 Days', '90+ Days')),
  priority VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Medium', 'High', 'Critical')),
  balance DECIMAL(14,2) NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aging_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_aging_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE INDEX idx_aging_bucket ON aging_reports(bucket);

CREATE TABLE follow_ups (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  scheduled_date DATE NOT NULL,
  notes TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Promise To Pay', 'Collected', 'Escalated')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_follow_ups_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_follow_ups_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TRIGGER update_follow_ups_modtime BEFORE UPDATE ON follow_ups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NULL,
  details TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('system', 'invoice', 'payment', 'customer', 'statement', 'follow_up')),
  title VARCHAR(120) NOT NULL,
  message VARCHAR(255) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_created ON notifications(created_at);
