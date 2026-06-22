import { motion } from 'framer-motion';
import { Target, TrendingUp, IndianRupee, Trophy } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { KpiCard } from '../components/KpiCard';
import { currency } from '../lib/format';

export default function Targets() {
  const quotas = [
    { period: 'Q1 2023', target: 5000000, achieved: 5200000, commission: 156000, status: 'exceeded' },
    { period: 'Q2 2023', target: 6000000, achieved: 5800000, commission: 116000, status: 'missed' },
    { period: 'Q3 2023', target: 6500000, achieved: 6800000, commission: 204000, status: 'exceeded' },
    { period: 'Q4 2023 (Current)', target: 7000000, achieved: 4500000, commission: 90000, status: 'on-track' }
  ];

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sales Targets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track your performance quotas and estimated commissions.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="YTD Target" value={24500000} icon={Target} tone="indigo" money />
        <KpiCard label="YTD Achieved" value={22300000} icon={TrendingUp} tone="emerald" money delay={0.05} />
        <KpiCard label="Total Commission" value={566000} icon={IndianRupee} tone="amber" money delay={0.1} />
        <KpiCard label="Rank in Region" value="2nd" icon={Trophy} tone="rose" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {quotas.map((q, idx) => {
          const percent = Math.min(Math.round((q.achieved / q.target) * 100), 100);
          return (
            <motion.section 
              key={q.period}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ y: -4 }} 
              className="glass-panel group relative rounded-xl p-6 transition-all duration-300 hover:shadow-glow-hover"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">{q.period}</h3>
                  <p className="text-sm text-slate-500">Target: {currency(q.target)}</p>
                </div>
                <div className="text-right">
                  <h3 className={`text-lg font-bold ${q.status === 'exceeded' ? 'text-emerald-500' : q.status === 'missed' ? 'text-rose-500' : 'text-brand-500'}`}>
                    {currency(q.achieved)}
                  </h3>
                  <p className="text-sm font-medium text-amber-500">Com: {currency(q.commission)}</p>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.5, delay: 0.2 + (0.1 * idx), ease: "easeOut" }}
                  className={`h-3 rounded-full ${q.status === 'exceeded' ? 'bg-emerald-500' : q.status === 'missed' ? 'bg-rose-500' : 'bg-brand-500'}`}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-bold">
                <span>0%</span>
                <span>{percent}% Achieved</span>
                <span>100%</span>
              </div>
            </motion.section>
          )
        })}
      </div>
    </PageTransition>
  );
}
