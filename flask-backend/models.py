from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Association table for many-to-many relationship between Role and Permission
role_permissions = db.Table('role_permissions',
    db.Column('role_id', db.BigInteger, db.ForeignKey('roles.id'), primary_key=True),
    db.Column('permission_id', db.BigInteger, db.ForeignKey('permissions.id'), primary_key=True)
)

class Permission(db.Model):
    __tablename__ = 'permissions'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    permissions = db.relationship('Permission', secondary=role_permissions, lazy='subquery',
        backref=db.backref('roles', lazy=True))

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    role_id = db.Column(db.BigInteger, db.ForeignKey('roles.id'), nullable=True)
    role_enum = db.Column('role', db.Enum('admin', 'finance_manager', 'accounts_executive', 'collection_officer', 'sales_executive', 'viewer'), default='viewer', nullable=False)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    mobile_number = db.Column(db.String(40), nullable=True)
    theme_preference = db.Column(db.Enum('light', 'dark', 'system'), default='dark', nullable=False)
    status = db.Column(db.Enum('active', 'disabled', 'pending'), default='active', nullable=False)
    reset_otp = db.Column(db.String(10), nullable=True)
    reset_otp_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    role = db.relationship('Role', backref=db.backref('users', lazy=True))

class UserSession(db.Model):
    __tablename__ = 'user_sessions'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    refresh_token_jti = db.Column(db.String(36), nullable=False, unique=True)
    device_info = db.Column(db.String(255), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref=db.backref('sessions', lazy=True))

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    company_name = db.Column(db.String(180), nullable=False)
    contact_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), nullable=False, unique=True)
    phone = db.Column(db.String(40), nullable=False)
    address = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum('active', 'paused', 'blocked'), default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class CreditAccount(db.Model):
    __tablename__ = 'credit_accounts'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.BigInteger, db.ForeignKey('customers.id'), nullable=False, unique=True)
    credit_limit = db.Column(db.Numeric(14, 2), default=0, nullable=False)
    outstanding_amount = db.Column(db.Numeric(14, 2), default=0, nullable=False)
    status = db.Column(db.Enum('active', 'suspended', 'closed'), default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    customer = db.relationship('Customer', backref=db.backref('credit_account', uselist=False))

class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.BigInteger, db.ForeignKey('customers.id'), nullable=False)
    invoice_no = db.Column(db.String(60), nullable=False, unique=True)
    invoice_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    total_amount = db.Column(db.Numeric(14, 2), nullable=False)
    paid_amount = db.Column(db.Numeric(14, 2), default=0, nullable=False)
    status = db.Column(db.Enum('pending', 'partially_paid', 'paid', 'overdue', 'cancelled'), default='pending', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    customer = db.relationship('Customer', backref=db.backref('invoices', lazy=True))

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.BigInteger, db.ForeignKey('customers.id'), nullable=False)
    invoice_id = db.Column(db.BigInteger, db.ForeignKey('invoices.id'), nullable=True)
    amount = db.Column(db.Numeric(14, 2), nullable=False)
    payment_method = db.Column(db.String(40), nullable=False)
    reference_no = db.Column(db.String(80), nullable=False, unique=True)
    payment_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    customer = db.relationship('Customer', backref=db.backref('payments', lazy=True))
    invoice = db.relationship('Invoice', backref=db.backref('payments', lazy=True))

class AccountStatement(db.Model):
    __tablename__ = 'account_statements'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.BigInteger, db.ForeignKey('customers.id'), nullable=False)
    transaction_date = db.Column(db.Date, nullable=False)
    type = db.Column(db.Enum('Debit', 'Credit'), nullable=False)
    reference_no = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    debit = db.Column(db.Numeric(14, 2), default=0, nullable=False)
    credit = db.Column(db.Numeric(14, 2), default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    customer = db.relationship('Customer', backref=db.backref('statements', lazy=True))

class AgingReport(db.Model):
    __tablename__ = 'aging_reports'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.BigInteger, db.ForeignKey('customers.id'), nullable=False)
    invoice_id = db.Column(db.BigInteger, db.ForeignKey('invoices.id'), nullable=False)
    invoice_no = db.Column(db.String(60), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    days_overdue = db.Column(db.Integer, default=0, nullable=False)
    bucket = db.Column(db.Enum('Current', '0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'), nullable=False)
    priority = db.Column(db.Enum('Normal', 'Medium', 'High', 'Critical'), default='Normal', nullable=False)
    balance = db.Column(db.Numeric(14, 2), nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    customer = db.relationship('Customer', backref=db.backref('aging_reports', lazy=True))
    invoice = db.relationship('Invoice', backref=db.backref('aging_reports', lazy=True))

class FollowUp(db.Model):
    __tablename__ = 'follow_ups'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.BigInteger, db.ForeignKey('customers.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    scheduled_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('Pending', 'In Progress', 'Promise To Pay', 'Collected', 'Escalated'), default='Pending', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    customer = db.relationship('Customer', backref=db.backref('follow_ups', lazy=True))
    user = db.relationship('User', backref=db.backref('follow_ups', lazy=True))

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.BigInteger, nullable=True)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref=db.backref('audit_logs', lazy=True))

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum('system', 'invoice', 'payment', 'customer', 'statement', 'follow_up'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref=db.backref('notifications', lazy=True))
