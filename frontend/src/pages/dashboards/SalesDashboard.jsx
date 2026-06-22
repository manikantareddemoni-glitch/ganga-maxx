import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';
import { Users, FileSignature, Target, PhoneCall, TrendingUp, Building2, MapPin } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { useAuth } from '../../context/AuthContext';
import { currency } from '../../lib/format';

const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];

const mockData = {
  metrics: {
    activeCustomers: 342,
    pendingRequests: 12,
    followUps: 8,
    conversionRate: 24
  },
  regionalSales: [
    { region: 'Hyderabad Central', sales: 4500000 },
    { region: 'Secunderabad', sales: 3200000 },
    { region: 'Kukatpally', sales: 2800000 },
    { region: 'Gachibowli', sales: 1900000 }
  ],
  topClients: [
    { id: 1, client: 'Apollo Hospitals', revenue: 1250000, growth: '+12%' },
    { id: 2, client: 'Taj Hotels', revenue: 980000, growth: '+8%' },
    { id: 3, client: 'Metro Fresh Retail', revenue: 850000, growth: '-2%' }
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

export default function SalesDashboard() {
  const { user } = useAuth();
  const data = mockData;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Sales Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here is your regional sales activity overview.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Customers" value={data.metrics.activeCustomers} icon={Users} tone="brand" delay={0.02} />
        <KpiCard label="Pending Credit Requests" value={data.metrics.pendingRequests} icon={FileSignature} tone="amber" delay={0.06} />
        <KpiCard label="Follow-ups Today" value={data.metrics.followUps} icon={PhoneCall} tone="cyan" delay={0.1} />
        <KpiCard label="Conversion Rate" value={`${data.metrics.conversionRate}%`} icon={Target} tone="emerald" delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Regional Performance</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">Sales by Zone</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.regionalSales} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <YAxis dataKey="region" type="category" width={120} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148,163,184,0.05)'}} />
                <Bar dataKey="sales" radius={[0, 8, 8, 0]} animationDuration={1500} animationEasing="ease-out">
                  {data.regionalSales.map((item, index) => <Cell key={item.region} fill={colors[index]} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-emerald-300 dark:hover:border-emerald-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Top Performing Clients</h2>
          <div className="space-y-4">
            {data.topClients.map((client, i) => (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, ease: 'easeOut' }} key={client.id} className="group/item flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{client.client}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                      <TrendingUp size={12} /> {client.growth}
                    </p>
                  </div>
                </div>
                <div className="text-right font-bold text-slate-900 dark:text-white">
                  {currency(client.revenue)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}
