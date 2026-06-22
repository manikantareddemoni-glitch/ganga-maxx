import { motion } from 'framer-motion';

export function RippleButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ opacity: 0.8 }}
      className={`relative isolate overflow-hidden ${className}`}
      {...props}
    >
      <motion.span
        className="absolute inset-0 -z-10 bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1.8, opacity: [0, 0.35, 0] }}
        transition={{ duration: 0.45 }}
      />
      <span className="absolute inset-0 -z-20 bg-[linear-gradient(110deg,rgba(255,255,255,0),rgba(255,255,255,0.2),rgba(255,255,255,0))] bg-[length:200%_100%] animate-shimmer mix-blend-overlay pointer-events-none" />
      {children}
    </motion.button>
  );
}
