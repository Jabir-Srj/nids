import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, PulseRing } from './ui';
import { Zap, Lock, AlertCircle } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  type: 'firewall' | 'server' | 'client' | 'external' | 'threat';
  status: 'secure' | 'warning' | 'critical';
  x: number;
  y: number;
}

interface NetworkConnection {
  from: string;
  to: string;
  threat_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  packets: number;
}

export default function NetworkTopologyV2() {
  const [nodes, setNodes] = useState<NetworkNode[]>([
    { id: 'fw1', name: 'Firewall', type: 'firewall', status: 'secure', x: 50, y: 20 },
    { id: 'srv1', name: 'API Server', type: 'server', status: 'secure', x: 30, y: 50 },
    { id: 'srv2', name: 'DB Server', type: 'server', status: 'secure', x: 70, y: 50 },
    { id: 'cli1', name: 'Client 1', type: 'client', status: 'secure', x: 20, y: 80 },
    { id: 'cli2', name: 'Client 2', type: 'client', status: 'warning', x: 50, y: 80 },
    { id: 'ext1', name: 'External', type: 'external', status: 'critical', x: 80, y: 80 },
  ]);

  const [connections, setConnections] = useState<NetworkConnection[]>([
    { from: 'fw1', to: 'srv1', threat_level: 'none', packets: 1024 },
    { from: 'fw1', to: 'srv2', threat_level: 'none', packets: 512 },
    { from: 'srv1', to: 'cli1', threat_level: 'low', packets: 256 },
    { from: 'srv1', to: 'cli2', threat_level: 'medium', packets: 768 },
    { from: 'ext1', to: 'fw1', threat_level: 'critical', packets: 2048 },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodeTypeConfig = {
    firewall: { icon: '🛡️', color: '#00D9FF' },
    server: { icon: '🖥️', color: '#00F5A0' },
    client: { icon: '💻', color: '#9D4EDD' },
    external: { icon: '🌐', color: '#FF006E' },
    threat: { icon: '⚠️', color: '#FF6B35' },
  };

  const statusConfig = {
    secure: { icon: Lock, color: '#00F5A0' },
    warning: { icon: AlertCircle, color: '#FFBE0B' },
    critical: { icon: Zap, color: '#FF006E' },
  };

  const threatColor: Record<string, string> = {
    none: '#00F5A0',
    low: '#FFBE0B',
    medium: '#FF6B35',
    high: '#FF006E',
    critical: '#FF006E',
  };

  const SVGWidth = 500;
  const SVGHeight = 400;

  return (
    <div className="space-y-6">
      {/* Network Diagram */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-4 text-neon-cyan flex items-center gap-2">
          <Zap size={20} />
          Network Topology Map
        </h2>

        <motion.svg
          width="100%"
          height={SVGHeight}
          viewBox={`0 0 ${SVGWidth} ${SVGHeight}`}
          className="border border-cyber-border rounded-lg"
          style={{ backgroundColor: 'rgba(5, 8, 16, 0.3)' }}
        >
          {/* Draw connections */}
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const x1 = (fromNode.x / 100) * SVGWidth;
            const y1 = (fromNode.y / 100) * SVGHeight;
            const x2 = (toNode.x / 100) * SVGWidth;
            const y2 = (toNode.y / 100) * SVGHeight;

            return (
              <motion.g key={`${conn.from}-${conn.to}`}>
                {/* Animated line */}
                <motion.line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={threatColor[conn.threat_level]}
                  strokeWidth="2"
                  opacity="0.6"
                  strokeDasharray="5,5"
                  animate={{
                    strokeDashoffset: [-10, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                {/* Label */}
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 10}
                  fill="#9ca3af"
                  fontSize="12"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {conn.packets}
                </text>
              </motion.g>
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const x = (node.x / 100) * SVGWidth;
            const y = (node.y / 100) * SVGHeight;
            const config = nodeTypeConfig[node.type];

            return (
              <motion.g
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className="cursor-pointer"
                whileHover={{ scale: 1.15 }}
              >
                {/* Node circle with glow */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="25"
                  fill={config.color}
                  opacity="0.15"
                  animate={selectedNode === node.id ? { r: [25, 35, 25] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />

                {/* Node border */}
                <circle
                  cx={x}
                  cy={y}
                  r="22"
                  fill="none"
                  stroke={config.color}
                  strokeWidth="2"
                />

                {/* Icon */}
                <text
                  x={x}
                  y={y + 7}
                  fontSize="20"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {config.icon}
                </text>

                {/* Label */}
                <text
                  x={x}
                  y={y + 40}
                  fontSize="12"
                  textAnchor="middle"
                  fill="#e0e6ff"
                  className="pointer-events-none"
                >
                  {node.name}
                </text>

                {/* Status indicator */}
                {node.status !== 'secure' && (
                  <motion.circle
                    cx={x + 18}
                    cy={y - 18}
                    r="6"
                    fill={statusConfig[node.status].color}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.g>
            );
          })}
        </motion.svg>
      </GlassCard>

      {/* Nodes Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedNode(node.id)}
            className="glass-card p-4 cursor-pointer"
            style={{
              borderColor:
                selectedNode === node.id
                  ? nodeTypeConfig[node.type].color
                  : 'rgba(0, 217, 255, 0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{nodeTypeConfig[node.type].icon}</span>
              <div className="flex-1">
                <p className="font-semibold">{node.name}</p>
                <p className="text-xs text-gray-400 capitalize">{node.type}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <div className="flex items-center gap-2">
                  {React.createElement(statusConfig[node.status].icon, {
                    size: 14,
                    color: statusConfig[node.status].color,
                  })}
                  <span style={{ color: statusConfig[node.status].color }}>
                    {node.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {node.status !== 'secure' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 rounded-md"
                  style={{ backgroundColor: 'rgba(255, 0, 110, 0.1)' }}
                >
                  <p className="text-xs text-neon-pink font-semibold">⚠️ Requires attention</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connection Info */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-4 text-neon-yellow">Active Connections</h3>
        <div className="space-y-3">
          {connections.map((conn, idx) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: `${threatColor[conn.threat_level]}15` }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="font-mono text-sm">
                    {fromNode?.name} → {toNode?.name}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${threatColor[conn.threat_level]}20`,
                      color: threatColor[conn.threat_level],
                    }}
                  >
                    {conn.threat_level.toUpperCase()}
                  </span>
                  <span className="text-gray-400 text-sm">{conn.packets} packets</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
