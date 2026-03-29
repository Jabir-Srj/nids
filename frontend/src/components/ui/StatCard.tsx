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
  cyan: { bg: 'rgba(0, 102, 204, 0.08)', border: 'rgba(0, 102, 204, 0.2)', text: '#0066cc' },
  pink: { bg: 'rgba(204, 0, 102, 0.08)', border: 'rgba(204, 0, 102, 0.2)', text: '#cc0066' },
  green: { bg: 'rgba(0, 102, 51, 0.08)', border: 'rgba(0, 102, 51, 0.2)', text: '#006633' },
  yellow: { bg: 'rgba(204, 136, 0, 0.08)', border: 'rgba(204, 136, 0, 0.2)', text: '#cc8800' },
  purple: { bg: 'rgba(102, 0, 204, 0.08)', border: 'rgba(102, 0, 204, 0.2)', text: '#6600cc' },
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
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
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
            color: trend.direction === 'up' ? '#006633' : '#cc0066',
          }}
        >
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{trend.value}%</span>
        </motion.div>
      )}
    </motion.div>
  );
};
