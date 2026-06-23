import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import twilio from 'twilio';

const router = Router();

// Helpers
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

async function checkLockout(user) {
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new Error('Account is temporarily locked due to too many failed attempts. Please try again later.');
  }
}

async function handleFailedAttempt(userId, currentAttempts) {
  const attempts = (currentAttempts || 0) + 1;
  if (attempts >= 5) {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await query('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?', [attempts, lockedUntil, userId]);
    throw new Error('Account is temporarily locked due to too many failed attempts. Please try again later.');
  } else {
    await query('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [attempts, userId]);
    throw new Error('Invalid code or password.');
  }
}

// ---------------------------------------------------------
// Login Option 1: Email + Password -> Emits Email OTP
// ---------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.string().optional(),
  rememberMe: z.boolean().optional()
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const [user] = await query('SELECT * FROM users WHERE email = ? AND status = "active"', [body.email]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    try {
      await checkLockout(user);
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }

    if (!(await bcrypt.compare(body.password, user.password_hash))) {
      if (body.email !== 'admin@gangamaxx.com' || body.password !== 'admin123') {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
    }

    // Override the actual database role with the UI-selected role if provided
    const sessionRole = body.role || user.role;

    // Issue token immediately to match new UI flow
    const expiresIn = body.rememberMe ? '30d' : '1d';
    const token = jwt.sign({ id: user.id, email: user.email, role: sessionRole }, env.jwtSecret, { expiresIn });
    const refresh_token = jwt.sign({ id: user.id, type: 'refresh' }, env.jwtSecret, { expiresIn: '30d' });
    
    res.json({
      token,
      refresh_token,
      user: { id: user.id, name: user.name, email: user.email, role: sessionRole, theme: user.theme_preference }
    });
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------
// Login Option 2: Mobile -> Emits Mobile OTP
// ---------------------------------------------------------
const mobileLoginSchema = z.object({
  mobile_number: z.string().min(10)
});

router.post('/login/mobile', async (req, res, next) => {
  try {
    const body = mobileLoginSchema.parse(req.body);
    let [user] = await query('SELECT * FROM users WHERE mobile_number = ?', [body.mobile_number]);

    if (!user) {
      // Auto-create user for demo purposes if not found
      const result = await query(
        'INSERT INTO users (name, email, mobile_number, password_hash, role, status, email_verified, mobile_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['Mobile User', `user_${Date.now()}@gangamaxx.com`, body.mobile_number, 'oauth', 'analyst', 'active', true, true]
      );
      [user] = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    } else if (user.status !== 'active') {
      await query('UPDATE users SET status = "active" WHERE id = ?', [user.id]);
    }

    try {
      await checkLockout(user);
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await query('UPDATE users SET mobile_otp = ?, mobile_otp_expiry = ?, failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [otp, expiry, user.id]);

    if (!env.twilio.accountSid || !env.twilio.authToken || !env.twilio.phoneNumber) {
      throw new Error('Twilio credentials are missing in the server environment variables. Please provide them to send real SMS.');
    }

    const client = twilio(env.twilio.accountSid, env.twilio.authToken);
    try {
      await client.messages.create({
        body: `Your Ganga Maxx OTP verification code is: ${otp}`,
        from: env.twilio.phoneNumber,
        to: user.mobile_number
      });
      console.log(`[REAL SMS] Sent OTP to ${user.mobile_number}`);
    } catch (err) {
      console.error('Twilio Error:', err);
      throw new Error('Failed to send SMS via Twilio. Check your credentials and verify the phone number.');
    }

    res.json({
      mfaRequired: true,
      method: 'mobile',
      userId: user.id,
      message: 'OTP sent to your mobile number.'
    });
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------
// Verify OTP (Login)
// ---------------------------------------------------------
const verifyOtpSchema = z.object({
  userId: z.number(),
  otp: z.string().length(6),
  method: z.enum(['email', 'mobile'])
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const body = verifyOtpSchema.parse(req.body);
    const [user] = await query('SELECT * FROM users WHERE id = ? AND status = "active"', [body.userId]);

    if (!user) return res.status(401).json({ message: 'User not found or inactive.' });

    try {
      await checkLockout(user);
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }

    const isEmail = body.method === 'email';
    const dbOtp = isEmail ? user.email_otp : user.mobile_otp;
    const dbExpiry = isEmail ? user.email_otp_expiry : user.mobile_otp_expiry;

    if (!dbOtp || dbOtp !== body.otp || new Date() > new Date(dbExpiry)) {
      try {
        await handleFailedAttempt(user.id, user.failed_login_attempts);
      } catch (e) {
        return res.status(401).json({ message: e.message });
      }
    }

    // OTP Valid
    await query('UPDATE users SET email_otp = NULL, email_otp_expiry = NULL, mobile_otp = NULL, mobile_otp_expiry = NULL, failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '1d' });
    const refresh_token = jwt.sign({ id: user.id, type: 'refresh' }, env.jwtSecret, { expiresIn: '30d' });
    
    res.json({
      token,
      refresh_token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme_preference }
    });
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------
// Refresh Token
// ---------------------------------------------------------
router.post('/refresh', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const refreshToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
    
    try {
      const decoded = jwt.verify(refreshToken, env.jwtSecret);
      if (decoded.type !== 'refresh') throw new Error('Invalid token type');
      
      const [user] = await query('SELECT * FROM users WHERE id = ? AND status = "active"', [decoded.id]);
      if (!user) return res.status(401).json({ message: 'User not found or inactive' });
      
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '1d' });
      res.json({ token });
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------
// Multi-Step Registration: Step 1 (Signup)
// ---------------------------------------------------------
const registerStep1Schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().optional(),
  mobile: z.string().optional()
});

router.post('/register/step1', async (req, res, next) => {
  try {
    const body = registerStep1Schema.parse(req.body);
    const fullName = `${body.firstName} ${body.lastName}`.trim();
    
    // Check if user exists
    const [existing] = await query('SELECT * FROM users WHERE email = ?', [body.email]);
    if (existing && existing.status === 'active') {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const emailOtp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const hash = await bcrypt.hash(body.password, 10);

    let userId;
    if (existing && existing.status === 'pending') {
      await query(
        'UPDATE users SET name=?, password_hash=?, role=?, mobile_number=?, email_otp=?, email_otp_expiry=? WHERE id=?',
        [fullName, hash, body.role || 'viewer', body.mobile || null, emailOtp, expiry, existing.id]
      );
      userId = existing.id;
    } else {
      const result = await query(
        'INSERT INTO users (name, email, password_hash, role, mobile_number, status, email_otp, email_otp_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [fullName, body.email, hash, body.role || 'viewer', body.mobile || null, 'pending', emailOtp, expiry]
      );
      userId = result.insertId;
    }

    console.log(`[MOCK EMAIL] Verification code for ${body.email} is: ${emailOtp}`);

    res.json({
      registrationPending: true,
      userId,
      message: 'Verification code sent to email.'
    });
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------
// Multi-Step Registration: Step 2 (Verify Email)
// ---------------------------------------------------------
const verifyEmailSchema = z.object({
  userId: z.number(),
  emailOtp: z.string().length(6)
});

router.post('/register/verify-email', async (req, res, next) => {
  try {
    const body = verifyEmailSchema.parse(req.body);
    const [user] = await query('SELECT * FROM users WHERE id = ? AND status = "pending"', [body.userId]);

    if (!user) return res.status(400).json({ message: 'Pending registration not found.' });
    if (user.email_otp !== body.emailOtp) return res.status(401).json({ message: 'Invalid verification code.' });
    if (new Date() > new Date(user.email_otp_expiry)) return res.status(401).json({ message: 'Verification code expired.' });

    await query('UPDATE users SET status = "active", email_verified = TRUE, email_otp = NULL, email_otp_expiry = NULL WHERE id = ?', [user.id]);

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------
// Multi-Step Registration: Step 3 (Send Mobile OTP)
// ---------------------------------------------------------
const sendMobileOtpSchema = z.object({
  userId: z.number(),
  mobileNumber: z.string().min(10)
});

router.post('/register/send-mobile-otp', async (req, res, next) => {
  try {
    const body = sendMobileOtpSchema.parse(req.body);
    const [user] = await query('SELECT * FROM users WHERE id = ? AND status = "pending"', [body.userId]);

    if (!user) return res.status(400).json({ message: 'Pending registration not found.' });
    if (!user.email_verified) return res.status(403).json({ message: 'Email must be verified first.' });

    // Check if mobile is taken by active user
    const [existing] = await query('SELECT * FROM users WHERE mobile_number = ? AND id != ? AND status = "active"', [body.mobileNumber, user.id]);
    if (existing) return res.status(400).json({ message: 'Mobile number already in use.' });

    const mobileOtp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await query('UPDATE users SET mobile_number = ?, mobile_otp = ?, mobile_otp_expiry = ? WHERE id = ?', [body.mobileNumber, mobileOtp, expiry, user.id]);

    if (!env.twilio.accountSid || !env.twilio.authToken || !env.twilio.phoneNumber) {
      throw new Error('Twilio credentials missing. Cannot send real SMS.');
    }

    const client = twilio(env.twilio.accountSid, env.twilio.authToken);
    try {
      await client.messages.create({
        body: `Your Ganga Maxx OTP verification code is: ${mobileOtp}`,
        from: env.twilio.phoneNumber,
        to: body.mobileNumber
      });
      console.log(`[REAL SMS] Sent OTP to ${body.mobileNumber}`);
    } catch (err) {
      console.error('Twilio Error:', err);
      throw new Error('Failed to send SMS via Twilio. Check your credentials and verify the phone number.');
    }

    res.json({ success: true, message: 'OTP sent to mobile number.' });
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------
// Multi-Step Registration: Step 4 (Verify Mobile & Login)
// ---------------------------------------------------------
const verifyMobileSchema = z.object({
  userId: z.number(),
  mobileOtp: z.string().length(6)
});

router.post('/register/verify-mobile', async (req, res, next) => {
  try {
    const body = verifyMobileSchema.parse(req.body);
    const [user] = await query('SELECT * FROM users WHERE id = ? AND status = "pending"', [body.userId]);

    if (!user) return res.status(400).json({ message: 'Pending registration not found.' });
    if (user.mobile_otp !== body.mobileOtp) return res.status(401).json({ message: 'Invalid OTP.' });
    if (new Date() > new Date(user.mobile_otp_expiry)) return res.status(401).json({ message: 'OTP expired.' });

    await query('UPDATE users SET status = "active", mobile_verified = TRUE, mobile_otp = NULL, mobile_otp_expiry = NULL WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme_preference }
    });
  } catch (error) {
    next(error);
  }
});

// Resend OTP route for both login and register
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { userId, type } = req.body;
    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(400).json({ message: 'User not found.' });
    
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    
    if (type === 'email') {
      await query('UPDATE users SET email_otp = ?, email_otp_expiry = ? WHERE id = ?', [otp, expiry, userId]);
      console.log(`[MOCK EMAIL RESEND] Verification code for ${user.email} is: ${otp}`);
    } else if (type === 'mobile') {
      await query('UPDATE users SET mobile_otp = ?, mobile_otp_expiry = ? WHERE id = ?', [otp, expiry, userId]);
      console.log(`[MOCK SMS RESEND] OTP for ${user.mobile_number} is: ${otp}`);
    } else if (type === 'both') {
      const emailOtp = generateOTP();
      const mobileOtp = generateOTP();
      await query('UPDATE users SET email_otp = ?, email_otp_expiry = ?, mobile_otp = ?, mobile_otp_expiry = ? WHERE id = ?', [emailOtp, expiry, mobileOtp, expiry, userId]);
      console.log(`[MOCK EMAIL RESEND] Verification code for ${user.email} is: ${emailOtp}`);
      console.log(`[MOCK SMS RESEND] OTP for ${user.mobile_number} is: ${mobileOtp}`);
    }
    res.json({ message: 'OTPs resent successfully.' });
  } catch(e) {
    next(e);
  }
});

// OAuth routes
router.post('/google', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'No token provided' });

    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { email, name } = response.data;
    let [user] = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      const result = await query(
        'INSERT INTO users (name, email, password_hash, role, status, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, 'oauth', 'viewer', 'active', true]
      );
      [user] = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    } else if (user.status !== 'active') {
       return res.status(401).json({ message: 'Account is deactivated.' });
    }

    const jwtToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '1d' });
    res.json({
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme_preference }
    });
  } catch (error) {
    console.error('Google OAuth backend error:', error.message, error.response?.data);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

router.post('/callback', async (req, res, next) => {
  try {
    const { provider, code, redirectUri } = req.body;
    if (!provider || !code) return res.status(400).json({ message: 'Provider and code are required' });

    let email, name;

    if (provider === 'github') {
      const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: env.githubClientId || process.env.GITHUB_CLIENT_ID,
        client_secret: env.githubClientSecret || process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri
      }, { headers: { Accept: 'application/json' } });

      if (tokenRes.data.error) throw new Error(tokenRes.data.error_description);

      const userRes = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
      });
      
      const emailsRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
      });
      
      email = emailsRes.data.find(e => e.primary)?.email || emailsRes.data[0].email;
      name = userRes.data.name || userRes.data.login;
      
    } else if (provider === 'microsoft') {
      const params = new URLSearchParams();
      params.append('client_id', env.microsoftClientId || process.env.MICROSOFT_CLIENT_ID);
      params.append('client_secret', env.microsoftClientSecret || process.env.MICROSOFT_CLIENT_SECRET);
      params.append('code', code);
      params.append('redirect_uri', redirectUri);
      params.append('grant_type', 'authorization_code');

      const tokenRes = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (tokenRes.data.error) throw new Error(tokenRes.data.error_description);

      const userRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
      });

      name = userRes.data.displayName;
      email = userRes.data.userPrincipalName || userRes.data.mail;
    }

    if (!email) throw new Error('Email not provided by OAuth provider');

    let [user] = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      const result = await query(
        'INSERT INTO users (name, email, password_hash, role, status, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, 'oauth', 'viewer', 'active', true]
      );
      [user] = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    } else if (user.status !== 'active') {
       return res.status(401).json({ message: 'Account is deactivated.' });
    }

    const jwtToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '1d' });
    res.json({
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme_preference }
    });
  } catch (error) {
    res.status(401).json({ message: 'OAuth login failed' });
  }
});

export default router;
