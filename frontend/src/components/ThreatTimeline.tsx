import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, NeonBadge } from './ui';
import { Clock, Zap, AlertTriangle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'threat' | 'blocked' | 'alert' | 'resolved';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  details?: Record<string, string>;
}

export default function ThreatTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      type: 'threat',
      severity: 'critical',
      title: 'SQL Injection Attack Detected',
      description: 'Attempted SQL injection on database server',
      details: {
        Source: '203.0.113.45',
        Target: '192.168.1.10',
        Method: 'GET /api/users?id=1 OR 1=1',
      },
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      type: 'blocked',
      severity: 'high',
      title: 'DDoS Attack Blocked',
      description: 'Distributed denial of service attack mitigated',
      details: {
        Packets: '50000+',
        Duration: '2m 30s',
        Status: 'Blocked',
      },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      type: 'alert',
      severity: 'medium',
      title: 'Suspicious Login Attempt',
      description: 'Multiple failed authentication attempts detected',
      details: {
        Account: 'admin',
        Attempts: '15',
        Location: 'China',
      },
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      type: 'resolved',
      severity: 'medium',
      title: 'Port Scan Resolved',
      description: 'Network port scanning activity traced and blocked',
      details: {
        Ports: '1-65535',
        Resolution: 'IP blocked',
      },
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      type: 'threat',
      severity: 'high',
      title: 'Malware Signature Detected',
      description: 'Known malware pattern identified in network traffic',
      details: {
        Signature: 'Trojan.Generic.A1B2C3',
        File: 'document.exe',
        Quarantined: 'Yes',
      },
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      type: 'alert',
      severity: 'low',
      title: 'Unusual Network Activity',
      description: 'Elevated data transfer detected on internal network',
      details: {
        Duration: '5 minutes',
        Volume: '2.5 GB',
        Status: 'Monitored',
      },
    },
  ]);

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const eventConfig = {
    threat: { icon: AlertTriangle, label: 'Threat', color: '#FF006E' },
    blocked: { icon: Zap, label: 'Blocked', color: '#00F5A0' },
    alert: { icon: Clock, label: 'Alert', color: '#FFBE0B' },
    resolved: { icon: Clock, label: 'Resolved', color: '#00D9FF' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <GlassCard className="p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Threat Event Timeline</span>
        </h1>
        <p className="text-gray-400">Real-time security events from the last 24 hours</p>
      </GlassCard>

      {/* Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-cyan via-neon-pink to-transparent opacity-30" />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const config = eventConfig[event.type];
            const IconComponent = config.icon;
            const isExpanded = expandedEvent === event.id;

            return (
              <motion.div
                key={event.id}
                variants={itemVariants}
                className="relative"
              >
                {/* Timeline marker */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 -translate-x-1/2">
                  <motion.div
                    className="w-8 h-8 rounded-full border-2 border-cyber-dark flex items-center justify-center bg-cyber-card z-10"
                    style={{ borderColor: config.color }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <IconComponent size={16} style={{ color: config.color }} />
                  </motion.div>
                </div>

                {/* Content */}
                <motion.div
                  className={`ml-16 md:ml-0 md:${index % 2 === 0 ? 'mr' : 'ml'}-1/2`}
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  whileHover={{ x: index % 2 === 0 ? 10 : -10 }}
                >
                  <GlassCard
                    className="p-5 cursor-pointer"
                    hover={true}
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          <NeonBadge severity={event.severity} label={event.severity.toUpperCase()} />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{event.description}</p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Clock size={12} />
                      {new Date(event.timestamp).toLocaleString()}
                    </div>

                    {/* Details - Expandable */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: isExpanded ? 'auto' : 0,
                        opacity: isExpanded ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {event.details && (
                        <div className="pt-3 border-t border-cyber-border space-y-2">
                          {Object.entries(event.details).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-2 gap-4 text-sm">
                              <span className="text-gray-500">{key}:</span>
                              <span className="font-mono text-gray-300">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Expand indicator */}
                    {event.details && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-neon-cyan mt-2 text-xs"
                      >
                        {isExpanded ? '▲ Hide details' : '▼ Show details'}
                      </motion.div>
                    )}
                  </GlassCard>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Events', value: events.length },
          { label: 'Critical', value: events.filter((e) => e.severity === 'critical').length },
          { label: 'Blocked', value: events.filter((e) => e.type === 'blocked').length },
          { label: 'Resolved', value: events.filter((e) => e.type === 'resolved').length },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4 text-center">
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-neon-cyan">{stat.value}</p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Legend */}
      <GlassCard className="p-6">
        <h3 className="font-bold mb-4">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(eventConfig).map(([type, config]) => (
            <motion.div
              key={type}
              className="flex items-center gap-2"
              whileHover={{ x: 4 }}
            >
              <config.icon size={16} style={{ color: config.color }} />
              <span className="text-sm capitalize">{config.label}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
