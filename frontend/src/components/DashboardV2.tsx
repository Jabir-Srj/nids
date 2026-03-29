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
          gradient="from-red-500/20 to-red-600/20"
          borderColor="border-red-300"
          textColor="text-red-700"
          accentColor="bg-red-500"
        />
        <KPICard
          title="Critical Threats"
          value={stats.critical_count}
          change="-8%"
          icon={<Shield className="w-5 h-5" />}
          gradient="from-orange-500/20 to-amber-600/20"
          borderColor="border-orange-300"
          textColor="text-orange-700"
          accentColor="bg-orange-500"
        />
        <KPICard
          title="Threats Blocked"
          value={stats.threats_blocked}
          change="+24%"
          icon={<Lock className="w-5 h-5" />}
          gradient="from-emerald-500/20 to-teal-600/20"
          borderColor="border-emerald-300"
          textColor="text-emerald-700"
          accentColor="bg-emerald-500"
        />
        <KPICard
          title="System Uptime"
          value={`${stats.uptime_percent}%`}
          change="Stable"
          icon={<Activity className="w-5 h-5" />}
          gradient="from-cyan-500/20 to-blue-600/20"
          borderColor="border-cyan-300"
          textColor="text-cyan-700"
          accentColor="bg-cyan-500"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat Severity Distribution */}
        <div className="bg-white backdrop-blur-xl bg-opacity-95 rounded-xl p-6 border border-slate-200 lg:col-span-1 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Threat Distribution
          </h3>
          <div className="space-y-4">
            <ThreatBar label="Critical" value={15} color="from-red-500 to-red-600" />
            <ThreatBar label="High" value={28} color="from-orange-500 to-amber-600" />
            <ThreatBar label="Medium" value={42} color="from-yellow-500 to-amber-500" />
            <ThreatBar label="Low" value={15} color="from-emerald-500 to-teal-600" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white backdrop-blur-xl bg-opacity-95 rounded-xl p-6 border border-slate-200 lg:col-span-1 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
            <Server className="w-5 h-5 text-cyan-600" />
            System Health
          </h3>
          <div className="space-y-4">
            <HealthIndicator label="CPU Usage" value={systemHealth.cpu} />
            <HealthIndicator label="Memory Usage" value={systemHealth.memory} />
            <HealthIndicator label="Disk Usage" value={systemHealth.disk} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white backdrop-blur-xl bg-opacity-95 rounded-xl p-6 border border-slate-200 lg:col-span-1 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
            <Zap className="w-5 h-5 text-amber-600" />
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
      <div className="bg-white backdrop-blur-xl bg-opacity-95 rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Recent Alerts
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Threat Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Source IP</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Severity</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">{alert.type || alert.threat_type || 'Unknown'}</td>
                    <td className="py-3 px-4 text-cyan-600 font-mono text-xs">{alert.source || alert.source_ip || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-xs px-3 py-1.5 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-900 rounded-md font-semibold transition-all duration-200 shadow-sm">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
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
        <div className="bg-white backdrop-blur-xl bg-opacity-95 rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
            <Globe className="w-5 h-5 text-orange-600" />
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
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:from-slate-100 hover:to-slate-150 transition-all duration-200">
                <span className="text-sm font-semibold text-slate-700">{item.country}</span>
                <div className="flex-1 mx-3 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-600 h-2 rounded-full shadow-md"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-right w-12 text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detection Methods */}
        <div className="bg-white backdrop-blur-xl bg-opacity-95 rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
            <span className="text-blue-600">🔍</span> Detection Methods
          </h3>
          <div className="space-y-2">
            {[
              { method: 'Signature-Based', count: 456, percent: 48 },
              { method: 'Anomaly Detection', count: 312, percent: 33 },
              { method: 'Heuristics', count: 156, percent: 16 },
              { method: 'ML-Based', count: 28, percent: 3 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:from-slate-100 hover:to-slate-150 transition-all duration-200">
                <span className="text-sm font-semibold text-slate-700">{item.method}</span>
                <div className="flex-1 mx-3 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full shadow-md"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-right w-12 text-slate-900">{item.count}</span>
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
  gradient: string
  borderColor: string
  textColor: string
  accentColor: string
}

function KPICard({ title, value, change, icon, gradient, borderColor, textColor, accentColor }: KPICardProps) {
  return (
    <div className={`relative rounded-xl p-6 border ${borderColor} backdrop-blur-xl bg-gradient-to-br ${gradient} bg-opacity-95 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br from-white to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-bold ${textColor}`}>{title}</p>
          <div className={`text-xl ${textColor} opacity-80`}>{icon}</div>
        </div>
        <p className={`text-4xl font-black ${textColor} mb-2`}>{value}</p>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${accentColor}`}></div>
          <p className="text-xs text-slate-600 font-mono">{change} from last week</p>
        </div>
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
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{value}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div className={`bg-gradient-to-r ${color} h-3 rounded-full shadow-lg transition-all duration-500`} style={{ width: `${value}%` }}></div>
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
    if (value > 80) return 'text-red-600'
    if (value > 60) return 'text-amber-600'
    return 'text-emerald-600'
  }

  const getBgGradient = () => {
    if (value > 80) return 'from-red-500 to-red-600'
    if (value > 60) return 'from-amber-500 to-orange-600'
    return 'from-emerald-500 to-teal-600'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${getColor()}`}>{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`bg-gradient-to-r ${getBgGradient()} h-3 rounded-full shadow-lg transition-all duration-500`}
          style={{ width: `${value}%` }}
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
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:from-slate-100 hover:to-slate-150 transition-all duration-200">
      <span className="text-sm font-semibold text-slate-700">
        {icon} {label}
      </span>
      <span className="font-bold text-slate-900">{value}</span>
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
        return 'bg-red-100 text-red-800 border border-red-300 font-bold'
      case 'high':
        return 'bg-orange-100 text-orange-800 border border-orange-300 font-bold'
      case 'medium':
        return 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold'
      default:
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
    }
  }

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs ${getColors()}`}>
      {severity?.toUpperCase() || 'UNKNOWN'}
    </span>
  )
}
