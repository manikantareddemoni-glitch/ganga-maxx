import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Bell, Building2, Clock, IndianRupee, PhoneCall, Receipt, Send, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { Skeleton } from '../../components/Skeleton';
import { collectionActions, dashboard as mock } from '../../data/mockData';
import { api, triggerBackendAction } from '../../lib/api';
import { currency } from '../../lib/format';

const themeConfig = {
  'Metro Fresh Retail': {
    blob1: 'bg-yellow-400',
    blob2: 'bg-orange-500',
    blob3: 'bg-amber-300',
    borderHover: 'hover:border-yellow-400/50 dark:hover:border-yellow-500/50',
    glowHover: 'hover:shadow-[0_0_30px_rgba(250,204,21,0.25)] dark:hover:shadow-[0_0_30px_rgba(250,204,21,0.15)]',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    innerHover: 'group-hover/card:bg-yellow-50/80 dark:group-hover/card:bg-yellow-900/20',
    type: 'pulse'
  },
  'Deccan Wholesale Co.': {
    blob1: 'bg-red-500',
    blob2: 'bg-rose-600',
    blob3: 'bg-pink-500',
    borderHover: 'hover:border-red-400/50 dark:hover:border-red-500/50',
    glowHover: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.25)] dark:hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]',
    iconColor: 'text-red-600 dark:text-red-400',
    innerHover: 'group-hover/card:bg-red-50/80 dark:group-hover/card:bg-red-900/20',
    type: 'critical'
  },
  'Krishna Super Mart': {
    blob1: 'bg-orange-500',
    blob2: 'bg-rose-400',
    blob3: 'bg-amber-500',
    borderHover: 'hover:border-orange-400/50 dark:hover:border-orange-500/50',
    glowHover: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.25)] dark:hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]',
    iconColor: 'text-orange-600 dark:text-orange-400',
    innerHover: 'group-hover/card:bg-orange-50/80 dark:group-hover/card:bg-orange-900/20',
    type: 'floating'
  },
  'Sri Balaji Traders': {
    blob1: 'bg-purple-500',
    blob2: 'bg-fuchsia-600',
    blob3: 'bg-violet-500',
    borderHover: 'hover:border-purple-400/50 dark:hover:border-purple-500/50',
    glowHover: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    iconColor: 'text-purple-600 dark:text-purple-400',
    innerHover: 'group-hover/card:bg-purple-50/80 dark:group-hover/card:bg-purple-900/20',
    type: 'shimmer'
  },
  default: {
    blob1: 'bg-brand-500',
    blob2: 'bg-indigo-500',
    blob3: 'bg-cyan-500',
    borderHover: 'hover:border-brand-400/50 dark:hover:border-brand-500/50',
    glowHover: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
    iconColor: 'text-brand-600 dark:text-brand-400',
    innerHover: 'group-hover/card:bg-brand-50/80 dark:group-hover/card:bg-brand-900/20',
    type: 'default'
  }
};

