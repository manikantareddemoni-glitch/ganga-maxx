import { motion } from 'framer-motion';
import { Truck, CheckSquare, Clock, Package, MapPin } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { KpiCard } from '../components/KpiCard';

export default function Dispatch() {
  const dispatches = [
    { id: 'DSP-8821', order: 'ORD-2023-1001', client: 'Sri Balaji Traders', route: 'Hyderabad South', items: 45, status: 'loading', truck: 'AP 09 CB 1234' },
    { id: 'DSP-8822', order: 'ORD-2023-1003', client: 'Deccan Wholesale', route: 'Secunderabad', items: 110, status: 'pending', truck: 'Unassigned' },
    { id: 'DSP-8823', order: 'ORD-2023-1005', client: 'City Central Mall', route: 'Hitech City', items: 200, status: 'pending', truck: 'Unassigned' }
  ];

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dispatch Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Queue of approved orders ready for packaging and truck loading.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Pending Dispatch" value={12} icon={Clock} tone="amber" />
        <KpiCard label="Currently Loading" value={4} icon={Package} tone="cyan" delay={0.05} />
        <KpiCard label="Dispatched Today" value={28} icon={Truck} tone="emerald" delay={0.1} />
      </div>

      <div className="grid gap-4">
        {dispatches.map((dsp, idx) => (
          <motion.div 
            key={dsp.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-400 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
          >
            <div className="flex gap-4 items-center">
              <div className={`p-3 rounded-lg ${dsp.status === 'loading' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{dsp.id} <span className="text-sm font-normal text-slate-500">({dsp.order})</span></h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{dsp.client}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {dsp.route}</span>
                  <span className="flex items-center gap-1"><Truck size={12} /> {dsp.truck}</span>
                  <span className="font-semibold">{dsp.items} items</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Print Manifest
              </button>
              {dsp.status === 'pending' ? (
                <button className="flex-1 md:flex-none px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 shadow-glow transition-all">
                  Start Loading
                </button>
              ) : (
                <button className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2">
                  <CheckSquare size={16} /> Mark Dispatched
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
