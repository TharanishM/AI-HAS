import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true, delay = 0 }) => {
  const surfaceClass = hoverEffect ? 'glass-card glass-card-interactive' : 'glass-panel';

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className={`${surfaceClass} rounded-2xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
