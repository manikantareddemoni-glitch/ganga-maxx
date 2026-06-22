import { motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, UserPlus, FileText } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { dashboard } from '../data/mockData';

const getIconAndColor = (type) => {
  if (type === 'payment' || type === 'success') return { Icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-500/30', hoverBg: 'from-emerald-500/10 dark:from-emerald-400/5', hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-500/30' };
  if (type === 'invoice') return { Icon: AlertTriangle, bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-200 dark:ring-rose-500/30', hoverBg: 'from-rose-500/10 dark:from-rose-400/5', hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-500/30' };
  if (type === 'customer') return { Icon: UserPlus, bg: 'bg-sky-100 dark:bg-sky-500/20', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-200 dark:ring-sky-500/30', hoverBg: 'from-sky-500/10 dark:from-sky-400/5', hoverBorder: 'hover:border-sky-300 dark:hover:border-sky-500/30' };
  if (type === 'statement') return { Icon: FileText, bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-200 dark:ring-indigo-500/30', hoverBg: 'from-indigo-500/10 dark:from-indigo-400/5', hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-500/30' };
  return { Icon: Bell, bg: 'bg-slate-100 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-500/30', hoverBg: 'from-brand-500/10 dark:from-brand-400/5', hoverBorder: 'hover:border-brand-300 dark:hover:border-brand-500/30' };
};

export default function Notifications() {
  const { liveEvents = [] } = useOutletContext() || {};
  const items = [...liveEvents, ...dashboard.activities];

  return (
    <PageTransition>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6"><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-slate-500 dark:text-slate-400">Real-time overdue, payment, and customer alerts.</p></motion.div>
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-blue-300 dark:hover:border-blue-500/30 md:p-8">
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-blue-500/10 dark:from-blue-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative border-l-2 border-slate-100 pl-6 dark:border-white/10 md:ml-4">
          {items.map((item, index) => {
            const { Icon, bg, text, ring, hoverBg, hoverBorder } = getIconAndColor(item.type);
            return (
              <motion.div initial={{ opacity: 0, x: -20, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }} key={`${item.id}-${index}`} className="group/item relative mb-8 last:mb-0">
                <div className={`absolute -left-[43px] top-1 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-slate-900 dark:ring-slate-900`}>
                  <motion.div whileHover={{ scale: 1.15, rotate: item.type === 'payment' ? 0 : 10 }} className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} ${text} ring-1 ${ring}`}>
                    <Icon size={16} />
                  </motion.div>
                </div>
                <div className={`relative flex flex-col overflow-hidden gap-1 rounded-xl border border-slate-200 bg-white/50 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-hover dark:border-white/5 dark:bg-white/5 ${hoverBorder}`}>
                  <div className={`absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${hoverBg} to-transparent opacity-0 transition-opacity duration-300 group-hover/item:opacity-100`} />
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold text-slate-800 transition-colors group-hover/item:text-slate-900 dark:text-white dark:group-hover/item:text-white">{item.title}</p>
                    <span className="whitespace-nowrap text-xs font-medium text-slate-400">{item.createdAt || 'Just now'}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors group-hover/item:text-slate-700 dark:group-hover/item:text-slate-300">{item.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </PageTransition>
  );
}
