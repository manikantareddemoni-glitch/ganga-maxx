import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { PhoneCall, AlertCircle, CalendarClock, Target, PhoneForwarded } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { useAuth } from '../../context/AuthContext';
import { currency } from '../../lib/format';

const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];

const mockData = {
  metrics: {
    callsMade: 145,
    promisesToPay: 28,
    amountRecovered: 1250000,
    recoveryRate: 68
  },
  collectionTrend: [
    { week: 'W1', recovered: 400000 },
    { week: 'W2', recovered: 550000 },
    { week: 'W3', recovered: 480000 },
    { week: 'W4', recovered: 820000 }
  ],
  callOutcomes: [
    { name: 'Promise to Pay', value: 28 },
    { name: 'Left Message', value: 45 },
    { name: 'Disputed', value: 8 },
    { name: 'No Answer', value: 64 }
  ],
  todaysQueue: [
    { id: 1, client: 'Sri Balaji Traders', amount: 450000, days: 95, priority: 'Critical' },
    { id: 2, client: 'Metro Fresh Retail', amount: 120000, days: 65, priority: 'High' },
    { id: 3, client: 'Deccan Wholesale Co.', amount: 85000, days: 45, priority: 'Medium' }
  ]
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.dotColor || data.color || data.payload?.fill || '#6366f1';
    return (
      <div className="rounded-xl border-0 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,.18)] dark:bg-slate-800">
        <p className="text-sm font-bold" style={{ color }}>
          {label || data.name} : {currency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function CollectionsDashboard() {
  const { user } = useAuth();
  const data = mockData;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Collections Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here is your recovery and call queue.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Calls Made Today" value={data.metrics.callsMade} icon={PhoneCall} tone="cyan" delay={0.02} />
        <KpiCard label="Promises to Pay" value={data.metrics.promisesToPay} icon={CalendarClock} tone="amber" delay={0.06} />
        <KpiCard label="Amount Recovered" value={data.metrics.amountRecovered} icon={Target} tone="emerald" money delay={0.1} />
        <KpiCard label="Recovery Rate" value={`${data.metrics.recoveryRate}%`} icon={AlertCircle} tone="brand" delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recovery Trend</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">This Month</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.collectionTrend}>
                <defs><linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="recovered" stroke="#10B981" strokeWidth={3} fill="url(#colGrad)" animationDuration={2000} animationEasing="ease-in-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-rose-300 dark:hover:border-rose-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Call Queue Priority</h2>
          <div className="space-y-4">
            {data.todaysQueue.map((queue, i) => (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, ease: 'easeOut' }} key={queue.id} className="group/item flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 hover:border-rose-300 dark:hover:border-rose-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <PhoneForwarded size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{queue.client}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-0.5">{queue.days} days overdue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">{currency(queue.amount)}</p>
                  <p className={`text-[10px] font-bold uppercase mt-1 ${queue.priority === 'Critical' ? 'text-rose-500' : 'text-amber-500'}`}>
                    {queue.priority}
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
