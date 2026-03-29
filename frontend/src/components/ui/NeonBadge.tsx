import React from 'react';
import { motion } from 'framer-motion';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface NeonBadgeProps {
  severity: Severity;
  label: string;
  icon?: React.ReactNode;
  pulse?: boolean;
}

const severityConfig: Record<Severity, { class: string; label: string }> = {
  critical: { class: 'badge-critical', label: 'Critical' },
  high: { class: 'badge-high', label: 'High' },
  medium: { class: 'badge-medium', label: 'Medium' },
  low: { class: 'badge-low', label: 'Low' },
  info: { class: 'badge-info', label: 'Info' },
};

export const NeonBadge: React.FC<NeonBadgeProps> = ({ severity, label, icon, pulse = false }) => {
  const config = severityConfig[severity];

  return (
    <motion.div
      className={`${config.class} ${pulse ? 'animate-pulse-glow' : ''}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </motion.div>
  );
};
