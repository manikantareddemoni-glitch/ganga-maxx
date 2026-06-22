import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, CreditCard, Clock } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export default function RiskAlerts() {
  const alerts = [
    { id: 1, type: 'credit_exceeded', client: 'Metro Fresh Retail', desc: 'Outstanding amount ₹1.2M exceeds credit limit by 20%.', severity: 'critical', time: '1 hour ago', icon: CreditCard },
    { id: 2, type: 'payment_default', client: 'Deccan Wholesale Co.', desc: 'Failed payment for Invoice #INV-8820. 45 days overdue.', severity: 'high', time: '3 hours ago', icon: Clock },
    { id: 3, type: 'unusual_activity', client: 'Royal Enterprises', desc: 'Order volume spiked 300% above historical monthly average.', severity: 'medium', time: '1 day ago', icon: AlertTriangle }
  ];

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Risk Alerts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Automated system flags for compliance and financial risk.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold rounded-lg hover:bg-emerald-200 transition-colors">
          <ShieldCheck size={18} /> Acknowledge All
        </button>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert, idx) => {
          const Icon = alert.icon;
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';
          
          return (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-panel p-5 rounded-xl border ${isCritical ? 'border-rose-500/50 bg-rose-50/50 dark:bg-rose-900/10' : isHigh ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10' : 'border-slate-200 dark:border-white/10'} flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden`}
            >
              <div className={`p-3 rounded-full shrink-0 ${isCritical ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : isHigh ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400'}`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{alert.client}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isCritical ? 'bg-rose-500 text-white' : isHigh ? 'bg-amber-500 text-white' : 'bg-cyan-500 text-white'}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-2">{alert.desc}</p>
                <p className="text-xs font-semibold text-slate-500">{alert.time}</p>
              </div>
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                  Review Account
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  Dismiss
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </PageTransition>
  );
}
