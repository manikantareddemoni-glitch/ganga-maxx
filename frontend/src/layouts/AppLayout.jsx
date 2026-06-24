import React, { useState, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Bell, Building2, FileText, LayoutDashboard, LogOut, Menu, Settings, Wallet, X, User, ShieldCheck, Package, Truck, ShieldAlert, ClipboardList, Target, Users, Boxes } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { logoBase64 } from '../lib/logoBase64';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { NotificationToast } from '../components/NotificationToast';

const getNavForRole = (role) => {
  if (role === 'admin') {
    return [
      { to: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, activeText: 'text-blue-600 dark:text-blue-400', activeBg: 'bg-blue-600 dark:bg-blue-400' },
      { to: '/customers', label: 'Customers', icon: Building2, activeText: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-600 dark:bg-emerald-400' },
      { to: '/ledger', label: 'Ledger', icon: Wallet, activeText: 'text-brand-600 dark:text-brand-400', activeBg: 'bg-brand-600 dark:bg-brand-400' },
      { to: '/statement', label: 'Statements', icon: FileText, activeText: 'text-sky-600 dark:text-sky-400', activeBg: 'bg-sky-600 dark:bg-sky-400' },
      { to: '/aging', label: 'Aging', icon: BarChart3, activeText: 'text-rose-600 dark:text-rose-400', activeBg: 'bg-rose-600 dark:bg-rose-400' },
    ];
  } else if (role === 'finance_manager') {
    return [
      { to: '/finance-dashboard', label: 'Dashboard', icon: LayoutDashboard, activeText: 'text-blue-600 dark:text-blue-400', activeBg: 'bg-blue-600 dark:bg-blue-400' },
      { to: '/customers', label: 'Customers', icon: Building2, activeText: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-600 dark:bg-emerald-400' },
      { to: '/ledger', label: 'Ledger', icon: Wallet, activeText: 'text-brand-600 dark:text-brand-400', activeBg: 'bg-brand-600 dark:bg-brand-400' },
      { to: '/statement', label: 'Statements', icon: FileText, activeText: 'text-sky-600 dark:text-sky-400', activeBg: 'bg-sky-600 dark:bg-sky-400' },
      { to: '/aging', label: 'Aging', icon: BarChart3, activeText: 'text-rose-600 dark:text-rose-400', activeBg: 'bg-rose-600 dark:bg-rose-400' },
    ];
  } else if (role === 'accounts_executive') {
    return [
      { to: '/accounts-dashboard', label: 'Dashboard', icon: LayoutDashboard, activeText: 'text-blue-600 dark:text-blue-400', activeBg: 'bg-blue-600 dark:bg-blue-400' },
      { to: '/ledger', label: 'Ledger', icon: Wallet, activeText: 'text-brand-600 dark:text-brand-400', activeBg: 'bg-brand-600 dark:bg-brand-400' },
      { to: '/statement', label: 'Statements', icon: FileText, activeText: 'text-sky-600 dark:text-sky-400', activeBg: 'bg-sky-600 dark:bg-sky-400' },
    ];
  } else if (role === 'sales_executive') {
    return [
      { to: '/sales-dashboard', label: 'Dashboard', icon: LayoutDashboard, activeText: 'text-blue-600 dark:text-blue-400', activeBg: 'bg-blue-600 dark:bg-blue-400' },
      { to: '/customers', label: 'My Customers', icon: Users, activeText: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-600 dark:bg-emerald-400' },
      { to: '/orders', label: 'Sales Orders', icon: FileText, activeText: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-600 dark:bg-amber-400' },
      { to: '/targets', label: 'Targets', icon: Target, activeText: 'text-rose-600 dark:text-rose-400', activeBg: 'bg-rose-600 dark:bg-rose-400' }
    ];
  } else if (role === 'collection_officer') {
    return [
      { to: '/collections-dashboard', label: 'Dashboard', icon: LayoutDashboard, activeText: 'text-blue-600 dark:text-blue-400', activeBg: 'bg-blue-600 dark:bg-blue-400' },
      { to: '/aging', label: 'Aging', icon: BarChart3, activeText: 'text-rose-600 dark:text-rose-400', activeBg: 'bg-rose-600 dark:bg-rose-400' },
    ];
  } else if (role === 'viewer') {
    return [
      { to: '/viewer-dashboard', label: 'Dashboard', icon: LayoutDashboard, activeText: 'text-blue-600 dark:text-blue-400', activeBg: 'bg-blue-600 dark:bg-blue-400' },
      { to: '/customers', label: 'Customers', icon: Building2, activeText: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-600 dark:bg-emerald-400' },
      { to: '/statement', label: 'Statements', icon: FileText, activeText: 'text-sky-600 dark:text-sky-400', activeBg: 'bg-sky-600 dark:bg-sky-400' },
      { to: '/aging', label: 'Aging', icon: BarChart3, activeText: 'text-rose-600 dark:text-rose-400', activeBg: 'bg-rose-600 dark:bg-rose-400' },
    ];
  }
  return [];
};

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const element = useOutlet();
  const liveEvents = useSocket();

  const nav = useMemo(() => getNavForRole(user?.role), [user?.role]);

  function signOut() {
    logout();
    navigate('/login');
  }

  const logo = (
    <div 
      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
      onClick={() => navigate('/')}
      title="Go Home"
    >
      <img src={logoBase64} alt="Ganga Maxx Logo" className="h-10 md:h-12 object-contain bg-white rounded-lg p-1 shadow-sm" />
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold leading-tight text-slate-950 dark:text-white tracking-wide">Ganga Maxx</p>
        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Console</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white relative font-sans">
      
      {/* Dynamic Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.5, 1] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute top-[20%] -right-20 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px]" 
        />
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute -bottom-40 left-[20%] w-[800px] h-[800px] bg-cyan-500/10 dark:bg-cyan-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px]" 
        />
      </div>

      <NotificationToast notifications={liveEvents} />

      {/* Sleek Enterprise Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/90 transition-all duration-300 shadow-sm dark:shadow-none">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo - Left */}
          <motion.div whileHover={{ opacity: 0.8 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
            {logo}
          </motion.div>
            
          {/* Nav & Tools - Right */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className="group relative flex h-16 items-center px-3 text-[14px] font-semibold tracking-wide transition-colors"
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavLine"
                          className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full ${item.activeBg}`}
                          initial={false}
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      )}
                      <div className={`flex items-center gap-2.5 transition-colors duration-200 ${isActive ? item.activeText : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'}`}>
                        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-200 group-hover:scale-110" />
                        {item.label}
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Tools & Profile */}
            <div className="flex items-center gap-2 sm:gap-4 pl-2 lg:pl-4 lg:border-l lg:border-slate-200 lg:dark:border-slate-800">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ThemeToggle />
              </motion.div>
              
              <div className="hidden sm:flex items-center relative">
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-slate-900 hover:ring-indigo-200 dark:hover:ring-indigo-900 transition-all cursor-pointer"
                >
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      {/* Invisible backdrop to close dropdown when clicking outside */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-64 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 overflow-hidden z-50 origin-top-right"
                      >
                        <div className="border-b border-slate-100 dark:border-white/5 p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                            {(user?.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <ShieldCheck size={12} className="text-emerald-500" />
                              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">
                                {user?.role ? user.role.replace('_', ' ') : 'Role'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <button 
                            onClick={() => { navigate('/settings'); setProfileMenuOpen(false); }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
                          >
                            <User size={16} className="text-slate-400" />
                            My Profile
                          </button>
                          <button 
                            onClick={() => { navigate('/settings'); setProfileMenuOpen(false); }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
                          >
                            <Settings size={16} className="text-slate-400" />
                            Settings
                          </button>
                        </div>
                        <div className="border-t border-slate-100 dark:border-white/5 p-2">
                          <button 
                            onClick={() => { signOut(); setProfileMenuOpen(false); }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut size={16} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 ml-1" onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 top-[65px] z-30 border-b border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden"
          >
            <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-emerald-600 uppercase font-semibold">{user?.role ? user.role.replace('_', ' ') : 'Role'}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                      isActive ? `${item.activeBg} text-white shadow-glow` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <button 
                onClick={() => { signOut(); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-[1400px] p-4 lg:p-7">
        <AnimatePresence mode="wait">
          {element && React.cloneElement(element, { key: location.pathname, context: { liveEvents } })}
        </AnimatePresence>
      </main>
    </div>
  );
}
