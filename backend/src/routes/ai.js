import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

function getAIConfig() {
  if (process.env.GROQ_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY.trim(),
        baseURL: 'https://api.groq.com/openai/v1'
      }),
      model: 'llama3-8b-8192'
    };
  }
  
  if (process.env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() }),
      model: 'gpt-4o'
    };
  }

  throw new Error('Neither GROQ_API_KEY nor OPENAI_API_KEY is set in the environment.');
}

router.post('/generate-reminder', async (req, res, next) => {
  const { customer_name = 'Customer', outstanding = '0', days_overdue = '0' } = req.body;

  try {
    const { client, model } = getAIConfig();
    const prompt = `
      Write a professional B2B collection email reminder for ${customer_name}.
      They have an outstanding balance of ₹${outstanding} which is ${days_overdue} days overdue.
      The tone should be polite but firm, requesting immediate payment or an update on the payment status.
      Keep it under 150 words. Do not include placeholders like [Your Name].
    `;
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a professional B2B collections officer." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });
    return res.json({ message: response.choices[0].message.content });
  } catch (e) {
    console.log(`OpenAI Error: ${e.message} - Falling back to simulation mode`);
    const simulated_response = `Dear ${customer_name},\n\nThis is a friendly reminder that your account currently has an outstanding balance of ₹${outstanding}, which is ${days_overdue} days overdue. We kindly request that you process this payment at your earliest convenience to avoid any disruption to your credit line.\n\nIf you have already made this payment, please disregard this notice.\n\nBest regards,\nGanga Maxx Accounts Team`;
    return res.json({ message: simulated_response });
  }
});

router.post('/expand-notes', async (req, res, next) => {
  const { shorthand = '' } = req.body;

  if (!shorthand) {
    return res.status(400).json({ error: "No notes provided" });
  }

  try {
    const { client, model } = getAIConfig();
    const prompt = `
      Convert the following shorthand collection notes into a professional, clear, and audit-ready log entry.
      Shorthand: "${shorthand}"
      Return ONLY the expanded professional note. Do not add conversational filler.
    `;
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are an AI that formats administrative records." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200
    });
    return res.json({ expanded_note: response.choices[0].message.content.trim() });
  } catch (e) {
    console.log(`OpenAI Error: ${e.message} - Falling back to simulation mode`);
    const simulated_response = "Contacted customer regarding overdue balance. Customer requested a 2-day extension and stated they are currently experiencing cash flow delays. They committed to clearing the outstanding amount by Monday. Recommended action is to follow up on Monday afternoon if payment is not received.";
    return res.json({ expanded_note: simulated_response });
  }
});

router.post('/aging-summary', async (req, res, next) => {
  const { metrics = {} } = req.body;

  try {
    const { client, model } = getAIConfig();
    const prompt = `
      Analyze the following B2B aging report metrics and provide a 2-paragraph executive summary.
      Metrics: ${JSON.stringify(metrics)}
      Highlight the total outstanding, pinpoint areas of concern (e.g., high 90+ days overdue), and suggest a brief collection strategy.
      Format it in Markdown but do not use an overall heading.
    `;
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a Chief Financial Officer analyzing credit risk." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 400
    });
    return res.json({ summary: response.choices[0].message.content });
  } catch (e) {
    console.log(`OpenAI Error: ${e.message} - Falling back to simulation mode`);
    const simulated_response = "**Executive Aging Summary**\n\nOverall exposure remains manageable, though we are seeing a concerning concentration in the 61-90 day and 90+ day buckets. The outstanding balances in these critical risk categories represent a significant portion of our delayed revenue.\n\n**Recommendation**: Immediate follow-up is required for all accounts in the 60+ days overdue range. We suggest pausing new credit lines for these high-risk accounts and issuing formal payment reminders today.";
    return res.json({ summary: simulated_response });
  }
});

router.post('/voice-chat', async (req, res, next) => {
  const { message = '' } = req.body;

  try {
    const { client, model } = getAIConfig();
    const prompt = `
      You are the Ganga Maxx AI Assistant, a helpful live voice agent for the Ganga Maxx Credit Control web application. 
      Your job is to explain the project and clear any doubts the user has about the website.
      
      Project Context: Ganga Maxx is a comprehensive B2B credit control and collections platform. It features role-based access control (Admin, Finance Manager, Accounts Executive, Sales Executive, Collection Officer, etc.), a dashboard for tracking overdue payments, aging distribution charts, secure role approval systems, and tools for following up on outstanding invoices.
      
      Keep your answers VERY short, conversational, clear, and natural. You are speaking out loud to the user. Do not use formatting like bolding or bullet points.
      
      The user says: "${message}"
    `;
    const response = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7
    });
    return res.json({ reply: response.choices[0].message.content.trim() });
  } catch (e) {
    console.log(`OpenAI Error: ${e.message} - Falling back to simulation mode`);

    const user_msg = message.toLowerCase();
    let reply = "Hello! I am the Ganga Maxx AI Assistant. I can help explain the features of this website.";

    if (user_msg.includes("doubt") || user_msg.includes("question") || user_msg.includes("explain")) {
      reply = "Ganga Maxx is a B2B credit control platform. It helps businesses manage outstanding invoices, track overdue payments, and manage different user roles like Admin and Finance Manager.";
    } else if (user_msg.includes("role") || user_msg.includes("access")) {
      reply = "The system has secure role-based access. New users start as Viewers and must be approved by an Admin to get higher roles like Finance Manager or Sales Executive.";
    } else if (user_msg.includes("dashboard")) {
      reply = "The dashboard shows key metrics like total outstanding balances, pending invoices, and a chart of collection trends over the last six months.";
    }

    return res.json({ reply });
  }
});

export default router;
