import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NotificationToast({ notifications }) {
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    if (notifications.length > 0) {
      setVisible(notifications[0]);
      const timer = setTimeout(() => {
        setVisible(null);
      }, 4000); // Hide after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-white/20 bg-slate-950/92 p-4 text-white shadow-2xl backdrop-blur" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 32 }}>
          <Bell className="mt-0.5 text-aqua" size={18} />
          <div>
            <p className="text-sm font-semibold">{visible.title}</p>
            <p className="mt-1 text-xs text-slate-300">{visible.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
