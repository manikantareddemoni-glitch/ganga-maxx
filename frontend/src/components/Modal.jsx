import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div 
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-6 shadow-[0_0_40px_rgba(99,102,241,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80" 
            initial={{ scale: 0.94, y: 20, rotateX: 10 }} 
            animate={{ scale: 1, y: 0, rotateX: 0 }} 
            exit={{ scale: 0.96, y: 16, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          >
            {/* Decorative background glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
            
            <div className="relative z-10 mb-5 flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-white/10">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-cyan-500 dark:from-brand-400 dark:to-cyan-300">
                {title}
              </h2>
              <button className="rounded-full bg-slate-100 p-2 text-slate-500 transition-all hover:bg-rose-100 hover:text-rose-600 hover:rotate-90 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-rose-500/20 dark:hover:text-rose-400" onClick={onClose} title="Close">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
