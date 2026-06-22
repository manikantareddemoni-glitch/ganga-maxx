INSERT INTO users (name, email, password_hash, role, theme_preference) VALUES
('Finance Manager', 'accounts@gangamaxx.com', '$2a$10$W8gFhG5xTfZ1TUD7ixKw8uQ6S1eUMDyrM6MG13fjzwEVavN/4q3eq', 'finance_manager', 'dark'),
('Sales Exec', 'sales@gangamaxx.com', '$2a$10$W8gFhG5xTfZ1TUD7ixKw8uQ6S1eUMDyrM6MG13fjzwEVavN/4q3eq', 'sales_executive', 'dark'),
('Collections Officer', 'collections@gangamaxx.com', '$2a$10$W8gFhG5xTfZ1TUD7ixKw8uQ6S1eUMDyrM6MG13fjzwEVavN/4q3eq', 'collection_officer', 'dark')
ON CONFLICT (email) DO NOTHING;
