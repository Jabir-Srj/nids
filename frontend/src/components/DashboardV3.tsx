import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Shield, TrendingUp, Server, Zap, Globe, Lock } from 'lucide-react';
import { GlassCard, StatCard, AnimatedCounter, ThreatWave, PulseRing } from './ui';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  total_alerts: number;
  critical_count: number;
  threats_blocked: number;
  uptime_percent: number;
  packet_rate: number;
  detection_rate: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function DashboardV3() {
  const [stats, setStats] = useState<DashboardStats>({
    total_alerts: 0,
    critical_count: 0,
    threats_blocked: 0,
    uptime_percent: 99.8,
    packet_rate: 0,
    detection_rate: 98.5,
  });

  const [chartData, setChartData] = useState([
    { time: '00:00', alerts: 12, critical: 2, high: 4 },
    { time: '04:00', alerts: 19, critical: 3, high: 6 },
    { time: '08:00', alerts: 25, critical: 4, high: 8 },
    { time: '12:00', alerts: 32, critical: 5, high: 10 },
    { time: '16:00', alerts: 28, critical: 4, high: 9 },
    { time: '20:00', alerts: 24, critical: 3, high: 7 },
    { time: '24:00', alerts: 18, critical: 2, high: 5 },
  ]);

  const [threatTypes, setThreatTypes] = useState([
    { name: 'SQL Injection', value: 35, color: '#FF006E' },
    { name: 'XSS Attacks', value: 28, color: '#FFBE0B' },
    { name: 'DDoS', value: 22, color: '#00D9FF' },
    { name: 'Malware', value: 15, color: '#00F5A0' },
  ]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const alertsRes = await fetch('http://localhost:5000/api/alerts');
      if (alertsRes.ok) {
        const alertData = await alertsRes.json();
        const alerts = Array.isArray(alertData) ? alertData : alertData.alerts || [];

        const total = alerts.length;
        const critical = alerts.filter((a: any) => a.severity?.toLowerCase() === 'critical').length;
        const high = alerts.filter((a: any) => a.severity?.toLowerCase() === 'high').length;

        setStats({
          total_alerts: total,
          critical_count: critical,
          threats_blocked: high,
          uptime_percent: 99.8,
          packet_rate: total * 100,
          detection_rate: 98.5,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-xs">
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section with Animated Threat Visualization */}
      <motion.div
        variants={itemVariants}
        className="glass-card-lg p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="grid-pattern absolute inset-0" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient">Network Intrusion Detection</span>
              </h1>
              <p className="text-gray-400 text-lg">Real-time threat monitoring & response</p>
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity }}>
              <div className="w-24 h-24 rounded-full border-2 border-neon-cyan/30">
                <ThreatWave color="cyan" size="lg" count={3} />
              </div>
            </motion.div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{ backgroundColor: 'rgba(0, 217, 255, 0.1)', borderLeft: '3px solid #00D9FF' }}
            >
              <PulseRing color="cyan" intensity="high" size={40} />
              <div>
                <p className="text-sm text-gray-400">System Status</p>
                <p className="text-lg font-bold text-neon-cyan">Online & Monitoring</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{ backgroundColor: 'rgba(0, 245, 160, 0.1)', borderLeft: '3px solid #00F5A0' }}
            >
              <ThreatWave color="green" size="md" count={2} />
              <div>
                <p className="text-sm text-gray-400">Detection Engine</p>
                <p className="text-lg font-bold text-neon-green">Active</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{ backgroundColor: 'rgba(157, 78, 221, 0.1)', borderLeft: '3px solid #9D4EDD' }}
            >
              <PulseRing color="purple" intensity="medium" size={40} />
              <div>
                <p className="text-sm text-gray-400">Threat Level</p>
                <p className="text-lg font-bold text-neon-purple">Medium</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards - Top Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alerts"
          value={<AnimatedCounter value={stats.total_alerts} duration={2} suffix="+" />}
          icon={<AlertTriangle size={24} />}
          trend={{ direction: 'up', value: 12 }}
          color="pink"
        />
        <StatCard
          title="Critical Threats"
          value={<AnimatedCounter value={stats.critical_count} duration={2} />}
          icon={<Shield size={24} />}
          trend={{ direction: 'down', value: 8 }}
          color="cyan"
        />
        <StatCard
          title="Threats Blocked"
          value={<AnimatedCounter value={stats.threats_blocked} duration={2} />}
          icon={<Zap size={24} />}
          trend={{ direction: 'up', value: 15 }}
          color="green"
        />
        <StatCard
          title="System Uptime"
          value={<AnimatedCounter value={stats.uptime_percent} duration={2} decimals={1} suffix="%" />}
          icon={<Server size={24} />}
          trend={{ direction: 'up', value: 0.2 }}
          color="yellow"
        />
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Timeline */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4 text-neon-cyan">Alert Timeline (24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="alerts"
                stroke="#00D9FF"
                fillOpacity={1}
                fill="url(#colorAlerts)"
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Threat Distribution */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4 text-neon-yellow">Threat Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={threatTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive
              >
                {threatTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Bottom Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neon-cyan">Packet Rate</h3>
            <Activity className="text-neon-cyan" size={20} />
          </div>
          <p className="text-3xl font-bold mb-2">
            <AnimatedCounter value={stats.packet_rate} duration={2} suffix=" pps" />
          </p>
          <p className="text-sm text-gray-400">Packets per second</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neon-green">Detection Rate</h3>
            <TrendingUp className="text-neon-green" size={20} />
          </div>
          <p className="text-3xl font-bold mb-2">
            <AnimatedCounter value={stats.detection_rate} duration={2} decimals={1} suffix="%" />
          </p>
          <p className="text-sm text-gray-400">Real-time detection accuracy</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neon-pink">Active Protocols</h3>
            <Globe className="text-neon-pink" size={20} />
          </div>
          <p className="text-3xl font-bold mb-2">
            <AnimatedCounter value={42} duration={2} />
          </p>
          <p className="text-sm text-gray-400">Network protocols monitored</p>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
