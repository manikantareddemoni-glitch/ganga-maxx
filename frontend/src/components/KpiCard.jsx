import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { compact } from '../lib/format';

export function KpiCard({ label, value, icon: Icon, tone = 'indigo', money = false, delay = 0 }) {
  const tones = {
    indigo: 'from-brand-500 to-indigo-700',
    brand: 'from-brand-500 to-indigo-700',
    cyan: 'from-cyan-400 to-sky-600',
    amber: 'from-amber-400 to-orange-600',
    rose: 'from-rose-400 to-pink-600',
    emerald: 'from-emerald-400 to-teal-600'
  };

  const hoverBgTones = {
    indigo: 'from-brand-500/10 dark:from-brand-400/5',
    brand: 'from-brand-500/10 dark:from-brand-400/5',
    cyan: 'from-cyan-500/10 dark:from-cyan-400/5',
    amber: 'from-amber-500/10 dark:from-amber-400/5',
    rose: 'from-rose-500/10 dark:from-rose-400/5',
    emerald: 'from-emerald-500/10 dark:from-emerald-400/5'
  };

  const hoverBorderTones = {
    indigo: 'hover:border-brand-300 dark:hover:border-brand-500/30',
    brand: 'hover:border-brand-300 dark:hover:border-brand-500/30',
    cyan: 'hover:border-cyan-300 dark:hover:border-cyan-500/30',
    amber: 'hover:border-amber-300 dark:hover:border-amber-500/30',
    rose: 'hover:border-rose-300 dark:hover:border-rose-500/30',
    emerald: 'hover:border-emerald-300 dark:hover:border-emerald-500/30'
  };

  const glowColors = {
    indigo: 'rgba(99,102,241,0.25)',
    brand: 'rgba(99,102,241,0.25)',
    cyan: 'rgba(6,182,212,0.25)',
    amber: 'rgba(245,158,11,0.25)',
    rose: 'rgba(244,63,94,0.25)',
    emerald: 'rgba(16,185,129,0.25)'
  };

  const parsedValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : Number(value || 0);

  return (
    <motion.div
      className={`glass-panel group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover ${hoverBorderTones[tone]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
      style={{ '--hover-glow': glowColors[tone] }}
    >
      <div className={`absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${hoverBgTones[tone]} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      
      {/* Subtle pulsing background glow behind the card */}
      <motion.div 
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full mix-blend-multiply blur-2xl dark:mix-blend-screen opacity-0 transition-opacity duration-500 group-hover:opacity-60 dark:group-hover:opacity-40" 
        style={{ backgroundColor: glowColors[tone].replace('0.25', '1') }}
        animate={{ scale: [1, 1.2, 1], opacity: [0, 0.6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-200">{label}</p>
          <div className="mt-3 text-2xl font-bold text-slate-950 dark:text-white transition-colors group-hover:text-slate-900 dark:group-hover:text-white">
            {money && <span className="mr-0.5">₹</span>}
            <CountUp
              end={parsedValue}
              duration={1.5}
              separator=","
              decimals={money && parsedValue % 1 !== 0 ? 2 : 0}
              formattingFn={money ? undefined : compact}
            />
          </div>
        </div>
        
        <div className="relative">
          <motion.div 
            className={`absolute inset-0 rounded-lg bg-gradient-to-br ${tones[tone]} opacity-40 blur-md`}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div whileHover={{ scale: 1.15, rotate: 10 }} transition={{ type: "spring", stiffness: 300 }} className={`relative z-10 rounded-lg bg-gradient-to-br ${tones[tone]} p-3 text-white shadow-glow transition-transform`}>
            <Icon size={20} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
