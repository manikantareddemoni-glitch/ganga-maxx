import { motion } from 'framer-motion';
import { Map, MapPin, Truck, Clock, Navigation } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { KpiCard } from '../components/KpiCard';

export default function DeliveryRoutes() {
  const routes = [
    { id: 'RT-101', area: 'Hyderabad South & Airport', driver: 'Rajesh Kumar', vehicle: 'AP 09 CB 1234', stops: 12, completed: 8, status: 'on-route', eta: '45 mins' },
    { id: 'RT-102', area: 'Secunderabad Central', driver: 'Srinivas Rao', vehicle: 'TS 07 EA 9988', stops: 8, completed: 8, status: 'completed', eta: '-' },
    { id: 'RT-103', area: 'Hitech City & Madhapur', driver: 'Mohammed Ali', vehicle: 'TS 08 FT 5566', stops: 15, completed: 2, status: 'delayed', eta: 'Traffic Delay' },
    { id: 'RT-104', area: 'Kukatpally Industrial', driver: 'Venkat Reddy', vehicle: 'AP 28 BC 3322', stops: 6, completed: 0, status: 'loading', eta: '-' }
  ];

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Delivery Routes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live fleet tracking and route assignment.</p>
        </div>
        <button className="primary-btn flex items-center gap-2"><Map size={16} /> Live Map View</button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Routes" value={14} icon={Navigation} tone="indigo" />
        <KpiCard label="Vehicles on Road" value={12} icon={Truck} tone="cyan" delay={0.05} />
        <KpiCard label="Delayed Routes" value={2} icon={Clock} tone="rose" delay={0.1} />
        <KpiCard label="Completed Stops" value={45} icon={MapPin} tone="emerald" delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {routes.map((rt, idx) => (
          <motion.div 
            key={rt.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-white/10 hover:shadow-glow-hover transition-all relative overflow-hidden"
          >
            {rt.status === 'delayed' && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />}
            {rt.status === 'completed' && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
            {rt.status === 'on-route' && <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{rt.id}</h3>
                <p className="text-sm text-slate-500">{rt.area}</p>
              </div>
              <div className={`px-2 py-1 text-xs font-bold rounded-full ${rt.status === 'on-route' ? 'bg-cyan-100 text-cyan-700' : rt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : rt.status === 'delayed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                {rt.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Truck size={14} /></div>
                <div>
                  <p className="font-semibold">{rt.driver}</p>
                  <p className="text-xs text-slate-500">{rt.vehicle}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Progress ({rt.completed}/{rt.stops} stops)</span>
                  <span className="font-bold">{Math.round((rt.completed/rt.stops)*100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${rt.status === 'completed' ? 'bg-emerald-500' : rt.status === 'delayed' ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${(rt.completed/rt.stops)*100}%` }} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <Clock size={14} /> Next ETA: <span className={rt.status === 'delayed' ? 'text-rose-500 font-bold' : 'text-slate-900 dark:text-white'}>{rt.eta}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
