import cron from 'node-cron';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';
import { query } from '../config/db.js';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[Scheduler] OPENAI_API_KEY is not set. Cannot run AI reminder.');
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function runDailyAIReminder() {
  console.log('[Scheduler] Starting Daily AI Reminder Job...');
  
  try {
    // Query overdue invoices with their customers
    const overdueInvoices = await query(`
      SELECT c.company_name, i.invoice_no, (i.total_amount - i.paid_amount) AS balance, DATEDIFF(CURDATE(), i.due_date) AS days_overdue
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.due_date < CURDATE() AND i.status != 'paid' AND i.status != 'cancelled'
    `);

    if (overdueInvoices.length === 0) {
      console.log('[Scheduler] No overdue invoices found. Skipping email.');
      return { success: true, message: 'No overdue invoices found. No email sent.' };
    }

    const client = getOpenAIClient();
    let emailHtml = '';

    if (!client) {
      // Fallback if no OpenAI key
      emailHtml = `<h2>Daily Overdue Report</h2><p>Found ${overdueInvoices.length} overdue invoices.</p>`;
      overdueInvoices.forEach(inv => {
        emailHtml += `<p><strong>${inv.company_name}</strong>: Invoice ${inv.invoice_no} is ${inv.days_overdue} days overdue (Balance: ₹${inv.balance})</p>`;
      });
    } else {
      // Use AI to generate a summarized report
      const prompt = `
        You are an AI assistant for Ganga Maxx Credit Control.
        Below is a JSON list of overdue invoices.
        Generate a professional, structured daily summary email for the finance administrator.
        Include a brief executive summary at the top highlighting the total number of overdue accounts.
        Then, list out each company with their overdue details. 
        Format the output in clean HTML that can be directly sent via email. Do not use markdown wrappers like \`\`\`html.
        
        Overdue Invoices:
        ${JSON.stringify(overdueInvoices)}
      `;

      try {
        console.log('[Scheduler] Calling OpenAI to generate email summary...');
        const response = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 1000
        });

        emailHtml = response.choices[0].message.content.trim();
        if (emailHtml.startsWith('```html')) {
          emailHtml = emailHtml.replace(/```html\\n?/, '').replace(/\\n?```/, '');
        }
      } catch (aiError) {
        console.error('[Scheduler] OpenAI Error:', aiError.message, '- Using fallback template');
        emailHtml = `<h2>Daily Overdue Report (Fallback)</h2><p>Found ${overdueInvoices.length} overdue invoices.</p>`;
        overdueInvoices.forEach(inv => {
          emailHtml += `<p><strong>${inv.company_name}</strong>: Invoice ${inv.invoice_no} is ${inv.days_overdue} days overdue (Balance: ₹${inv.balance})</p>`;
        });
      }
    }

    const targetEmail = process.env.SMTP_USER || 'manikantareddemoni@gmail.com';
    
    // Check if real SMTP credentials are provided
    if (!process.env.SMTP_USER || process.env.SMTP_PASS === 'your_gmail_app_password_here' || !process.env.SMTP_PASS) {
      console.warn('[Scheduler] Real SMTP credentials missing. Simulating email send.');
      console.log('--- SIMULATED EMAIL CONTENT ---');
      console.log(`To: ${targetEmail}`);
      console.log(`Subject: Ganga Maxx Daily AI Reminders & Overdue Report`);
      console.log(emailHtml);
      console.log('-------------------------------');
      return { success: true, message: 'Generated AI summary (simulated email due to missing SMTP).' };
    } else {
      console.log(`[Scheduler] Sending real email to ${targetEmail}...`);
      await transporter.sendMail({
        from: `"Ganga Maxx AI System" <${process.env.SMTP_USER}>`,
        to: targetEmail,
        subject: `Ganga Maxx Daily AI Reminders & Overdue Report - ${new Date().toLocaleDateString()}`,
        html: emailHtml
      });
      console.log('[Scheduler] Email sent successfully.');
      return { success: true, message: 'AI Reminder email sent successfully.' };
    }
  } catch (err) {
    console.error('[Scheduler] Error running daily AI reminder:', err);
    return { success: false, error: err.message };
  }
}

export function initScheduler() {
  console.log('[Scheduler] Initializing node-cron jobs...');
  // Run every day at 09:00 AM
  cron.schedule('0 9 * * *', () => {
    runDailyAIReminder();
  });
}
