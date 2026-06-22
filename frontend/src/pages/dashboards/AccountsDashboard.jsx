import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { IndianRupee, FileText, Activity, CreditCard, TrendingUp, Landmark } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { useAuth } from '../../context/AuthContext';
import { currency } from '../../lib/format';

const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];

const mockData = {
  metrics: {
    totalOutstanding: 1200000,
    pendingInvoices: 45,
    paymentsToday: 45000,
    cashflow: 2800000
  },
  cashflowTrend: [
    { month: 'Jan', in: 400000, out: 250000 },
    { month: 'Feb', in: 550000, out: 300000 },
    { month: 'Mar', in: 480000, out: 400000 },
    { month: 'Apr', in: 620000, out: 350000 },
    { month: 'May', in: 750000, out: 420000 },
    { month: 'Jun', in: 1000000, out: 500000 },
  ],
  recentTransactions: [
    { id: 1, client: 'Sri Balaji Traders', type: 'Payment Received', amount: 25000, status: 'Completed' },
    { id: 2, client: 'Metro Fresh Retail', type: 'Invoice Generated', amount: 45000, status: 'Pending' },
    { id: 3, client: 'Deccan Wholesale Co.', type: 'Refund Processed', amount: 5000, status: 'Completed' }
  ]
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border-0 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,.18)] dark:bg-slate-800">
        <p className="mb-2 text-sm font-bold border-b border-slate-100 dark:border-slate-700 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.name.toUpperCase()}: {currency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AccountsDashboard() {
  const { user } = useAuth();
  const data = mockData;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Accounts Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here is your financial overview.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Outstanding" value={data.metrics.totalOutstanding} icon={IndianRupee} tone="indigo" money delay={0.02} />
        <KpiCard label="Pending Invoices" value={data.metrics.pendingInvoices} icon={FileText} tone="amber" delay={0.06} />
        <KpiCard label="Payments Today" value={data.metrics.paymentsToday} icon={CreditCard} tone="emerald" money delay={0.1} />
        <KpiCard label="Net Cashflow" value={data.metrics.cashflow} icon={Landmark} tone="cyan" money delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Cashflow Trend</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">In vs Out (YTD)</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cashflowTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148,163,184,0.05)'}} />
                <Bar dataKey="in" name="Inflow" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1500} />
                <Bar dataKey="out" name="Outflow" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-cyan-300 dark:hover:border-cyan-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Recent Transactions</h2>
          <div className="space-y-4">
            {data.recentTransactions.map((tx, i) => (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, ease: 'easeOut' }} key={tx.id} className="group/item flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {tx.status === 'Completed' ? <TrendingUp size={18} /> : <Activity size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{tx.client}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{tx.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type.includes('Payment') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type.includes('Payment') ? '+' : ''}{currency(tx.amount)}
                  </p>
                  <p className={`text-[10px] font-bold uppercase mt-1 ${tx.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {tx.status}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}
