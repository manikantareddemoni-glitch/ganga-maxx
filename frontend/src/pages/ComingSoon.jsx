import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export default function ComingSoon({ title = "Coming Soon" }) {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-24 h-24 mb-6 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
        >
          <Construction size={48} strokeWidth={1.5} />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4"
        >
          {title}
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto"
        >
          We're working hard to bring you this feature. It will be available in an upcoming update.
        </motion.p>
      </div>
    </PageTransition>
  );
}
