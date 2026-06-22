import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [view, setView] = useState('step1'); // step1, verify-email, mobile-entry, verify-mobile
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { loginWithToken, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    termsAccepted: false,
    emailOtp: '',
    mobileNumber: '',
    mobileOtp: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ valid: false, message: '' });

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await loginWithGoogle(tokenResponse.access_token);
        addToast('Successfully signed up with Google!', 'success');
        navigate('/');
      } catch (err) {
        addToast('Google signup failed', 'error');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      addToast('Google Signup Failed', 'error');
    }
  });

  const validatePassword = (pass) => {
    if (pass.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    return { valid: true, message: 'Success!' };
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });
    setPasswordStrength(validatePassword(val));
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      addToast('Please accept the Terms of Service', 'error');
      return;
    }
    if (!passwordStrength.valid) {
      addToast(passwordStrength.message, 'error');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/step1', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      setUserId(data.userId);
      setView('verify-email');
      addToast(data.message, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (formData.emailOtp.length < 6) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/verify-email', {
        userId,
        emailOtp: formData.emailOtp
      });
      addToast(data.message, 'success');
      setView('mobile-entry');
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMobileOtp = async (e) => {
    e.preventDefault();
    if (formData.mobileNumber.length < 10) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/send-mobile-otp', {
        userId,
        mobileNumber: formData.mobileNumber
      });
      addToast(data.message, 'success');
      setView('verify-mobile');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMobile = async (e) => {
    e.preventDefault();
    if (formData.mobileOtp.length < 6) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/verify-mobile', {
        userId,
        mobileOtp: formData.mobileOtp
      });
      addToast('Registration complete!', 'success');
      loginWithToken(data.token, data.user);
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Red Envelope SVG
  const EnvelopeIcon = () => (
    <svg viewBox="0 0 200 150" className="w-48 h-auto mb-6 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 40 L100 90 L190 40 L190 130 C190 135 185 140 180 140 L20 140 C15 140 10 135 10 130 Z" fill="#F43F5E"/>
      <path d="M10 40 L100 90 L190 40 L180 30 L20 30 Z" fill="#E11D48"/>
      <path d="M25 20 L175 20 L160 80 L40 80 Z" fill="#FFFFFF" className="transform -rotate-12 translate-x-4 -translate-y-4" />
      <path d="M80 40 L80 60 L100 60" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-12 translate-x-4 -translate-y-4" />
      <path d="M10 40 L100 90 L190 40" stroke="#9F1239" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 130 L80 90" stroke="#9F1239" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M190 130 L120 90" stroke="#9F1239" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#02142D] flex items-center justify-center p-4 font-sans">
      <AnimatePresence mode="wait">
        {/* STEP 1: SIGNUP FORM */}
        {view === 'step1' && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-[440px] bg-white rounded-xl p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-bold text-[#121C2D] tracking-tight">Create your account</h1>
              <p className="text-slate-500 mt-2 text-[15px]">Start managing your enterprise credit easily.</p>
            </div>

            <form onSubmit={handleStep1} className="space-y-4">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-blue-600">First name</label>
                <input required type="text" className="w-full h-12 px-4 rounded border-2 border-blue-600 focus:outline-none text-[#121C2D]" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} autoFocus />
              </div>

              <div className="relative">
                <input required type="text" placeholder="Last name" className="w-full h-12 px-4 rounded border border-slate-300 focus:border-blue-600 focus:outline-none text-[#121C2D]" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>

              <div className="relative">
                <input required type="email" placeholder="Email address*" className="w-full h-12 px-4 rounded border border-slate-300 focus:border-blue-600 focus:outline-none text-[#121C2D]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="relative">
                <input required type={showPassword ? "text" : "password"} placeholder="Password*" className="w-full h-12 px-4 rounded border border-slate-300 focus:border-blue-600 focus:outline-none text-[#121C2D]" value={formData.password} onChange={handlePasswordChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {formData.password.length > 0 && (
                <div className={`flex items-center gap-2 p-3 rounded text-sm ${passwordStrength.valid ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-600'}`}>
                  {passwordStrength.valid && <CheckCircle2 size={18} className="text-green-600" />}
                  {passwordStrength.message}
                </div>
              )}

              <div className="flex items-start gap-3 mt-4">
                <input required type="checkbox" id="terms" className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={formData.termsAccepted} onChange={e => setFormData({...formData, termsAccepted: e.target.checked})} />
                <label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                  By clicking Continue, you agree to the <a href="#" className="text-blue-600 hover:underline">Twilio Terms of Service</a> and the <a href="#" className="text-blue-600 hover:underline">Twilio Privacy Notice</a>. If you are in the EEA or UK, you have read and agree to the <a href="#" className="text-blue-600 hover:underline">Electronic Communications Code Disclosures</a>, if applicable.
                </label>
              </div>

              <button disabled={loading} type="submit" className="w-full h-12 mt-6 bg-[#0263E0] hover:bg-[#0252BA] text-white rounded font-medium transition-colors">
                {loading ? 'Creating account...' : 'Continue'}
              </button>
            </form>

            <div className="mt-8 text-center text-[14px] text-slate-600">
              Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors ml-1">Log in here</Link>
            </div>

            <div className="mt-8 flex items-center justify-center relative">
              <div className="border-t border-slate-200 w-full absolute top-1/2 left-0"></div>
              <span className="bg-white px-4 text-[13px] font-medium text-slate-400 relative z-10">or continue with</span>
            </div>

            <button type="button" onClick={() => triggerGoogleLogin()} className="w-full h-12 mt-6 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 active:bg-slate-100 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign up with Google
            </button>
          </motion.div>
        )}

        {/* STEP 2: VERIFY EMAIL */}
        {view === 'verify-email' && (
          <motion.div key="verify-email" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-3xl bg-white rounded-xl p-12 shadow-2xl flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 flex justify-center">
              <EnvelopeIcon />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#121C2D] mb-4">Let's get your email verified</h1>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                To keep your account secure we need to verify your email address. Enter the code we have sent to <strong>{formData.email}</strong> below.
              </p>
              <a href="#" className="text-blue-600 hover:underline text-sm mb-8 inline-block">Need support? ↗</a>

              <form onSubmit={handleVerifyEmail}>
                <label className="block text-sm font-medium text-[#121C2D] mb-2">Code</label>
                <input 
                  required 
                  type="text" 
                  maxLength={6} 
                  className="w-full max-w-[200px] h-12 px-4 rounded-lg border-2 border-blue-500 focus:outline-none text-[#121C2D] font-mono tracking-widest text-lg" 
                  value={formData.emailOtp} 
                  onChange={e => setFormData({...formData, emailOtp: e.target.value.toUpperCase()})} 
                  autoFocus 
                />
                
                <div className="flex items-center gap-6 mt-6">
                  <button disabled={loading || formData.emailOtp.length < 6} type="submit" className="px-6 h-10 bg-[#0263E0] hover:bg-[#0252BA] text-white rounded font-medium transition-colors disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                  <span className="text-slate-400 text-sm font-medium">Resend code in 4</span>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP 3: MOBILE NUMBER ENTRY */}
        {view === 'mobile-entry' && (
          <motion.div key="mobile-entry" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-[#121C2D]">Verify your phone number</h1>
              <p className="text-slate-500 mt-3 text-sm">We'll send an SMS with a verification code to confirm your identity.</p>
            </div>

            <form onSubmit={handleSendMobileOtp} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-[#121C2D] mb-2">Mobile Number (with country code)</label>
                <input required type="text" placeholder="+1234567890" className="w-full h-12 px-4 rounded border border-slate-300 focus:border-blue-600 focus:outline-none text-[#121C2D]" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} autoFocus />
              </div>

              <button disabled={loading || formData.mobileNumber.length < 10} type="submit" className="w-full h-12 mt-6 bg-[#0263E0] hover:bg-[#0252BA] text-white rounded font-medium transition-colors disabled:opacity-50">
                {loading ? 'Sending SMS...' : 'Send verification code'}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 4: VERIFY MOBILE */}
        {view === 'verify-mobile' && (
          <motion.div key="verify-mobile" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-[#121C2D]">Enter your verification code</h1>
              <p className="text-slate-500 mt-3 text-sm">Enter the code sent via SMS to {formData.mobileNumber}</p>
            </div>

            <form onSubmit={handleVerifyMobile} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-[#121C2D] mb-2">Code</label>
                <input 
                  required 
                  type="text" 
                  maxLength={6} 
                  className="w-full h-12 px-4 rounded border-2 border-blue-500 focus:outline-none text-[#121C2D] font-mono tracking-widest text-lg" 
                  value={formData.mobileOtp} 
                  onChange={e => setFormData({...formData, mobileOtp: e.target.value.toUpperCase()})} 
                  autoFocus 
                />
              </div>

              <button disabled={loading || formData.mobileOtp.length < 6} type="submit" className="w-full h-12 mt-6 bg-[#0263E0] hover:bg-[#0252BA] text-white rounded font-medium transition-colors disabled:opacity-50">
                {loading ? 'Verifying...' : 'Complete Signup'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
