import { motion } from 'framer-motion';

export function PageTransition({ children }) {
  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(8px)' }} 
      animate={{ opacity: 1, filter: 'blur(0px)' }} 
      exit={{ opacity: 0, filter: 'blur(8px)' }} 
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
