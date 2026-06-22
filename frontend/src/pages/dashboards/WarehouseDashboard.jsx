import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Package, Truck, Boxes, AlertTriangle, IndianRupee, Clock, Zap } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { useAuth } from '../../context/AuthContext';
import { currency } from '../../lib/format';

const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];

const mockData = {
  metrics: {
    inventoryValue: 12500000,
    dispatchesPending: 42,
    incomingShipments: 8,
    lowStockAlerts: 15
  },
  inventoryTrend: [
    { month: 'Jan', value: 10000000 },
    { month: 'Feb', value: 11000000 },
    { month: 'Mar', value: 10500000 },
    { month: 'Apr', value: 11800000 },
    { month: 'May', value: 12000000 },
    { month: 'Jun', value: 12500000 },
  ],
  categories: [
    { name: 'Floor Cleaners', value: 4500000 },
    { name: 'Disinfectants', value: 3200000 },
    { name: 'Paper Products', value: 2100000 },
    { name: 'Dispensers', value: 1500000 },
    { name: 'Trash Bags', value: 1200000 }
  ],
  urgentDispatches: [
    { id: 1, client: 'Apollo Hospitals', order: 'ORD-9932', status: 'Picking', time: 'Overdue by 2 hrs' },
    { id: 2, client: 'Taj Hotels', order: 'ORD-9945', status: 'Packing', time: 'Due in 1 hr' },
    { id: 3, client: 'Inorbit Mall', order: 'ORD-9950', status: 'Ready to Ship', time: 'Due in 3 hrs' }
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

export default function WarehouseDashboard() {
  const { user } = useAuth();
  const data = mockData;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Warehouse Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here is your live operations overview.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Inventory Value" value={data.metrics.inventoryValue} icon={IndianRupee} tone="cyan" money delay={0.02} />
        <KpiCard label="Pending Dispatches" value={data.metrics.dispatchesPending} icon={Package} tone="brand" delay={0.06} />
        <KpiCard label="Incoming Shipments" value={data.metrics.incomingShipments} icon={Truck} tone="emerald" delay={0.1} />
        <KpiCard label="Low Stock Alerts" value={data.metrics.lowStockAlerts} icon={AlertTriangle} tone="rose" delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Inventory Value Trend</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">YTD Performance</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.inventoryTrend}>
                <defs><linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} /><stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={3} fill="url(#invGrad)" animationDuration={2000} animationEasing="ease-in-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-rose-300 dark:hover:border-rose-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Urgent Dispatches</h2>
          <div className="space-y-4">
            {data.urgentDispatches.map((dispatch, i) => (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, ease: 'easeOut' }} key={dispatch.id} className="group/item flex gap-4 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all cursor-pointer">
                <div className="w-10 h-10 shrink-0 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Zap size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{dispatch.client}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300 px-2 py-0.5 rounded-full">{dispatch.status}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 truncate mt-0.5">{dispatch.order}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                    <Clock size={12} /> {dispatch.time}
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
          <h2 className="mb-5 text-lg font-bold">Inventory by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148,163,184,0.05)'}} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500} animationEasing="ease-out">
                  {data.categories.map((item, index) => <Cell key={item.name} fill={colors[index]} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}
