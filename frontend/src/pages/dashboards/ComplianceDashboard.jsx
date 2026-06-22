import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileSearch, Building2, AlertTriangle, FileWarning, Eye } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { useAuth } from '../../context/AuthContext';

const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];

const mockData = {
  metrics: {
    pendingKyc: 14,
    auditFlags: 5,
    highRisk: 2,
    activeHolds: 8
  },
  riskTrend: [
    { month: 'Jan', alerts: 12 },
    { month: 'Feb', alerts: 8 },
    { month: 'Mar', alerts: 15 },
    { month: 'Apr', alerts: 6 },
    { month: 'May', alerts: 9 },
    { month: 'Jun', alerts: 5 },
  ],
  riskCategories: [
    { name: 'Overdue > 90 Days', value: 12 },
    { name: 'Credit Limit Breach', value: 8 },
    { name: 'Missing KYC', value: 14 },
    { name: 'Suspicious Activity', value: 3 }
  ],
  urgentFlags: [
    { id: 1, client: 'Deccan Wholesale Co.', flag: 'Credit Limit Breached by 40%', severity: 'Critical' },
    { id: 2, client: 'Global Pharma', flag: 'Trade License Expired', severity: 'High' },
    { id: 3, client: 'City Mart', flag: 'Multiple bounced payments', severity: 'High' }
  ]
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.dotColor || data.color || data.payload?.fill || '#6366f1';
    return (
      <div className="rounded-xl border-0 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,.18)] dark:bg-slate-800">
        <p className="text-sm font-bold" style={{ color }}>
          {label || data.name} : {data.value}
        </p>
      </div>
    );
  }
  return null;
};

export default function ComplianceDashboard() {
  const { user } = useAuth();
  const data = mockData;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Compliance Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here is your risk and audit overview.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Pending KYC" value={data.metrics.pendingKyc} icon={FileSearch} tone="amber" delay={0.02} />
        <KpiCard label="Audit Flags" value={data.metrics.auditFlags} icon={ShieldAlert} tone="brand" delay={0.06} />
        <KpiCard label="High Risk Accounts" value={data.metrics.highRisk} icon={AlertTriangle} tone="rose" delay={0.1} />
        <KpiCard label="Active Holds" value={data.metrics.activeHolds} icon={ShieldCheck} tone="cyan" delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Risk Alerts Trend</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">YTD Performance</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.riskTrend}>
                <defs><linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} /><stop offset="95%" stopColor="#F43F5E" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="alerts" stroke="#F43F5E" strokeWidth={3} fill="url(#riskGrad)" animationDuration={2000} animationEasing="ease-in-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-rose-300 dark:hover:border-rose-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Urgent Flags</h2>
          <div className="space-y-4">
            {data.urgentFlags.map((flag, i) => (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, ease: 'easeOut' }} key={flag.id} className="group/item p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileWarning size={18} className="text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{flag.client}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${flag.severity === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40'}`}>
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1">{flag.flag}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    <Eye size={12} /> Review Case
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
      
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-brand-300 dark:hover:border-brand-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-brand-500/10 dark:from-brand-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Risk Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.riskCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={150} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148,163,184,0.05)'}} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={1500} animationEasing="ease-out">
                  {data.riskCategories.map((item, index) => <Cell key={item.name} fill={colors[index]} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}
