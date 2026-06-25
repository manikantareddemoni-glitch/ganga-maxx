import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Building2, Clock, IndianRupee, Receipt, Wallet, Activity, ArrowRight, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { Skeleton } from '../../components/Skeleton';
import { api } from '../../lib/api';
import { currency } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const colors = ['#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.fill || '#475569';
    const name = data.name === 'value' || data.name === 'amount' ? (label || data.name) : data.name;
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95">
        <p className="text-sm font-semibold" style={{ color }}>{name} : {currency(data.value)}</p>
      </div>
    );
  }
  return null;
};

const ActivityIcon = ({ type }) => {
  switch (type) {
    case 'payment': return <Wallet size={16} className="text-emerald-500" />;
    case 'invoice': return <Receipt size={16} className="text-indigo-500" />;
    case 'customer': return <Building2 size={16} className="text-blue-500" />;
    case 'aging': return <Clock size={16} className="text-amber-500" />;
    default: return <Bell size={16} className="text-slate-500" />;
  }
};

const MetricTile = ({ label, value, subtext }) => (
  <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-slate-200/60 bg-white/40 p-5 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/40">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</h3>
    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
    {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
  </motion.div>
);

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
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Executive Briefing</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">High-level insights for {user?.name}. Read-only access.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <Activity size={14} className="text-emerald-500" /> Live Data Sync Active
        </div>
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid gap-6">
        
        {/* Row 1: Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile label="Active Customers" value={data.metrics.totalCustomers} subtext="Total registered accounts" />
          <MetricTile label="Total Outstanding" value={currency(data.metrics.totalOutstanding)} subtext="Across all aging buckets" />
          <MetricTile label="Total Overdue" value={currency(data.metrics.totalOverdue)} subtext="Requires immediate attention" />
          <MetricTile label="Today's Collections" value={currency(data.metrics.todaysCollections)} subtext="Cleared in the last 24h" />
        </div>

        {/* Row 2: Charts */}
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/40">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Monthly Performance</h2>
              <span className="text-xs font-medium text-slate-400">YTD Collections</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
                  <Bar dataKey="collections" fill="#334155" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/40">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Aging Distribution</h2>
            </div>
            <div className="relative h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.aging} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={2} dataKey="value" stroke="none" animationDuration={1500}>
                    {data.aging.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-800 dark:text-white">
                  {currency(data.aging.reduce((sum, item) => sum + item.value, 0) || 0)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
              </div>
            </div>
          </section>
        </div>

        {/* Row 3: Activity Feed */}
        <section className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/40">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Live System Activity</h2>
            <span className="text-xs font-medium text-slate-400">Recent events across the platform</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.activities.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity found.</p>
            ) : (
              data.activities.map((activity, i) => (
                <motion.div key={activity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white/50 p-4 transition-colors hover:bg-white dark:border-slate-800/50 dark:bg-slate-800/20 dark:hover:bg-slate-800/50">
                  <div className="mt-1 rounded-full bg-slate-100 p-2 dark:bg-slate-800">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{activity.title}</h4>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {timeAgo(activity.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.message}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
