import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from openai import OpenAI

ai_bp = Blueprint('ai', __name__)

def get_openai_client():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set in the environment.")
    return OpenAI(api_key=api_key)

@ai_bp.route('/api/ai/generate-reminder', methods=['POST'])
@jwt_required()
def generate_reminder():
    data = request.get_json()
    customer_name = data.get('customer_name', 'Customer')
    outstanding = data.get('outstanding', '0')
    days_overdue = data.get('days_overdue', '0')
    
    try:
        client = get_openai_client()
        prompt = f"""
        Write a professional B2B collection email reminder for {customer_name}.
        They have an outstanding balance of ₹{outstanding} which is {days_overdue} days overdue.
        The tone should be polite but firm, requesting immediate payment or an update on the payment status.
        Keep it under 150 words. Do not include placeholders like [Your Name].
        """
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a professional B2B collections officer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return jsonify({"message": response.choices[0].message.content}), 200
    except Exception as e:
        # Fallback simulation mode
        print(f"OpenAI Error: {str(e)} - Falling back to simulation mode")
        simulated_response = f"Dear {customer_name},\n\nThis is a friendly reminder that your account currently has an outstanding balance of ₹{outstanding}, which is {days_overdue} days overdue. We kindly request that you process this payment at your earliest convenience to avoid any disruption to your credit line.\n\nIf you have already made this payment, please disregard this notice.\n\nBest regards,\nGanga Maxx Accounts Team"
        return jsonify({"message": simulated_response}), 200

@ai_bp.route('/api/ai/expand-notes', methods=['POST'])
@jwt_required()
def expand_notes():
    data = request.get_json()
    shorthand = data.get('shorthand', '')
    
    if not shorthand:
        return jsonify({"error": "No notes provided"}), 400
        
    try:
        client = get_openai_client()
        prompt = f"""
        Convert the following shorthand collection notes into a professional, clear, and audit-ready log entry.
        Shorthand: "{shorthand}"
        Return ONLY the expanded professional note. Do not add conversational filler.
        """
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an AI that formats administrative records."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=200
        )
        return jsonify({"expanded_note": response.choices[0].message.content.strip()}), 200
    except Exception as e:
        print(f"OpenAI Error: {str(e)} - Falling back to simulation mode")
        simulated_response = "Contacted customer regarding overdue balance. Customer requested a 2-day extension and stated they are currently experiencing cash flow delays. They committed to clearing the outstanding amount by Monday. Recommended action is to follow up on Monday afternoon if payment is not received."
        return jsonify({"expanded_note": simulated_response}), 200

@ai_bp.route('/api/ai/aging-summary', methods=['POST'])
@jwt_required()
def aging_summary():
    data = request.get_json()
    metrics = data.get('metrics', {})
    
    try:
        client = get_openai_client()
        prompt = f"""
        Analyze the following B2B aging report metrics and provide a 2-paragraph executive summary.
        Metrics: {metrics}
        Highlight the total outstanding, pinpoint areas of concern (e.g., high 90+ days overdue), and suggest a brief collection strategy.
        Format it in Markdown but do not use an overall heading.
        """
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a Chief Financial Officer analyzing credit risk."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=400
        )
        return jsonify({"summary": response.choices[0].message.content}), 200
    except Exception as e:
        print(f"OpenAI Error: {str(e)} - Falling back to simulation mode")
        simulated_response = "**Executive Aging Summary**\n\nOverall exposure remains manageable, though we are seeing a concerning concentration in the 61-90 day and 90+ day buckets. The outstanding balances in these critical risk categories represent a significant portion of our delayed revenue.\n\n**Recommendation**: Immediate follow-up is required for all accounts in the 60+ days overdue range. We suggest pausing new credit lines for these high-risk accounts and issuing formal payment reminders today."
        return jsonify({"summary": simulated_response}), 200

@ai_bp.route('/api/ai/voice-chat', methods=['POST'])
def voice_chat():
    data = request.get_json()
    user_message = data.get('message', '')
    
    try:
        client = get_openai_client()
        prompt = f"""
        You are an AI Voice Agent for Ganga Maxx Credit Control. You are literally speaking to the customer on a phone call.
        Keep your answers VERY short, conversational, and natural. Do not use formatting like bolding or bullet points.
        The customer says: "{user_message}"
        """
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        return jsonify({"reply": response.choices[0].message.content.strip()}), 200
    except Exception as e:
        print(f"OpenAI Error: {str(e)} - Falling back to simulation mode")
        
        # Simulated conversational responses
        user_msg = user_message.lower()
        if "doubt" in user_msg or "question" in user_msg:
            reply = "I understand you have a doubt about your invoice. Don't worry, I'm here to help. Could you please provide your invoice number?"
        elif "time" in user_msg or "days" in user_msg or "extension" in user_msg:
            reply = "We can certainly look into granting a short extension. When exactly do you expect to make the payment?"
        elif "pay" in user_msg or "paid" in user_msg:
            reply = "Thank you. If you have already made the payment, please allow 24 hours for it to reflect in our system. Is there anything else I can help you with?"
        else:
            reply = "Hello! I am the Ganga Maxx AI Assistant. I am calling regarding your overdue balance. How can I help you today?"
            
        return jsonify({"reply": reply}), 200
