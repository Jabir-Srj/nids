import React from 'react';
import { motion } from 'framer-motion';

interface PulseRingProps {
  color?: 'cyan' | 'pink' | 'green' | 'yellow';
  intensity?: 'low' | 'medium' | 'high';
  size?: number;
}

const colorMap = {
  cyan: { border: '#00D9FF', shadow: 'rgba(0, 217, 255, 0.5)' },
  pink: { border: '#FF006E', shadow: 'rgba(255, 0, 110, 0.5)' },
  green: { border: '#00F5A0', shadow: 'rgba(0, 245, 160, 0.5)' },
  yellow: { border: '#FFBE0B', shadow: 'rgba(255, 190, 11, 0.5)' },
};

const intensityMap = {
  low: { scale: [1, 1.3], duration: 3 },
  medium: { scale: [1, 1.5], duration: 2 },
  high: { scale: [1, 2], duration: 1.2 },
};

export const PulseRing: React.FC<PulseRingProps> = ({
  color = 'cyan',
  intensity = 'medium',
  size = 32,
}) => {
  const colors = colorMap[color];
  const timing = intensityMap[intensity];

  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          border: `2px solid ${colors.border}`,
          opacity: 0.8,
        }}
        animate={{ scale: timing.scale }}
        transition={{
          duration: timing.duration,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          border: `1px solid ${colors.border}`,
          opacity: 0.4,
        }}
        animate={{ scale: timing.scale }}
        transition={{
          duration: timing.duration,
          delay: 0.3,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      <motion.div
        className="relative rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          backgroundColor: colors.border,
          boxShadow: `0 0 20px ${colors.shadow}`,
        }}
        animate={{ scale: [1, 0.9, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};
