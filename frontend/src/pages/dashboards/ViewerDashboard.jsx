import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Eye, Building2, Receipt, AlertTriangle } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { useAuth } from '../../context/AuthContext';
import { currency } from '../../lib/format';

const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];

const mockData = {
  metrics: {
    totalCustomers: 342,
    totalInvoices: 1204,
    totalOutstanding: 4500000,
    criticalAccounts: 12
  },
  yearlyTrend: [
    { month: 'Jan', revenue: 4000000 },
    { month: 'Feb', revenue: 5500000 },
    { month: 'Mar', revenue: 4800000 },
    { month: 'Apr', revenue: 6200000 },
    { month: 'May', revenue: 7500000 },
    { month: 'Jun', revenue: 8000000 },
  ]
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.dotColor || data.color || data.payload?.fill || '#6366f1';
    return (
      <div className="rounded-xl border-0 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,.18)] dark:bg-slate-800">
        <p className="text-sm font-bold" style={{ color }}>
          {label} : {currency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function ViewerDashboard() {
  const { user } = useAuth();
  const data = mockData;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Read-Only Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. You are in viewer mode.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Customers" value={data.metrics.totalCustomers} icon={Building2} tone="brand" delay={0.02} />
        <KpiCard label="Total Invoices" value={data.metrics.totalInvoices} icon={Receipt} tone="cyan" delay={0.06} />
        <KpiCard label="Total Outstanding" value={data.metrics.totalOutstanding} icon={Eye} tone="amber" money delay={0.1} />
        <KpiCard label="Critical Accounts" value={data.metrics.criticalAccounts} icon={AlertTriangle} tone="rose" delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">YTD Revenue Trend</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">Overall View</span>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.yearlyTrend}>
                <defs><linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} /><stop offset="95%" stopColor="#4F46E5" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fill="url(#viewGrad)" animationDuration={2000} animationEasing="ease-in-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}
