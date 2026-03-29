import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TimelinePoint } from '../types';

interface ThreatTimelineProps {
  data: TimelinePoint[];
}

export const ThreatTimeline: React.FC<ThreatTimelineProps> = ({ data }) => {
  return (
    <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 text-slate-100 dark:text-slate-100">
        Threat Timeline (24h)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="timestamp" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: '#f1f5f9',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="critical"
            stackId="1"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorCritical)"
            name="Critical"
          />
          <Area
            type="monotone"
            dataKey="high"
            stackId="1"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#colorHigh)"
            name="High"
          />
          <Area
            type="monotone"
            dataKey="medium"
            stackId="1"
            stroke="#f59e0b"
            fillOpacity={1}
            fill="url(#colorMedium)"
            name="Medium"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TopThreatsProps {
  data: Array<{ type: string; count: number }>;
}

export const TopThreats: React.FC<TopThreatsProps> = ({ data }) => {
  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4'];

  return (
    <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 text-slate-100 dark:text-slate-100">
        Top Threat Types
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ type, count, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: '#f1f5f9',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TopAttackersProps {
  data: Array<{ ip: string; count: number }>;
}

export const TopAttackers: React.FC<TopAttackersProps> = ({ data }) => {
  return (
    <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-100 dark:text-slate-100">
        Top Attacking IPs
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="ip" stroke="#cbd5e1" angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: '#f1f5f9',
            }}
          />
          <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ProtocolDistributionProps {
  data: Array<{ protocol: string; count: number }>;
}

export const ProtocolDistribution: React.FC<ProtocolDistributionProps> = ({ data }) => {
  const COLORS = ['#06b6d4', '#ec4899', '#a855f7', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-100 dark:text-slate-100">
        Protocol Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ protocol, percent }) => `${protocol}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: '#f1f5f9',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
