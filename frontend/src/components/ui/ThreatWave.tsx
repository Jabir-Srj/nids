import React from 'react';
import { motion } from 'framer-motion';

interface ThreatWaveProps {
  color?: 'cyan' | 'pink' | 'yellow' | 'green';
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  cyan: 'rgba(0, 217, 255, 0.6)',
  pink: 'rgba(255, 0, 110, 0.6)',
  yellow: 'rgba(255, 190, 11, 0.6)',
  green: 'rgba(0, 245, 160, 0.6)',
};

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 60, height: 60 },
  lg: { width: 80, height: 80 },
};

export const ThreatWave: React.FC<ThreatWaveProps> = ({ color = 'cyan', count = 3, size = 'md' }) => {
  const dimensions = sizeMap[size];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 100 100"
        className="absolute"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.circle
            key={i}
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke={colorMap[color]}
            strokeWidth="1.5"
            initial={{ r: 20, opacity: 1 }}
            animate={{ r: 45, opacity: 0 }}
            transition={{
              duration: 1.5,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>

      <motion.div
        className="relative w-4 h-4 rounded-full"
        style={{ backgroundColor: colorMap[color] }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};
