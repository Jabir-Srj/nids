import { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Shield,
  Server,
  Zap,
  Globe,
  Lock,
} from 'lucide-react'

interface DashboardStats {
  total_alerts: number
  critical_count: number
  threats_blocked: number
  uptime_percent: number
  packet_rate: number
  detection_rate: number
}

export default function DashboardV2() {
  const [stats, setStats] = useState<DashboardStats>({
    total_alerts: 0,
    critical_count: 0,
    threats_blocked: 0,
    uptime_percent: 0,
    packet_rate: 0,
    detection_rate: 0,
  })
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
  })

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch alerts and calculate stats
      const alertsRes = await fetch('http://localhost:5000/api/alerts')
      if (alertsRes.ok) {
        const alertData = await alertsRes.json()
        const alerts = Array.isArray(alertData) ? alertData : alertData.alerts || []
        
        setRecentAlerts(alerts.slice(0, 5))
        
        // Calculate stats from alerts
        const total = alerts.length
        const critical = alerts.filter((a: any) => a.severity?.toLowerCase() === 'critical').length
        const high = alerts.filter((a: any) => a.severity?.toLowerCase() === 'high').length
        
        setStats({
          total_alerts: total,
          critical_count: critical,
          threats_blocked: high,
          uptime_percent: 99.8,
          packet_rate: total * 100,
          detection_rate: 98.5,
        })
      }

      // Fetch system health
      const healthRes = await fetch('http://localhost:5000/api/system/health')
      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setSystemHealth({
          cpu: healthData.system?.cpu?.percent || 0,
          memory: healthData.system?.memory?.percent || 0,
          disk: healthData.system?.disk?.percent || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Alerts"
          value={stats.total_alerts}
          change="+12%"
          icon={<AlertTriangle className="w-5 h-5" />}
          severity="critical"
        />
        <KPICard
          title="Critical Threats"
          value={stats.critical_count}
          change="-8%"
          icon={<Shield className="w-5 h-5" />}
          severity="warning"
        />
        <KPICard
          title="Threats Blocked"
          value={stats.threats_blocked}
          change="+24%"
          icon={<Lock className="w-5 h-5" />}
          severity="success"
        />
        <KPICard
          title="System Uptime"
          value={`${stats.uptime_percent}%`}
          change="Stable"
          icon={<Activity className="w-5 h-5" />}
          severity="info"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat Severity Distribution */}
        <div
          className="rounded-lg p-6 border transition-all duration-300 hover:shadow-md"
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(229, 227, 224)',
          }}
        >
          <h3 className="text-lg font-serif-display font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#d97706' }} />
            Threat Distribution
          </h3>
          <div className="space-y-4">
            <ThreatBar label="Critical" value={15} color="#f97316" />
            <ThreatBar label="High" value={28} color="#d97706" />
            <ThreatBar label="Medium" value={42} color="#fcd34d" />
            <ThreatBar label="Low" value={15} color="#22c55e" />
          </div>
        </div>

        {/* System Health */}
        <div
          className="rounded-lg p-6 border transition-all duration-300 hover:shadow-md"
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(229, 227, 224)',
          }}
        >
          <h3 className="text-lg font-serif-display font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
            <Server className="w-5 h-5" style={{ color: '#3b82f6' }} />
            System Health
          </h3>
          <div className="space-y-4">
            <HealthIndicator label="CPU Usage" value={systemHealth.cpu} />
            <HealthIndicator label="Memory Usage" value={systemHealth.memory} />
            <HealthIndicator label="Disk Usage" value={systemHealth.disk} />
          </div>
        </div>

        {/* Quick Stats */}
        <div
          className="rounded-lg p-6 border transition-all duration-300 hover:shadow-md"
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(229, 227, 224)',
          }}
        >
          <h3 className="text-lg font-serif-display font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
            <Zap className="w-5 h-5" style={{ color: '#f97316' }} />
            Performance
          </h3>
          <div className="space-y-3">
            <StatRow label="Packet Rate" value={`${stats.packet_rate} pps`} icon="📊" />
            <StatRow label="Detection Rate" value={`${stats.detection_rate.toFixed(1)}%`} icon="🎯" />
            <StatRow label="Response Time" value="<100ms" icon="⚡" />
            <StatRow label="Cache Hit Rate" value="94.2%" icon="💾" />
          </div>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div
        className="rounded-lg p-6 border transition-all duration-300 hover:shadow-md"
        style={{
          backgroundColor: 'rgb(255, 255, 255)',
          borderColor: 'rgb(229, 227, 224)',
        }}
      >
        <h3 className="text-lg font-serif-display font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
          <AlertTriangle className="w-5 h-5" style={{ color: '#f97316' }} />
          Recent Alerts
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderColor: 'rgb(229, 227, 224)' }} className="border-b">
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#6b6b6b' }}>Time</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#6b6b6b' }}>Threat Type</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#6b6b6b' }}>Source IP</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#6b6b6b' }}>Severity</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#6b6b6b' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert, idx) => (
                  <tr
                    key={idx}
                    className="border-b transition-colors duration-200 hover:bg-[#f5f3f0]"
                    style={{ borderColor: 'rgb(229, 227, 224)' }}
                  >
                    <td
                      className="py-3 px-4 font-code text-xs"
                      style={{ color: '#6b6b6b' }}
                    >
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-semibold" style={{ color: '#1a1a1a' }}>
                      {alert.type || alert.threat_type || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 font-code text-xs" style={{ color: '#d97706' }}>
                      {alert.source || alert.source_ip || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="text-xs px-3 py-1.5 rounded-md font-semibold transition-all duration-200 hover:shadow-sm"
                        style={{
                          backgroundColor: 'rgb(245, 243, 240)',
                          color: '#1a1a1a',
                          border: '1px solid rgb(229, 227, 224)',
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center" style={{ color: '#6b6b6b' }}>
                    No alerts yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Attack Origins */}
        <div
          className="rounded-lg p-6 border transition-all duration-300 hover:shadow-md"
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(229, 227, 224)',
          }}
        >
          <h3 className="text-lg font-serif-display font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
            <Globe className="w-5 h-5" style={{ color: '#f97316' }} />
            Top Attack Origins
          </h3>
          <div className="space-y-2">
            {[
              { country: 'China', count: 245, percent: 35 },
              { country: 'Russia', count: 189, percent: 27 },
              { country: 'India', count: 124, percent: 18 },
              { country: 'Brazil', count: 98, percent: 14 },
              { country: 'Others', count: 44, percent: 6 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-md transition-all duration-200"
                style={{
                  backgroundColor: 'rgb(245, 243, 240)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(237, 233, 230)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
                }}
              >
                <span className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>
                  {item.country}
                </span>
                <div className="flex-1 mx-3 rounded-full h-2" style={{ backgroundColor: 'rgb(229, 227, 224)' }}>
                  <div
                    className="h-2 rounded-full shadow-sm"
                    style={{ width: `${item.percent}%`, backgroundColor: '#f97316' }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-right w-12" style={{ color: '#1a1a1a' }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detection Methods */}
        <div
          className="rounded-lg p-6 border transition-all duration-300 hover:shadow-md"
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(229, 227, 224)',
          }}
        >
          <h3 className="text-lg font-serif-display font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
            <span>🔍</span> Detection Methods
          </h3>
          <div className="space-y-2">
            {[
              { method: 'Signature-Based', count: 456, percent: 48 },
              { method: 'Anomaly Detection', count: 312, percent: 33 },
              { method: 'Heuristics', count: 156, percent: 16 },
              { method: 'ML-Based', count: 28, percent: 3 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-md transition-all duration-200"
                style={{
                  backgroundColor: 'rgb(245, 243, 240)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(237, 233, 230)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
                }}
              >
                <span className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>
                  {item.method}
                </span>
                <div className="flex-1 mx-3 rounded-full h-2" style={{ backgroundColor: 'rgb(229, 227, 224)' }}>
                  <div
                    className="h-2 rounded-full shadow-sm"
                    style={{ width: `${item.percent}%`, backgroundColor: '#3b82f6' }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-right w-12" style={{ color: '#1a1a1a' }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface KPICardProps {
  title: string
  value: number | string
  change: string
  icon: React.ReactNode
  severity: 'critical' | 'warning' | 'success' | 'info'
}

function KPICard({ title, value, change, icon, severity }: KPICardProps) {
  const getColors = () => {
    switch (severity) {
      case 'critical':
        return { bg: 'rgba(249, 115, 22, 0.08)', border: 'rgb(249, 115, 22)', accent: '#f97316', text: '#f97316' }
      case 'warning':
        return { bg: 'rgba(217, 119, 6, 0.08)', border: 'rgb(217, 119, 6)', accent: '#d97706', text: '#d97706' }
      case 'success':
        return { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgb(34, 197, 94)', accent: '#22c55e', text: '#22c55e' }
      default:
        return { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgb(59, 130, 246)', accent: '#3b82f6', text: '#3b82f6' }
    }
  }

  const colors = getColors()

  return (
    <div
      className="rounded-lg p-6 border transition-all duration-300 hover:shadow-md animate-scale-in"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-sm font-semibold"
          style={{ color: colors.text }}
        >
          {title}
        </p>
        <div style={{ color: colors.accent }}>
          {icon}
        </div>
      </div>
      <p
        className="text-3xl font-serif-display font-bold mb-2"
        style={{ color: '#1a1a1a' }}
      >
        {value}
      </p>
      <div className="flex items-center gap-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.accent }}
        ></div>
        <p
          className="text-xs font-code"
          style={{ color: '#6b6b6b' }}
        >
          {change} from last week
        </p>
      </div>
    </div>
  )
}

interface ThreatBarProps {
  label: string
  value: number
  color: string
}

function ThreatBar({ label, value, color }: ThreatBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>
          {label}
        </span>
        <span
          className="text-sm font-bold px-2 py-0.5 rounded"
          style={{
            backgroundColor: 'rgb(245, 243, 240)',
            color: '#1a1a1a',
          }}
        >
          {value}%
        </span>
      </div>
      <div
        className="w-full rounded-full h-3 overflow-hidden shadow-sm"
        style={{ backgroundColor: 'rgb(229, 227, 224)' }}
      >
        <div
          className="h-3 rounded-full shadow-md transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  )
}

interface HealthIndicatorProps {
  label: string
  value: number
}

function HealthIndicator({ label, value }: HealthIndicatorProps) {
  const getColor = () => {
    if (value > 80) return '#f97316'
    if (value > 60) return '#d97706'
    return '#22c55e'
  }

  const color = getColor()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {Math.round(value)}%
        </span>
      </div>
      <div
        className="w-full rounded-full h-3 overflow-hidden shadow-sm"
        style={{ backgroundColor: 'rgb(229, 227, 224)' }}
      >
        <div
          className="h-3 rounded-full shadow-md transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  )
}

interface StatRowProps {
  label: string
  value: string
  icon: string
}

function StatRow({ label, value, icon }: StatRowProps) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-md transition-all duration-200"
      style={{
        backgroundColor: 'rgb(245, 243, 240)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgb(237, 233, 230)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
      }}
    >
      <span className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>
        {icon} {label}
      </span>
      <span className="font-bold" style={{ color: '#1a1a1a' }}>
        {value}
      </span>
    </div>
  )
}

interface SeverityBadgeProps {
  severity: string
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  const getColors = () => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', border: '#f97316' }
      case 'high':
        return { bg: 'rgba(217, 119, 6, 0.1)', text: '#d97706', border: '#d97706' }
      case 'medium':
        return { bg: 'rgba(252, 211, 77, 0.1)', text: '#fcd34d', border: '#fcd34d' }
      default:
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: '#22c55e' }
    }
  }

  const colors = getColors()

  return (
    <span
      className="px-2.5 py-1 rounded-md text-xs font-bold border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {severity?.toUpperCase() || 'UNKNOWN'}
    </span>
  )
}
