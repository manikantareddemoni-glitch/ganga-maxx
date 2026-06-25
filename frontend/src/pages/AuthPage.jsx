import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Eye, EyeOff, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { api } from '../lib/api';

export default function AuthPage() {
  const [currentMode, setCurrentMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regRole, setRegRole] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState(null);
  
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/login') {
      setCurrentMode('login');
    } else {
      setCurrentMode('register');
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (currentMode === 'verify') {
      try {
        await api.post('/auth/register/verify-email', {
          userId: registeredUserId,
          emailOtp: otp
        });
        addToast('Verification successful! You can now log in.', 'success');
        setCurrentMode('login');
        setPassword('');
        setOtp('');
      } catch (err) {
        addToast(err.response?.data?.message || 'Verification failed', 'error');
      } finally {
        setLoading(false);
      }
    } else if (currentMode === 'login') {
      try {
        await login(email, password, rememberMe);
        addToast('Login successful', 'success');
        navigate('/');
      } catch (err) {
        addToast(err.message || 'Authentication failed', 'error');
      } finally {
        setLoading(false);
      }
    } else if (currentMode === 'register') {
      try {
        const [firstName, ...lastNameParts] = regName.split(' ');
        const lastName = lastNameParts.join(' ') || ' ';
        
        const res = await api.post('/auth/register/step1', {
          firstName: firstName || 'User',
          lastName: lastName,
          email: email,
          password: password,
          role: regRole,
          mobile: regMobile
        });
        
        setRegisteredUserId(res.data.userId);
        addToast('Verification code sent to your email.', 'success');
        setCurrentMode('verify');
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to register', 'error');
      } finally {
        setLoading(false);
      }
    } else if (currentMode === 'forgot-password') {
      try {
        await api.post('/auth/forgot-password', { email });
        addToast('If an account exists, a reset code has been sent.', 'success');
        setCurrentMode('reset-password');
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to request reset', 'error');
      } finally {
        setLoading(false);
      }
    } else if (currentMode === 'reset-password') {
      try {
        await api.post('/auth/reset-password', { email, resetCode: otp, newPassword });
        addToast('Password reset successful. You can now login.', 'success');
        setCurrentMode('login');
        setPassword('');
        setNewPassword('');
        setOtp('');
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to reset password', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#1B1B32] font-sans">
      
      {/* LEFT SECTION - Brand & Tagline */}
      <div className="hidden lg:flex flex-1 flex-col justify-center p-16 relative text-white">
        {/* Subtle mesh/glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg"
        >
          <h1 className="text-5xl lg:text-[56px] font-bold leading-[1.15] tracking-tight mb-6">
            B2B Credit &<br/>Aging Reports,<br/>
            <span className="text-amber-500">Simplified.</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed font-light">
            Enterprise-grade dashboard for institutional buyers. Manage credit limits, aging buckets, and collections seamlessly.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SECTION - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-[#111827]">
        {/* Subtle dotted grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.15] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        ></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-[440px] relative z-10"
        >
          <div className="bg-[#1F2937] rounded-2xl p-10 shadow-2xl border border-slate-700/50">
            
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white mb-8">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Ganga Maxx
            </div>
            
            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-slate-700">
              <button 
                type="button" 
                onClick={() => setCurrentMode('register')}
                className={`text-sm font-bold pb-3 border-b-2 transition-colors ${
                  currentMode === 'register' 
                    ? 'border-amber-500 text-white' 
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Register
              </button>
              <button 
                type="button" 
                onClick={() => setCurrentMode('login')}
                className={`text-sm font-bold pb-3 border-b-2 transition-colors ${
                  currentMode === 'login' 
                    ? 'border-amber-500 text-white' 
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {currentMode === 'verify' ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Verification Code</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="123456" 
                      maxLength={6}
                      className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm tracking-widest text-center font-mono" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value)} 
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Please check your email console for the code.
                  </p>
                </motion.div>
              ) : currentMode === 'reset-password' ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Reset Code</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="123456" 
                      maxLength={6}
                      className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm tracking-widest text-center font-mono" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">New Password</label>
                    <div className="relative">
                      <input 
                        required
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : currentMode === 'forgot-password' ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Work Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="name@company.com" 
                      className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <button type="button" onClick={() => setCurrentMode('login')} className="text-amber-500 hover:underline">Back to Login</button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Common Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Work Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="name@company.com" 
                      className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                  </div>


              {/* Register Specific Fields */}
              {currentMode === 'register' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                    <input 
                      required={currentMode === 'register'}
                      type="text" 
                      placeholder="Jane Doe" 
                      className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm" 
                      value={regName} 
                      onChange={e => setRegName(e.target.value)} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mobile Number (Optional)</label>
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm" 
                      value={regMobile} 
                      onChange={e => setRegMobile(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Requested Role</label>
                    <select 
                      required={currentMode === 'register'}
                      className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm" 
                      value={regRole} 
                      onChange={e => setRegRole(e.target.value)} 
                    >
                      <option value="" disabled>Select a role</option>
                      <option value="admin">Admin</option>
                      <option value="finance_manager">Finance Manager</option>
                      <option value="accounts_executive">Accounts Executive</option>
                      <option value="collection_officer">Collection Officer</option>
                      <option value="sales_executive">Sales Executive</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <p className="mt-2 text-[10px] text-amber-500/80 leading-tight">
                      * Note: Roles other than Viewer require Admin approval. You will temporarily be assigned as a Viewer until approved.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Password Field */}
              {currentMode !== 'forgot-password' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Password</label>
                    {currentMode === 'login' && (
                      <button type="button" onClick={() => setCurrentMode('forgot-password')} className="text-xs text-amber-500 hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full h-11 px-4 rounded-lg bg-[#111827] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}
              
              {/* Remember Me */}
              {currentMode === 'login' && (
                <div className="flex items-center pt-1">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-[#111827] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer" 
                  />
                  <label htmlFor="remember" className="ml-2 text-xs text-slate-400 cursor-pointer">
                    Remember me for 30 days
                  </label>
                </div>
              )}
              </>
              )}

              <button 
                disabled={loading || (currentMode === 'verify' ? !otp : currentMode === 'reset-password' ? (!otp || !newPassword) : currentMode === 'forgot-password' ? !email : (!email || !password))} 
                type="submit" 
                className="w-full h-11 mt-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  currentMode === 'login' ? (
                    <>Sign In <LogIn size={16} /></>
                  ) : currentMode === 'verify' ? (
                    <>Verify Code <Sparkles size={16} /></>
                  ) : currentMode === 'reset-password' ? (
                    <>Reset Password <Sparkles size={16} /></>
                  ) : currentMode === 'forgot-password' ? (
                    <>Send Reset Code <Send size={16} /></>
                  ) : (
                    <>Request Access <UserPlus size={16} /></>
                  )
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
