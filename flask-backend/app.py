from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity, get_jwt
)
from datetime import timedelta, datetime
import bcrypt
import os
from functools import wraps

from config import Config
from models import db, User, Role, Permission, UserSession, Customer, CreditAccount, Invoice, Payment, AgingReport, FollowUp, Notification, AuditLog

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
jwt = JWTManager(app)
db.init_app(app)

from ai_routes import ai_bp
app.register_blueprint(ai_bp)

# Initialize Autonomous Scheduler
# from scheduler import init_scheduler
# init_scheduler(app)

def role_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get('role')
            if user_role not in allowed_roles:
                return jsonify({"message": f"Missing required role. Allowed: {', '.join(allowed_roles)}"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({"message": "Invalid email or password"}), 401
        
    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({"message": "Invalid email or password"}), 401

    role_name = user.role_enum if user.role_enum else "viewer"

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": role_name, "name": user.name},
        expires_delta=timedelta(minutes=15)
    )
    
    refresh_token = create_refresh_token(
        identity=str(user.id),
        expires_delta=timedelta(days=7)
    )
    
    from flask_jwt_extended import decode_token
    decoded_refresh = decode_token(refresh_token)
    refresh_jti = decoded_refresh['jti']
    
    session = UserSession(
        user_id=user.id,
        refresh_token_jti=refresh_jti,
        device_info=request.headers.get('User-Agent', '')[:255],
        ip_address=request.remote_addr,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.session.add(session)
    
    audit = AuditLog(user_id=user.id, action="LOGIN", entity_type="User", entity_id=user.id)
    db.session.add(audit)
    
    db.session.commit()

    return jsonify({
        "token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role_name
        }
    }), 200

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    claims = get_jwt()
    jti = claims['jti']
    
    session = UserSession.query.filter_by(refresh_token_jti=jti).first()
    if not session or session.expires_at < datetime.utcnow():
        return jsonify({"message": "Session expired or invalid"}), 401
        
    user = User.query.get(identity)
    if not user:
         return jsonify({"message": "User not found"}), 404

    role_name = user.role_enum if user.role_enum else "viewer"

    access_token = create_access_token(
        identity=identity,
        additional_claims={"role": role_name, "name": user.name},
        expires_delta=timedelta(minutes=15)
    )
    return jsonify(token=access_token), 200

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required(refresh=True)
def logout():
    claims = get_jwt()
    jti = claims['jti']
    identity = get_jwt_identity()
    
    session = UserSession.query.filter_by(refresh_token_jti=jti).first()
    if session:
        db.session.delete(session)
        
    audit = AuditLog(user_id=identity, action="LOGOUT", entity_type="User", entity_id=identity)
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({"message": "Successfully logged out"}), 200

@app.route('/api/users/profile', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role_enum if user.role_enum else "viewer"
    }), 200

@app.route('/api/roles', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_roles():
    roles = Role.query.all()
    return jsonify([{
        "id": r.id, 
        "name": r.name, 
        "description": r.description,
        "permissions": [p.name for p in r.permissions]
    } for r in roles]), 200

@app.route('/api/auth/google', methods=['POST'])
def google_login():
    import urllib.request
    import json
    import string
    import random

    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({"message": "Token is required"}), 400

    try:
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        url = "https://www.googleapis.com/oauth2/v3/userinfo"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req, context=ctx) as response:
            user_info = json.loads(response.read().decode())
    except Exception as e:
        print("Google OAuth Error:", str(e))
        return jsonify({"message": "Invalid Google token or connection error"}), 401
        
    email = user_info.get("email")
    name = user_info.get("name")
    
    if not email:
        return jsonify({"message": "Email not provided by Google"}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Create a new user if one doesn't exist. Assign them to Viewer by default
        random_password = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
        hashed = bcrypt.hashpw(random_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        viewer_role = Role.query.filter_by(name="Viewer").first()
        
        user = User(
            name=name or "Google User",
            email=email,
            password_hash=hashed,
            role_enum="viewer"
        )
        db.session.add(user)
        db.session.commit()

    role_name = user.role_enum if user.role_enum else "viewer"

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": role_name, "name": user.name},
        expires_delta=timedelta(minutes=15)
    )
    
    refresh_token = create_refresh_token(
        identity=str(user.id),
        expires_delta=timedelta(days=7)
    )
    
    from flask_jwt_extended import decode_token
    decoded_refresh = decode_token(refresh_token)
    refresh_jti = decoded_refresh['jti']
    
    session = UserSession(
        user_id=user.id,
        refresh_token_jti=refresh_jti,
        device_info=request.headers.get('User-Agent', '')[:255],
        ip_address=request.remote_addr,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.session.add(session)
    
    audit = AuditLog(user_id=user.id, action="GOOGLE_LOGIN", entity_type="User", entity_id=user.id)
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        "token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role_name
        }
    }), 200

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    from datetime import datetime, timedelta
    import random
    
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email is required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "If an account exists, an OTP has been sent."}), 200
        
    otp = str(random.randint(100000, 999999))
    user.reset_otp = otp
    user.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()
    
    print(f"[MOCK EMAIL] Password Reset OTP for {user.email} is: {otp}")
    
    return jsonify({"message": "OTP sent successfully."}), 200

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    from datetime import datetime
    
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({"message": "Email and OTP are required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or user.reset_otp != otp or user.reset_otp_expiry < datetime.utcnow():
        return jsonify({"message": "Invalid or expired OTP"}), 400
        
    return jsonify({"message": "OTP verified successfully."}), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    from datetime import datetime
    
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    
    if not email or not otp or not new_password:
        return jsonify({"message": "Email, OTP, and new password are required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or user.reset_otp != otp or user.reset_otp_expiry < datetime.utcnow():
        return jsonify({"message": "Invalid or expired OTP"}), 400
        
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    user.password_hash = hashed.decode('utf-8')
    user.reset_otp = None
    user.reset_otp_expiry = None
    db.session.commit()
    
    return jsonify({"message": "Password reset successfully."}), 200

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    claims = get_jwt()
    # Mocking dashboard data for now
    total_customers = Customer.query.count()
    outstanding_amount = db.session.query(db.func.sum(CreditAccount.outstanding_amount)).scalar() or 0
    
    return jsonify({
        "total_customers": total_customers,
        "outstanding_amount": float(outstanding_amount)
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
