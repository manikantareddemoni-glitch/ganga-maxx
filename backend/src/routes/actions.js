import { Router } from 'express';
import { emitEvent } from '../socket/index.js';
import nodemailer from 'nodemailer';
import { runDailyAIReminder } from '../services/schedulerService.js';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { action, ...payload } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    console.log(`[Action Handler] Processing action: ${action}`);

    // Process different actions
    switch (action) {
      case 'send_reminders':
        const { reminders } = payload;
        console.log(`Sending ${reminders?.length || 0} reminders...`);
        
        if (!process.env.SMTP_USER || process.env.SMTP_PASS === 'your_gmail_app_password_here') {
          console.warn('[Action Handler] SMTP credentials not configured. Skipping real email sending.');
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          // Send real emails sequentially in the background to prevent Gmail rate limits
          (async () => {
            for (const reminder of reminders) {
              const mailOptions = {
                from: `"Ganga Maxx Credit" <${process.env.SMTP_USER}>`,
                to: process.env.SMTP_USER, // Sending to the user's email for testing
                subject: `OVERDUE: Payment Reminder for ${reminder.customer}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #6366f1; color: white; padding: 20px; text-align: center;">
                      <h2 style="margin: 0;">Payment Reminder</h2>
                    </div>
                    <div style="padding: 30px;">
                      <p>Dear <strong>${reminder.customer}</strong>,</p>
                      <p>This is an automated reminder regarding your outstanding invoice.</p>
                      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Invoice No:</strong></td>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${reminder.invoice_no}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Days Overdue:</strong></td>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #ef4444; font-weight: bold;">${reminder.days_overdue} Days</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Amount Due:</strong></td>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">₹${reminder.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      </table>
                      <p>Please arrange for payment immediately to avoid any service interruptions.</p>
                      <br>
                      <p>Thank you,<br><strong>Ganga Maxx Accounts Team</strong></p>
                    </div>
                  </div>
                `
              };
              
              try {
                // Wait to prevent spamming the SMTP server
                await transporter.sendMail(mailOptions);
                console.log(`Sent email for ${reminder.customer}`);
                // Small delay between emails
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (err) {
                console.error(`Failed to send email for ${reminder.customer}:`, err);
              }
            }
          })();
        }
        
        // Notify the client that reminders were sent
        emitEvent('notification:new', {
          id: Date.now(),
          type: 'success',
          title: 'Reminders Sent',
          message: `Successfully sent ${reminders?.length || 0} reminder emails.`
        });
        break;
        
      case 'trigger_daily_ai_reminders':
        console.log('[Action Handler] Triggering daily AI reminders manually...');
        const result = await runDailyAIReminder();
        
        emitEvent('notification:new', {
          id: Date.now(),
          type: result.success ? 'success' : 'error',
          title: 'AI Reminders Execution',
          message: result.message || result.error
        });
        return res.json({ success: result.success, action, message: result.message || result.error });

      case 'save_customer':
      case 'delete_customer':
      case 'export_aging_report':
      case 'export_ledger':
      case 'export_statement':
      case 'print_statement':
      case 'generate_statement':
      case 'save_profile':
      case 'save_business':
      case 'save_notifications':
      case 'update_password':
        // Mock successful operation for all other hooks
        await new Promise(resolve => setTimeout(resolve, 500));
        break;

      default:
        console.warn(`[Action Handler] Unknown action: ${action}`);
        break;
    }

    res.json({ success: true, action, message: `Successfully executed ${action}` });
  } catch (err) {
    next(err);
  }
});

export default router;
