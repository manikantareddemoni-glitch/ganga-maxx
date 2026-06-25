import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Bell, Building2, Clock, IndianRupee, PhoneCall, Receipt, Send, Wallet, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { Skeleton } from '../../components/Skeleton';
import { api } from '../../lib/api';
import { currency } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

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
    {type === 'pulse' && <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className={`absolute inset-0 blur-3xl opacity-50 dark:opacity-30 ${blob1}`} />}
    {type === 'critical' && <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className={`absolute inset-0 blur-3xl opacity-50 dark:opacity-30 ${blob2}`} />}
    {type === 'shimmer' && <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 z-20 w-[50%] -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/20" />}
    <motion.div animate={{ x: [0, 20, 0], y: [0, 15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className={`absolute -left-4 -top-4 h-32 w-32 rounded-full mix-blend-multiply blur-2xl dark:mix-blend-screen opacity-60 dark:opacity-40 ${blob1}`} />
    <motion.div animate={{ x: [0, -20, 0], y: [0, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className={`absolute -bottom-4 -right-4 h-32 w-32 rounded-full mix-blend-multiply blur-2xl dark:mix-blend-screen opacity-60 dark:opacity-40 ${blob2}`} />
    <motion.div animate={{ x: [0, 15, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className={`absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply blur-2xl dark:mix-blend-screen opacity-50 dark:opacity-30 ${blob3}`} />
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
        <p className="text-sm font-bold" style={{ color }}>{name} : {currency(data.value)}</p>
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

export default function ViewerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Corporate Console (View-Only)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. You are exploring the dashboard as a Viewer.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Customers" value={data.metrics.totalCustomers} icon={Building2} tone="brand" delay={0.02} />
        <KpiCard label="Total Outstanding" value={data.metrics.totalOutstanding} icon={Wallet} tone="amber" money delay={0.06} />
        <KpiCard label="Total Overdue" value={data.metrics.totalOverdue} icon={Clock} tone="rose" money delay={0.1} />
        <KpiCard label="Today's Collections" value={data.metrics.todaysCollections} icon={IndianRupee} tone="emerald" money delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[2fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-brand-300 dark:hover:border-brand-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Revenue Trend</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">Last 12 Months</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue}>
                <defs><linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} /><stop offset="95%" stopColor="#4F46E5" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="collections" stroke="#4F46E5" strokeWidth={3} fill="url(#viewGrad)" activeDot={<CustomActiveDot />} animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-fuchsia-300 dark:hover:border-fuchsia-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Aging Buckets</h2>
          </div>
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.aging} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none" animationDuration={2000}>
                  {data.aging.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800 dark:text-white">
                {currency(data.aging.reduce((sum, item) => sum + item.value, 0) || 0)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Total Outstanding</span>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="mt-5">
        <motion.section className="glass-panel rounded-xl p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Top Priorities (View-Only)</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.collectionActions.map((action, i) => {
              const theme = themeConfig[action.customer] || themeConfig.default;
              return (
                <motion.div key={action.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`group/card relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/50 bg-white/50 p-5 transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-800/50 ${theme.borderHover} ${theme.glowHover}`}>
                  <AnimatedCardBackground {...theme} />
                  <div className={`absolute inset-0 -z-10 transition-colors duration-300 ${theme.innerHover}`} />
                  <div className="mb-3 flex items-start justify-between">
                    <div><h3 className="font-bold text-slate-900 dark:text-white">{action.customer}</h3><p className="text-xs font-semibold text-slate-500">{action.invoice_no}</p></div>
                    <div className={`rounded-full bg-white p-2 shadow-sm dark:bg-slate-900/50 ${theme.iconColor}`}><Building2 size={16} /></div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xl font-black text-slate-900 dark:text-white">{currency(action.amount)}</div>
                    <div className="text-sm font-bold text-rose-500 dark:text-rose-400">{action.days_overdue} days overdue</div>
                  </div>
                  <div className="rounded-lg bg-slate-100/80 p-3 text-xs dark:bg-slate-900/50">
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{action.action}</p>
                    <p className="mt-1 text-slate-400">Assigned: {action.owner}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}
