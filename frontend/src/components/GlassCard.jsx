import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${hoverEffect ? 'glass-card' : 'glass-panel'} p-6 rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
