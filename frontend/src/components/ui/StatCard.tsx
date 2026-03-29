import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { direction: 'up' | 'down'; value: number };
  color?: 'cyan' | 'pink' | 'green' | 'yellow' | 'purple';
  onClick?: () => void;
}

const colorConfig = {
  cyan: { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.24)', text: '#06b6d4' },
  pink: { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.24)', text: '#ec4899' },
  green: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.24)', text: '#10b981' },
  yellow: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.24)', text: '#f59e0b' },
  purple: { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.24)', text: '#a855f7' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'cyan',
  onClick,
}) => {
  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="glass-card p-6 cursor-pointer border"
      style={{
        background: config.bg,
        borderColor: config.border,
        borderWidth: '1px',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2">{title}</p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-3xl font-bold"
            style={{ color: config.text }}
          >
            {value}
          </motion.div>
        </div>
        {icon && (
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ color: config.text }}
          >
            {icon}
          </motion.div>
        )}
      </div>

      {trend && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1 text-sm"
          style={{
            color: trend.direction === 'up' ? '#10b981' : '#ec4899',
          }}
        >
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{trend.value}%</span>
        </motion.div>
      )}
    </motion.div>
  );
};
