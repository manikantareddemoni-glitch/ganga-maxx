from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import time
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

def send_real_email(recipient_email, customer_name, overdue_days, balance):
    sender_email = os.environ.get("SMTP_EMAIL")
    sender_password = os.environ.get("SMTP_PASSWORD", "").replace(" ", "")

    if not sender_email or not sender_password:
        print(f"[SMTP ERROR] Could not send email to {recipient_email}. Missing SMTP_EMAIL or SMTP_PASSWORD in .env file.")
        return False

    subject = f"URGENT: Overdue Account Notice - {customer_name}"
    body = f"""
Dear {customer_name},

This is an automated notice from Ganga Maxx Credit Control.
Your account is currently {overdue_days} days overdue with an outstanding balance of {balance}.

Please remit payment immediately to avoid suspension of your credit line.

Sincerely,
Ganga Maxx AI Accounts Team
"""

    msg = MIMEMultipart()
    msg['From'] = f"Ganga Maxx AI <{sender_email}>"
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Connecting to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send email: {str(e)}")
        return False

def send_real_whatsapp_message(customer_name, overdue_days, balance, target_phone):
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    twilio_number = os.environ.get('TWILIO_WHATSAPP_NUMBER') # e.g. 'whatsapp:+14155238886'
    
    if not account_sid or not auth_token or not twilio_number:
        print(f"[TWILIO ERROR] Missing Twilio credentials in .env file. Could not send WhatsApp to {target_phone}.")
        return False

    whatsapp_msg = f"🟢 *Ganga Maxx Notice*\nHi {customer_name}, your account is {overdue_days} days overdue (Bal: {balance}). Please arrange payment today to keep your credit line active. Reply 'HELP' if you have doubts."
    
    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            from_=twilio_number,
            body=whatsapp_msg,
            to=f'whatsapp:{target_phone}'
        )
        print(f"\n    [SUCCESS] REAL WhatsApp Message Delivered to {target_phone} (SID: {message.sid})\n")
        return True
    except Exception as e:
        print(f"\n    [TWILIO ERROR] Failed to send WhatsApp: {str(e)}\n")
        return False

def send_autonomous_emails():
    print(f"\n[AUTONOMOUS SYSTEM] {datetime.datetime.now()} - Scanning database for overdue accounts...")
    
    # Simulating found accounts
    accounts = [
        {"name": "Sri Balaji Traders", "overdue": 72, "balance": "₹45,000"},
        {"name": "Metro Fresh Retail", "overdue": 95, "balance": "₹1,20,000"}
    ]
    
    print(f"[AUTONOMOUS SYSTEM] Found {len(accounts)} critical accounts requiring immediate action.")
    
    # We will specifically test by sending to the user's requested email address
    target_email = "manikantareddemoni@gmail.com"
    
    for acc in accounts:
        print(f"[AUTONOMOUS SYSTEM] AI drafting and sending formal notice for {acc['name']} to {target_email}...")
        success = send_real_email(target_email, acc['name'], acc['overdue'], acc['balance'])
        
        if success:
            print(f"    [SUCCESS] REAL Email Sent successfully to {target_email}")
        else:
            print(f"    [WARNING] Simulated Email sent (Real sending failed) to {target_email}")
            
        # Target test phone number for WhatsApp
        target_phone = os.environ.get('TEST_WHATSAPP_NUMBER', '+1234567890') # Replace with user's number via env
        send_real_whatsapp_message(acc['name'], acc['overdue'], acc['balance'], target_phone)
            
    print("[AUTONOMOUS SYSTEM] Autonomous cycle complete.\n")

def init_scheduler(app):
    scheduler = BackgroundScheduler(daemon=True)
    # Set to run once a day
    scheduler.add_job(send_autonomous_emails, 'interval', days=1)
    scheduler.start()
    print("Autonomous AI Email Scheduler started. Running once a day.")
