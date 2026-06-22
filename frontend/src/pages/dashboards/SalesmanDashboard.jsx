import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle2, IndianRupee, Target, TrendingUp, Users, Calendar, MapPin, Clock } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { useAuth } from '../../context/AuthContext';
import { currency } from '../../lib/format';

const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];

const mockData = {
  metrics: {
    target: 5000000,
    achieved: 3800000,
    customers: 45,
    commission: 114000
  },
  salesTrend: [
    { month: 'Jan', sales: 400000 },
    { month: 'Feb', sales: 550000 },
    { month: 'Mar', sales: 480000 },
    { month: 'Apr', sales: 620000 },
    { month: 'May', sales: 750000 },
    { month: 'Jun', sales: 1000000 },
  ],
  pipeline: [
    { name: 'Prospecting', value: 1200000 },
    { name: 'Qualified', value: 800000 },
    { name: 'Proposal', value: 500000 },
    { name: 'Negotiation', value: 350000 },
    { name: 'Closed Won', value: 3800000 }
  ],
  meetings: [
    { id: 1, client: 'Sri Balaji Traders', time: '10:00 AM Today', type: 'Credit Expansion', location: 'Hyderabad' },
    { id: 2, client: 'Metro Fresh Retail', time: '02:30 PM Today', type: 'New Product Pitch', location: 'Secunderabad' },
    { id: 3, client: 'Deccan Wholesale Co.', time: '11:00 AM Tomorrow', type: 'Overdue Follow-up', location: 'Kukatpally' }
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

export default function SalesmanDashboard() {
  const { user } = useAuth();
  const data = mockData;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Salesman Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here is your sales performance overview.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Monthly Target" value={data.metrics.target} icon={Target} tone="cyan" money delay={0.02} />
        <KpiCard label="Achieved (76%)" value={data.metrics.achieved} icon={TrendingUp} tone="emerald" money delay={0.06} />
        <KpiCard label="Active Customers" value={data.metrics.customers} icon={Users} tone="brand" delay={0.1} />
        <KpiCard label="Est. Commission" value={data.metrics.commission} icon={IndianRupee} tone="amber" money delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Your Sales Trend</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">YTD Performance</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesTrend}>
                <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} fill="url(#salesGrad)" animationDuration={2000} animationEasing="ease-in-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-amber-300 dark:hover:border-amber-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Upcoming Meetings</h2>
          <div className="space-y-4">
            {data.meetings.map((meeting, i) => (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, ease: 'easeOut' }} key={meeting.id} className="group/item flex gap-4 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 hover:border-amber-300 dark:hover:border-amber-500/30 transition-all cursor-pointer">
                <div className="w-10 h-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Calendar size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{meeting.client}</p>
                  <p className="text-sm text-slate-500 truncate">{meeting.type}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {meeting.time}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {meeting.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
      
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-indigo-300 dark:hover:border-indigo-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-indigo-500/10 dark:from-indigo-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Sales Pipeline</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.pipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148,163,184,0.05)'}} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500} animationEasing="ease-out">
                  {data.pipeline.map((item, index) => <Cell key={item.name} fill={colors[index]} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}
