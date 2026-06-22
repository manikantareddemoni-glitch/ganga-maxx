import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, CheckCircle2, AlertTriangle, Route } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { KpiCard } from '../../components/KpiCard';
import { useAuth } from '../../context/AuthContext';

const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E'];

const mockData = {
  metrics: {
    activeFleet: 18,
    todaysDeliveries: 124,
    delayed: 3,
    completed: 82
  },
  deliveryTrend: [
    { time: '08:00', deliveries: 12 },
    { time: '10:00', deliveries: 28 },
    { time: '12:00', deliveries: 45 },
    { time: '14:00', deliveries: 65 },
    { time: '16:00', deliveries: 82 },
  ],
  fleetStatus: [
    { name: 'On Route', value: 12 },
    { name: 'Returning', value: 4 },
    { name: 'Maintenance', value: 2 }
  ],
  activeRoutes: [
    { id: 1, driver: 'Raju G.', route: 'Hyderabad Central', status: 'On Time', progress: '65%' },
    { id: 2, driver: 'Venkat M.', route: 'Secunderabad East', status: 'Delayed', progress: '30%' },
    { id: 3, driver: 'Srinivas K.', route: 'Kukatpally Industrial', status: 'On Time', progress: '85%' }
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

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const data = mockData;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">Delivery Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here is your logistics and fleet overview.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Fleet" value={data.metrics.activeFleet} icon={Truck} tone="brand" delay={0.02} />
        <KpiCard label="Today's Deliveries" value={data.metrics.todaysDeliveries} icon={Package} tone="cyan" delay={0.06} />
        <KpiCard label="Completed" value={data.metrics.completed} icon={CheckCircle2} tone="emerald" delay={0.1} />
        <KpiCard label="Delayed" value={data.metrics.delayed} icon={AlertTriangle} tone="rose" delay={0.14} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Delivery Velocity</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">Today's Progress</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.deliveryTrend}>
                <defs><linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} /><stop offset="95%" stopColor="#4F46E5" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="deliveries" stroke="#4F46E5" strokeWidth={3} fill="url(#delGrad)" animationDuration={2000} animationEasing="ease-in-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-amber-300 dark:hover:border-amber-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Live Routes</h2>
          <div className="space-y-4">
            {data.activeRoutes.map((route, i) => (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, ease: 'easeOut' }} key={route.id} className="group/item p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-brand-500" />
                    <p className="font-semibold text-sm">{route.driver}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${route.status === 'Delayed' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40'}`}>
                    {route.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Route size={12} /> {route.route}
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${route.status === 'Delayed' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: route.progress }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
      
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr]">
        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-sky-300 dark:hover:border-sky-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-sky-500/10 dark:from-sky-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <h2 className="mb-5 text-lg font-bold">Fleet Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.fleetStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={5} animationDuration={1100}>
                  {data.fleetStatus.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {data.fleetStatus.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm font-semibold">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}
