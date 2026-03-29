import React, { useState, useEffect } from 'react';
import { Alert } from '../types';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  subtext?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  subtext,
}) => {
  return (
    <div className={`${color} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">{title}</p>
          <p className="text-3xl font-bold mt-2 text-slate-50">{value.toLocaleString()}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 ${trend >= 0 ? 'text-pink-300' : 'text-green-300'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour
            </p>
          )}
          {subtext && <p className="text-xs mt-1 text-slate-300">{subtext}</p>}
        </div>
        <div className="text-4xl opacity-30">{icon}</div>
      </div>
    </div>
  );
};

interface ThreatSummaryProps {
  stats: {
    total_alerts: number;
    critical_alerts: number;
    high_alerts: number;
    medium_alerts: number;
    low_alerts: number;
  };
}

export const ThreatSummary: React.FC<ThreatSummaryProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <SummaryCard
        title="Total Alerts"
        value={stats.total_alerts}
        icon="🚨"
        color="bg-gradient-to-br from-slate-700 to-slate-900 text-white"
        trend={5}
      />
      <SummaryCard
        title="Critical"
        value={stats.critical_alerts}
        icon="⚠️"
        color="bg-gradient-to-br from-red-900 to-red-950 text-white"
        trend={12}
      />
      <SummaryCard
        title="High"
        value={stats.high_alerts}
        icon="🔴"
        color="bg-gradient-to-br from-orange-900 to-orange-950 text-white"
        trend={8}
      />
      <SummaryCard
        title="Medium"
        value={stats.medium_alerts}
        icon="🟡"
        color="bg-gradient-to-br from-yellow-900 to-yellow-950 text-white"
        trend={-3}
      />
      <SummaryCard
        title="Low"
        value={stats.low_alerts}
        icon="🟢"
        color="bg-gradient-to-br from-green-900 to-green-950 text-white"
        trend={-5}
      />
    </div>
  );
};

interface LiveMetricsProps {
  packets_per_sec: number;
  bytes_per_sec: number;
  active_threats: number;
}

export const LiveMetrics: React.FC<LiveMetricsProps> = ({
  packets_per_sec,
  bytes_per_sec,
  active_threats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-lg p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-200">Packets/sec</p>
        <p className="text-3xl font-bold mt-2 text-slate-50">{packets_per_sec.toLocaleString()}</p>
        <div className="mt-4 h-1 bg-slate-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 animate-pulse"
            style={{
              width: `${Math.min((packets_per_sec / 100000) * 100, 100)}%`,
              animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-lg p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-200">Bytes/sec</p>
        <p className="text-3xl font-bold mt-2 text-slate-50">{(bytes_per_sec / 1024 / 1024).toFixed(2)} MB/s</p>
        <p className="text-xs mt-4 text-slate-400">Network throughput</p>
      </div>

      <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-lg p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-200">Active Threats</p>
        <p className="text-3xl font-bold mt-2 text-slate-50">{active_threats}</p>
        <p className="text-xs mt-4 text-slate-400">Currently monitoring</p>
      </div>
    </div>
  );
};

interface RecentAlertsTableProps {
  alerts: Alert[];
  onAlertClick: (alert: Alert) => void;
  loading?: boolean;
}

export const RecentAlertsTable: React.FC<RecentAlertsTableProps> = ({
  alerts,
  onAlertClick,
  loading = false,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-900 text-red-100 dark:bg-red-900 dark:text-red-100';
      case 'HIGH':
        return 'bg-orange-900 text-orange-100 dark:bg-orange-900 dark:text-orange-100';
      case 'MEDIUM':
        return 'bg-yellow-900 text-yellow-100 dark:bg-yellow-900 dark:text-yellow-100';
      case 'LOW':
        return 'bg-green-900 text-green-100 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-slate-700 text-slate-200 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-slate-700 dark:bg-slate-700 border-b border-slate-600 dark:border-slate-600">
        <h3 className="text-lg font-semibold text-slate-100 dark:text-slate-100">Recent Alerts</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700 dark:bg-slate-700 border-b border-slate-600 dark:border-slate-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300 dark:text-slate-300">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300 dark:text-slate-300">
                Source IP
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300 dark:text-slate-300">
                Threat Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300 dark:text-slate-300">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-300 dark:text-slate-300">
                Protocol
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 dark:divide-slate-700">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-slate-400 dark:text-slate-400">
                  No alerts yet
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => onAlertClick(alert)}
                  className="hover:bg-slate-700 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-300 dark:text-slate-300">
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-300 dark:text-slate-300">
                    {alert.src_ip}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 dark:text-slate-300">
                    {alert.threat_type}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-300 dark:text-slate-300">
                    {alert.protocol.toUpperCase()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
