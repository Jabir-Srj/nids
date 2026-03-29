import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Filter, Download, Trash2, Check } from 'lucide-react';
import { GlassCard, NeonBadge } from './ui';

interface Alert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
  destination: string;
  message: string;
}

export default function AlertsPanelV2() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/alerts');
      if (res.ok) {
        const data = await res.json();
        const alertList = Array.isArray(data) ? data : data.alerts || [];

        const formatted = alertList.map((alert: any) => ({
          id: alert.id || Math.random().toString(),
          type: alert.threat_type || 'Unknown Threat',
          severity: (alert.severity?.toLowerCase() || 'low') as Alert['severity'],
          timestamp: alert.timestamp || new Date().toISOString(),
          source: alert.source_ip || alert.source || 'Unknown',
          destination: alert.dest_ip || alert.destination || 'Unknown',
          message: alert.message || 'Threat detected',
        }));

        setAlerts(formatted);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setLoading(false);
    }
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);
  const displayAlerts = filteredAlerts.slice(0, 20);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAlerts(newSelected);
  };

  const severityIconMap: Record<Alert['severity'], string> = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
    low: 'ℹ️',
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex gap-2 flex-wrap">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <motion.button
              key={sev}
              onClick={() => setFilter(sev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                filter === sev
                  ? 'glass-button-primary'
                  : 'glass-button'
              }`}
            >
              {sev}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button p-2.5"
            title="Filter alerts"
          >
            <Filter size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button p-2.5"
            title="Export alerts"
          >
            <Download size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-400">Loading alerts...</p>
          </GlassCard>
        ) : displayAlerts.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-gray-500" size={32} />
            <p className="text-gray-400">No alerts found</p>
          </GlassCard>
        ) : (
          <AnimatePresence>
            {displayAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className="p-4 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => toggleSelect(alert.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <motion.input
                      type="checkbox"
                      checked={selectedAlerts.has(alert.id)}
                      onChange={() => toggleSelect(alert.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-5 h-5 rounded cursor-pointer accent-neon-cyan"
                      whileHover={{ scale: 1.1 }}
                    />

                    {/* Severity Indicator */}
                    <div className="flex-shrink-0 text-2xl">
                      {severityIconMap[alert.severity]}
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold truncate">{alert.type}</h3>
                          <p className="text-sm text-gray-400 truncate">{alert.message}</p>
                        </div>
                        <NeonBadge
                          severity={alert.severity}
                          label={alert.severity.toUpperCase()}
                          pulse={alert.severity === 'critical'}
                        />
                      </div>

                      {/* IP Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <span className="text-gray-400">Source:</span>
                          <p className="font-mono text-neon-cyan">{alert.source}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Destination:</span>
                          <p className="font-mono text-neon-pink">{alert.destination}</p>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-md hover:bg-neon-green/10"
                        title="Resolve"
                      >
                        <Check size={16} className="text-neon-green" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-md hover:bg-neon-pink/10"
                        title="Dismiss"
                      >
                        <Trash2 size={16} className="text-neon-pink" />
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Summary */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 text-sm text-gray-400"
        >
          Showing {displayAlerts.length} of {filteredAlerts.length} alerts
        </motion.div>
      )}
    </div>
  );
}
