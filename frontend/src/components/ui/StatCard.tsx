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
  cyan: { bg: 'rgba(0, 217, 255, 0.1)', border: 'rgba(0, 217, 255, 0.3)', text: '#00D9FF' },
  pink: { bg: 'rgba(255, 0, 110, 0.1)', border: 'rgba(255, 0, 110, 0.3)', text: '#FF006E' },
  green: { bg: 'rgba(0, 245, 160, 0.1)', border: 'rgba(0, 245, 160, 0.3)', text: '#00F5A0' },
  yellow: { bg: 'rgba(255, 190, 11, 0.1)', border: 'rgba(255, 190, 11, 0.3)', text: '#FFBE0B' },
  purple: { bg: 'rgba(157, 78, 221, 0.1)', border: 'rgba(157, 78, 221, 0.3)', text: '#9D4EDD' },
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
      className="glass-card p-6 cursor-pointer"
      style={{
        background: config.bg,
        borderColor: config.border,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
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
            color: trend.direction === 'up' ? '#00F5A0' : '#FF006E',
          }}
        >
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{trend.value}%</span>
        </motion.div>
      )}
    </motion.div>
  );
};
