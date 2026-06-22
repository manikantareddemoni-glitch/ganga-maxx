import bcrypt
from app import app, db
from models import User, Role, Permission, Customer, CreditAccount

all_permissions = [
    "manage_users", "manage_roles", "view_customers", "view_invoices",
    "view_payments", "view_aging_reports", "export_reports", "system_settings",
    "view_audit_logs", "manage_credit_accounts", "manage_invoices", "track_payments",
    "collection_followup", "generate_statements", "customer_ledger", "credit_requests",
    "overdue_accounts", "collection_activities", "recovery_tracking"
]

roles_map = {
    "Super Admin": all_permissions,
    "Accounts Manager": [
        "manage_credit_accounts", "manage_invoices", "track_payments", 
        "view_aging_reports", "collection_followup", "generate_statements", "export_reports"
    ],
    "Sales Admin": [
        "view_customers", "customer_ledger", "credit_requests", 
        "generate_statements", "collection_followup"
    ],
    "Collection Officer": [
        "overdue_accounts", "collection_activities", "collection_followup", 
        "recovery_tracking"
    ],
    "Viewer": [
        "view_customers", "view_invoices", "view_aging_reports", "generate_statements"
    ]
}

demo_users = [
    {"name": "Super Admin", "email": "admin@gangamaxx.com", "role": "Super Admin"},
    {"name": "Accounts Manager", "email": "accounts@gangamaxx.com", "role": "Accounts Manager"},
    {"name": "Sales Admin", "email": "sales@gangamaxx.com", "role": "Sales Admin"},
    {"name": "Collection Officer", "email": "collections@gangamaxx.com", "role": "Collection Officer"},
    {"name": "Viewer", "email": "viewer@gangamaxx.com", "role": "Viewer"},
]

def seed():
    with app.app_context():
        # Drop all tables and recreate them
        db.drop_all()
        db.create_all()

        # Seed Permissions
        perm_objects = {}
        for p in all_permissions:
            perm = Permission(name=p, description=f"Allows {p.replace('_', ' ')}")
            db.session.add(perm)
            perm_objects[p] = perm
        db.session.commit()

        # Seed Roles & Map Permissions
        role_objects = {}
        for r_name, p_list in roles_map.items():
            role = Role(name=r_name, description=f"{r_name} role")
            for p_name in p_list:
                role.permissions.append(perm_objects[p_name])
            db.session.add(role)
            role_objects[r_name] = role
        db.session.commit()

        # Seed Demo Users
        for user_data in demo_users:
            if not User.query.filter_by(email=user_data['email']).first():
                hashed_pw = bcrypt.hashpw('Admin@123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                db.session.add(User(
                    role_id=role_objects[user_data['role']].id,
                    name=user_data['name'],
                    email=user_data['email'],
                    password_hash=hashed_pw
                ))
        db.session.commit()
        
        # Add a dummy customer
        if not Customer.query.filter_by(email="customer1@demo.com").first():
            customer1 = Customer(
                company_name="Acme Corp",
                contact_name="John Doe",
                email="customer1@demo.com",
                phone="1234567890",
                address="123 Acme Street"
            )
            db.session.add(customer1)
            db.session.commit()
            
            credit_account = CreditAccount(
                customer_id=customer1.id,
                credit_limit=100000.00,
                outstanding_amount=25000.00
            )
            db.session.add(credit_account)
            db.session.commit()

        print("Database seeded successfully with RBAC roles and permissions!")

if __name__ == '__main__':
    seed()