const AnimatedCardBackground = ({ blob1, blob2, blob3, type }) => (
  <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100">
    <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] z-10 dark:bg-slate-900/70" />
    
    {type === 'pulse' && (
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className={`absolute inset-0 blur-3xl opacity-50 dark:opacity-30 ${blob1}`} />
    )}
    
    {type === 'critical' && (
      <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className={`absolute inset-0 blur-3xl opacity-50 dark:opacity-30 ${blob2}`} />
    )}

    {type === 'shimmer' && (
      <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 z-20 w-[50%] -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/20" />
    )}

    <motion.div animate={{ x: [0, 20, 0], y: [0, 15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className={`absolute -left-4 -top-4 h-32 w-32 rounded-full mix-blend-multiply blur-2xl dark:mix-blend-screen opacity-60 dark:opacity-40 ${blob1}`} />
    <motion.div animate={{ x: [0, -20, 0], y: [0, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className={`absolute -bottom-4 -right-4 h-32 w-32 rounded-full mix-blend-multiply blur-2xl dark:mix-blend-screen opacity-60 dark:opacity-40 ${blob2}`} />
    <motion.div animate={{ x: [0, 15, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className={`absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply blur-2xl dark:mix-blend-screen opacity-50 dark:opacity-30 ${blob3}`} />
    
    {(type === 'floating' || type === 'default' || type === 'pulse') && (
      <>
        <motion.div animate={{ y: [0, -60], opacity: [0, 0.8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute z-20 left-[20%] top-[80%] h-1 w-1 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
        <motion.div animate={{ y: [0, -70], opacity: [0, 0.5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }} className="absolute z-20 left-[60%] top-[90%] h-1 w-1 rounded-full bg-white shadow-[0_0_5px_1px_rgba(255,255,255,0.6)]" />
        <motion.div animate={{ y: [0, -50], opacity: [0, 0.6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute z-20 left-[80%] top-[70%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.7)]" />
      </>
    )}
  </div>
);
const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.dotColor || data.color || data.payload?.fill || '#6366f1';
    const name = data.name === 'value' || data.name === 'amount' ? (label || data.name) : data.name;
    return (
      <div className="rounded-xl border-0 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,.18)] dark:bg-slate-800">
        <p className="text-sm font-bold" style={{ color }}>
          {name} : {currency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomActiveDot = (props) => {
  const { cx, cy, index, payload } = props;
  const fill = payload?.dotColor || colors[index % colors.length];
  return <circle cx={cx} cy={cy} r={7} fill={fill} stroke="#ffffff" strokeWidth={2} />;
};

export default function Dashboard({ context }) {
  const [data, setData] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchData = () => {
    api.get('/dashboard')
      .then((res) => {
        setData(res.data);
        setIsOffline(false);
      })
      .catch(() => {
        setData(mock);
        setIsOffline(true);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (context?.liveEvents?.length > 0) {
      fetchData();
    }
  }, [context?.liveEvents]);

  if (!data) {
    return <PageTransition><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div></PageTransition>;
  }

  const metrics = data.metrics || mock.metrics;
  const rawRevenue = data.revenue?.length ? data.revenue : mock.revenue;
  const revenue = rawRevenue.map((item, index) => ({ ...item, dotColor: colors[index % colors.length] }));
  const rawAging = data.aging?.length ? data.aging : mock.aging;
  const aging = rawAging.map((item, index) => ({ ...item, fill: colors[index % colors.length] }));
  const activities = data.activities?.length ? data.activities : mock.activities;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live credit exposure, overdue movement, and collection health.</p>
        </div>
        <div className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${isOffline ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300'}`}>
          {isOffline ? 'Offline - Using Local Data' : 'Live sync active'}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Customers" value={metrics.totalCustomers} icon={Building2} delay={0.02} />
        <KpiCard label="Outstanding" value={metrics.totalOutstanding} icon={IndianRupee} tone="cyan" money delay={0.06} />
        <KpiCard label="Overdue" value={metrics.totalOverdue} icon={Clock} tone="rose" money delay={0.1} />
        <KpiCard label="Pending Invoices" value={metrics.pendingInvoices} icon={Receipt} tone="amber" delay={0.14} />
        <KpiCard label="Today Collections" value={metrics.todaysCollections} icon={Wallet} tone="emerald" money delay={0.18} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Collections Trend</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">Last 6 months</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs><linearGradient id="collections" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="collections" stroke="#6366f1" strokeWidth={3} fill="url(#collections)" animationDuration={2000} animationEasing="ease-in-out" activeDot={<CustomActiveDot />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-indigo-300 dark:hover:border-indigo-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-indigo-500/10 dark:from-indigo-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Aging Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={aging} dataKey="value" nameKey="bucket" innerRadius={58} outerRadius={92} paddingAngle={4} animationDuration={1100}>
                  {aging.map((entry, index) => <Cell key={entry.bucket} fill={colors[index % colors.length]} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148,163,184,0.05)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {aging.map((item, index) => <div className="flex items-center justify-between text-sm" key={item.bucket}><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index] }} />{item.bucket}</span><span className="font-semibold">{currency(item.value)}</span></div>)}
          </div>
        </motion.section>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-cyan-300 dark:hover:border-cyan-500/30 flex flex-col">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-cyan-500/10 dark:from-cyan-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Overdue Buckets</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aging}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="bucket" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148,163,184,0.05)'}} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500} animationEasing="ease-out">{aging.map((item, index) => <Cell key={item.bucket} fill={colors[index]} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-rose-300 dark:hover:border-rose-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-rose-500/10 dark:from-rose-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Recent Activity</h2>
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const gradientColor = activity.type === 'payment' ? 'from-emerald-500/10' : activity.type === 'invoice' ? 'from-rose-500/10' : activity.type === 'customer' ? 'from-sky-500/10' : 'from-brand-500/10';
              const borderColor = activity.type === 'payment' ? 'hover:border-emerald-300 dark:hover:border-emerald-500/30' : activity.type === 'invoice' ? 'hover:border-rose-300 dark:hover:border-rose-500/30' : activity.type === 'customer' ? 'hover:border-sky-300 dark:hover:border-sky-500/30' : 'hover:border-brand-300 dark:hover:border-brand-500/30';
              const iconColor = activity.type === 'payment' ? 'text-emerald-600 dark:text-emerald-400' : activity.type === 'invoice' ? 'text-rose-600 dark:text-rose-400' : activity.type === 'customer' ? 'text-sky-600 dark:text-sky-400' : 'text-brand-600 dark:text-brand-400';
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20, y: 10 }} 
                  animate={{ opacity: 1, x: 0, y: 0 }} 
                  transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} 
                  whileHover={{ y: -2, scale: 1.015 }} 
                  className={`group/item relative flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-glow-hover dark:border-white/10 dark:bg-white/5 ${borderColor}`} 
                  key={activity.id}
                >
                  <div className={`absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${gradientColor} to-transparent opacity-0 transition-opacity duration-300 group-hover/item:opacity-100`} />
                  
                  {/* Subtle success/alert pulse on icon */}
                  <motion.div 
                    className="mt-0.5 rounded-full relative"
                    animate={activity.type === 'payment' ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 15px rgba(16,185,129,0.5)", "0 0 0px rgba(16,185,129,0)"] } : activity.type === 'invoice' ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(244,63,94,0)", "0 0 15px rgba(244,63,94,0.5)", "0 0 0px rgba(244,63,94,0)"] } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  >
                    <Bell className={iconColor} size={18} />
                  </motion.div>

                  <div>
                    <p className="text-sm font-semibold">{activity.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{activity.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{activity.createdAt || activity.created_at}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
      <motion.section whileHover={{ y: -4 }} className="glass-panel group relative mt-5 rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-amber-300 dark:hover:border-amber-500/30">
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-amber-500/10 dark:from-amber-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Collection Follow-up Panel</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Prioritized action list for overdue institutional accounts.</p>
          </div>
          <button className="primary-btn" onClick={() => triggerBackendAction('send_reminders', { reminders: collectionActions })}><Send size={17} /> Send reminders</button>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {collectionActions.map((item, index) => {
            const theme = themeConfig[item.customer] || themeConfig.default;
            
            return (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -6, scale: 1.015 }} className={`group/card relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 dark:border-white/10 dark:bg-white/5 ${theme.borderHover} ${theme.glowHover}`} key={item.id}>
                <AnimatedCardBackground blob1={theme.blob1} blob2={theme.blob2} blob3={theme.blob3} type={theme.type} />
                <div className="relative z-30 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 transition-colors group-hover/card:text-slate-900 dark:text-white dark:group-hover/card:text-white">{item.customer}</p>
                    <p className="mt-1 text-sm text-slate-500 transition-colors group-hover/card:text-slate-700 dark:text-slate-400 dark:group-hover/card:text-slate-200">{item.invoice_no} • {item.days_overdue} days overdue • {currency(item.amount)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.priority === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300' : item.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300' : 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'}`}>
                    {item.priority}
                  </span>
                </div>
                <div className={`relative z-30 mt-4 flex items-start gap-3 rounded-lg bg-slate-50 p-3 transition-colors dark:bg-white/5 ${theme.innerHover}`}>
                  <motion.div whileHover={{ rotate: 15 }}><PhoneCall className={`mt-0.5 ${theme.iconColor}`} size={17} /></motion.div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 transition-colors dark:text-white">{item.owner}</p>
                    <p className="text-sm text-slate-500 transition-colors dark:text-slate-400 group-hover/card:dark:text-slate-300">{item.action}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </PageTransition>
  );
}
