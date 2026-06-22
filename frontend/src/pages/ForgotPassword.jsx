import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ArrowLeft, Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { forgotPassword, verifyForgotPasswordOtp, resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      addToast('Verification code sent if account exists.', 'success');
      setStep(2);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyForgotPasswordOtp(email, otp);
      addToast('Code verified', 'success');
      setStep(3);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      addToast('Password reset successful', 'success');
      setStep(4);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100">
            <span className="text-2xl font-bold text-[#0F172A]">G</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[420px]">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/40 sm:rounded-2xl sm:px-10 border border-slate-100 relative overflow-hidden">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <motion.div 
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: EMAIL */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Forgot Password</h2>
                  <p className="text-sm text-slate-500 mt-2">Enter your email to receive a reset code</p>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        required 
                        type="email" 
                        placeholder="name@company.com" 
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        autoFocus
                      />
                    </div>
                  </div>
                  <button 
                    disabled={loading || !email} 
                    type="submit" 
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 absolute top-6 left-6">
                  <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-6 pt-4">
                  <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <KeyRound size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Enter Reset Code</h2>
                  <p className="text-sm text-slate-500 mt-2">We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span></p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <input 
                      required 
                      type="text" 
                      maxLength={6} 
                      placeholder="000000"
                      className="w-full h-12 text-center rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono tracking-[0.75em] text-2xl font-bold text-slate-900" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                      autoFocus 
                    />
                  </div>
                  <button 
                    disabled={loading || otp.length < 6} 
                    type="submit" 
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-6">
                  <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Lock size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Set New Password</h2>
                  <p className="text-sm text-slate-500 mt-2">Choose a strong, secure password</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                    <input 
                      required 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                    <input 
                      required 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                    />
                  </div>
                  <button 
                    disabled={loading || !newPassword || !confirmPassword} 
                    type="submit" 
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-6"
              >
                <div className="mx-auto w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">All Done!</h2>
                <p className="text-sm text-slate-500 mt-2 mb-8">Your password has been reset successfully. You can now log in with your new password.</p>
                <Link 
                  to="/login"
                  className="w-full flex items-center justify-center h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
                >
                  Return to Login
                </Link>
              </motion.div>
            )}

          </AnimatePresence>

          {step === 1 && (
            <div className="mt-8 text-center text-sm text-slate-600">
              Remember your password? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Sign in</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
