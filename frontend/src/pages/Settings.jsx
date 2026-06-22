import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building, ShieldCheck, CheckCircle2,
  Workflow, AlertCircle, ToggleRight, Mail, CreditCard, Edit, Loader2, Globe, Palette, Clock, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { RippleButton } from '../components/RippleButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';

const tabs = [
  { id: 'profile', label: 'My Profile' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'organization', label: 'Workspace' },
  { id: 'workflows', label: 'Automation' },
  { id: 'security', label: 'Security' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage your personal and workspace configurations.
          </p>
        </div>

        {/* Clean Top Navigation */}
        <nav className="flex space-x-6 border-b border-slate-200/80 dark:border-white/10 mb-10 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeSettingsTab" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab Content */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(8px)', y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'preferences' && <PreferencesSettings />}
              {activeTab === 'organization' && <OrganizationSettings />}
              {activeTab === 'workflows' && <CreditWorkflows />}
              {activeTab === 'security' && <SecuritySettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}

// Split Panel Component
function SplitPanel({ title, description, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-200/60 dark:border-white/5 mb-10 last:border-0 last:mb-0 last:pb-0">
      <div className="md:col-span-1">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed pr-4">{description}</p>
      </div>
      <div className="md:col-span-2">
        {children}
      </div>
    </div>
  );
}

// Right Panel Card
function PanelCard({ children }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm dark:border-white/10 dark:bg-[#030712]/50 overflow-hidden">
      {children}
    </div>
  );
}

// Switch Component
function Switch({ isOn }) {
  return (
    <div 
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <motion.div 
        className="bg-white w-4 h-4 rounded-full shadow-sm"
        layout
        transition={{ duration: 0.2, ease: "easeInOut" }}
        animate={{ x: isOn ? 20 : 0 }}
      />
    </div>
  );
}

// ==========================================
// TABS
// ==========================================

function ProfileSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    addToast('Profile updated successfully!');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoUrl(URL.createObjectURL(file));
      addToast('Profile photo updated!', 'success');
    }
  };

  return (
    <div className="space-y-0">
      <SplitPanel 
        title="Avatar & Identity" 
        description="Update your profile photo and personal identity details. This will be displayed across your team workspace."
      >
        <PanelCard>
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                <div className="flex h-20 w-20 overflow-hidden items-center justify-center rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-2xl font-bold text-indigo-600 dark:from-indigo-500/20 dark:to-purple-500/20 dark:text-indigo-400 shadow-inner group-hover:shadow-md transition-all duration-300">
                  {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover transition-opacity duration-300" alt="Avatar" /> : (user?.name?.charAt(0) || 'A')}
                </div>
                <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-sm dark:border-[#030712] transition-transform duration-300 group-hover:bg-indigo-600">
                  <Edit size={12} />
                </div>
              </div>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                <button 
                  onClick={handlePhotoClick}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10 transition-colors"
                >
                  Change Photo
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-white/5 p-6 grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
              <input className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300" defaultValue={user?.name || 'Ganga Maxx Admin'} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
              <input className="w-full rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-[#030712] dark:text-white text-slate-500 cursor-not-allowed transition-all duration-300" readOnly defaultValue={user?.email || 'admin@gangamaxx.com'} />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number</label>
              <input className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300" defaultValue="+91 98765 43210" />
            </div>
          </div>
        </PanelCard>
      </SplitPanel>

      <SplitPanel 
        title="Professional Details" 
        description="Your role and department within the organization. This helps teammates identify your responsibilities."
      >
        <PanelCard>
          <div className="p-6 grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Title</label>
              <input className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300" placeholder="e.g. Credit Manager" defaultValue="Credit Manager" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</label>
              <input className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300" placeholder="e.g. Finance" defaultValue="Finance" />
            </div>
            <div className="col-span-2 border-t border-slate-100 dark:border-white/5 pt-5 mt-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">System Role</label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-xs font-bold">
                  <ShieldCheck size={12} />
                  Administrator
                </span>
                <span className="text-xs text-slate-400">(Contact support to change role)</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 px-6 py-4 flex justify-end">
            <RippleButton 
              onClick={handleSaveProfile} 
              disabled={isLoading}
              className="h-9 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </RippleButton>
          </div>
        </PanelCard>
      </SplitPanel>

      <SplitPanel 
        title="Account Actions" 
        description="Manage your active session on this device."
      >
        <PanelCard>
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Sign Out</p>
              <p className="text-sm text-slate-500 mt-1">End your current session and return to the login screen.</p>
            </div>
            <RippleButton 
              onClick={handleSignOut}
              className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/20 transition-all shadow-sm flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign out
            </RippleButton>
          </div>
        </PanelCard>
      </SplitPanel>
    </div>
  );
}

function PreferencesSettings() {
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    addToast(`Appearance updated to ${newTheme} mode.`);
  };

  return (
    <div className="space-y-0">
      <SplitPanel 
        title="Appearance" 
        description="Customize how the interface looks on your device. We automatically sync with your operating system preference by default."
      >
        <PanelCard>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {['light', 'dark', 'system'].map((item) => (
                <button 
                  key={item} 
                  onClick={() => handleThemeChange(item)} 
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    theme === item 
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 dark:border-indigo-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-[#0A1128]/50 dark:border-white/10 dark:hover:border-white/20'
                  }`}
                >
                  <div className={`h-12 w-full rounded-md flex items-center justify-center border shadow-sm ${
                    item === 'dark' ? 'bg-slate-900 border-slate-800' : 
                    item === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-r from-slate-50 to-slate-900 border-slate-300'
                  }`}>
                    {item === 'system' && <Globe className="text-slate-400" size={18} />}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize flex items-center gap-1.5">
                    {item}
                    {theme === item && <CheckCircle2 size={14} className="text-indigo-600 dark:text-indigo-400" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </PanelCard>
      </SplitPanel>

      <SplitPanel 
        title="Localization" 
        description="Manage your language and time zone preferences. This affects how dates and times are displayed."
      >
        <PanelCard>
          <div className="p-6 grid gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</label>
              <select className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white appearance-none">
                <option>English (United States)</option>
                <option>English (United Kingdom)</option>
                <option>Hindi (India)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Timezone</label>
              <select className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white appearance-none">
                <option>(GMT+05:30) India Standard Time - Kolkata</option>
                <option>(GMT+00:00) Greenwich Mean Time - London</option>
                <option>(GMT-08:00) Pacific Time - Los Angeles</option>
              </select>
            </div>
          </div>
        </PanelCard>
      </SplitPanel>
    </div>
  );
}

function OrganizationSettings() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveBusiness = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    addToast('Workspace settings saved successfully!');
  };

  return (
    <div className="space-y-0">
      <SplitPanel 
        title="Workspace Profile" 
        description="Update your company's legal entity information. This information is used on official invoices and credit statements."
      >
        <PanelCard>
          <div className="p-6 grid gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Legal Company Name</label>
              <input className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300" defaultValue="Ganga Maxx Global Ltd." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Tax ID / GSTIN</label>
              <input className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300" defaultValue="29AAAAA0000A1Z5" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Billing Address</label>
              <textarea rows="3" className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300 resize-none" defaultValue="123 Tech Park, Financial District, Hyderabad, TG 500032" />
            </div>
          </div>
          <div className="bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 px-6 py-4 flex justify-end">
            <RippleButton 
              onClick={handleSaveBusiness} 
              disabled={isLoading}
              className="h-9 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? 'Saving...' : 'Save Workspace'}
            </RippleButton>
          </div>
        </PanelCard>
      </SplitPanel>
    </div>
  );
}

function CreditWorkflows() {
  const { addToast } = useToast();
  const [rules, setRules] = useState({
    autoReminder: true,
    autoSuspend: false,
    lateFee: true
  });

  const toggleRule = (key) => {
    setRules(prev => {
      const newState = !prev[key];
      addToast(`Rule ${newState ? 'enabled' : 'disabled'}.`);
      return { ...prev, [key]: newState };
    });
  };

  return (
    <div className="space-y-0">
      <SplitPanel 
        title="Collection Policies" 
        description="Automate how Ganga Maxx handles overdue accounts, reminders, and penalties. These rules apply globally to all customers."
      >
        <PanelCard>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            
            <div className="p-6 flex items-start justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Automated Reminders</p>
                <p className="text-sm text-slate-500 mt-1">Send pre-emptive emails 3 days before due date, and escalating notices at 1, 15, and 30 days overdue.</p>
              </div>
              <div className="mt-1 cursor-pointer" onClick={() => toggleRule('autoReminder')}>
                <Switch isOn={rules.autoReminder} />
              </div>
            </div>

            <div className="p-6 flex items-start justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Account Suspension Trigger</p>
                <p className="text-sm text-slate-500 mt-1">Automatically restrict new credit issuances for any customer whose oldest invoice crosses 90+ days overdue.</p>
              </div>
              <div className="mt-1 cursor-pointer" onClick={() => toggleRule('autoSuspend')}>
                <Switch isOn={rules.autoSuspend} />
              </div>
            </div>

            <div className="p-6 flex items-start justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Late Fee Enforcement</p>
                <p className="text-sm text-slate-500 mt-1">Apply a standard 1.5% compounding monthly penalty to any outstanding balance older than 30 days.</p>
              </div>
              <div className="mt-1 cursor-pointer" onClick={() => toggleRule('lateFee')}>
                <Switch isOn={rules.lateFee} />
              </div>
            </div>

          </div>
        </PanelCard>
      </SplitPanel>
    </div>
  );
}

function SecuritySettings() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleUpdatePassword = async () => {
    if (!pwd || !confirmPwd) {
      addToast('Please enter both passwords', 'error');
      return;
    }
    if (pwd !== confirmPwd) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    addToast('Password updated successfully!');
    setPwd('');
    setConfirmPwd('');
  };

  return (
    <div className="space-y-0">
      <SplitPanel 
        title="Authentication" 
        description="Enhance the security of your account by requiring secondary verification on login."
      >
        <PanelCard>
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Multi-Factor Authentication (MFA)</p>
              <p className="text-sm text-slate-500 mt-1">Require an authenticator app code to sign in.</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Currently Enabled</span>
              </div>
            </div>
            <RippleButton 
              onClick={() => addToast('MFA Setup Flow would launch here.')}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              Reconfigure
            </RippleButton>
          </div>
        </PanelCard>
      </SplitPanel>

      <SplitPanel 
        title="Change Password" 
        description="Update your password associated with your account. We recommend using a strong password."
      >
        <PanelCard>
          <div className="p-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A1128]/50 dark:text-white transition-all duration-300" 
              />
            </div>
          </div>
          <div className="bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 px-6 py-4 flex justify-end">
            <RippleButton 
              onClick={handleUpdatePassword} 
              disabled={isLoading}
              className="h-9 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? 'Updating...' : 'Update Password'}
            </RippleButton>
          </div>
        </PanelCard>
      </SplitPanel>
    </div>
  );
}
