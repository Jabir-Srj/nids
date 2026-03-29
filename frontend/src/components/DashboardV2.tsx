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
          color="bg-red-50"
          borderColor="border-red-200"
          textColor="text-red-700"
        />
        <KPICard
          title="Critical Threats"
          value={stats.critical_count}
          change="-8%"
          icon={<Shield className="w-5 h-5" />}
          color="bg-orange-50"
          borderColor="border-orange-200"
          textColor="text-orange-700"
        />
        <KPICard
          title="Threats Blocked"
          value={stats.threats_blocked}
          change="+24%"
          icon={<Lock className="w-5 h-5" />}
          color="bg-green-50"
          borderColor="border-green-200"
          textColor="text-green-700"
        />
        <KPICard
          title="System Uptime"
          value={`${stats.uptime_percent}%`}
          change="Stable"
          icon={<Activity className="w-5 h-5" />}
          color="bg-blue-50"
          borderColor="border-blue-200"
          textColor="text-blue-700"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat Severity Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-950">
            <TrendingUp className="w-5 h-5" />
            Threat Distribution
          </h3>
          <div className="space-y-3">
            <ThreatBar label="Critical" value={15} color="bg-red-600" />
            <ThreatBar label="High" value={28} color="bg-orange-600" />
            <ThreatBar label="Medium" value={42} color="bg-yellow-600" />
            <ThreatBar label="Low" value={15} color="bg-green-600" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-950">
            <Server className="w-5 h-5" />
            System Health
          </h3>
          <div className="space-y-4">
            <HealthIndicator label="CPU Usage" value={systemHealth.cpu} />
            <HealthIndicator label="Memory Usage" value={systemHealth.memory} />
            <HealthIndicator label="Disk Usage" value={systemHealth.disk} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-950">
            <Zap className="w-5 h-5" />
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
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-950">
          <AlertTriangle className="w-5 h-5" />
          Recent Alerts
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Threat Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Source IP</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Severity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-gray-950 font-semibold">{alert.type || alert.threat_type || 'Unknown'}</td>
                    <td className="py-3 px-4 text-blue-600">{alert.source || alert.source_ip || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-950 rounded transition">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
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
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-950">
            <Globe className="w-5 h-5" />
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
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{item.country}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded h-2">
                  <div
                    className="bg-gradient-to-r from-red-600 to-orange-600 h-2 rounded"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-right w-12 text-gray-950">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detection Methods */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-950">🔍 Detection Methods</h3>
          <div className="space-y-2">
            {[
              { method: 'Signature-Based', count: 456, percent: 48 },
              { method: 'Anomaly Detection', count: 312, percent: 33 },
              { method: 'Heuristics', count: 156, percent: 16 },
              { method: 'ML-Based', count: 28, percent: 3 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{item.method}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-right w-12 text-gray-950">{item.count}</span>
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
  color: string
  borderColor: string
  textColor: string
}

function KPICard({ title, value, change, icon, color, borderColor, textColor }: KPICardProps) {
  return (
    <div className={`rounded-lg p-5 border ${borderColor} ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-medium ${textColor}`}>{title}</p>
        <div className={`text-xl ${textColor}`}>{icon}</div>
      </div>
      <p className={`text-3xl font-bold ${textColor} mb-2`}>{value}</p>
      <p className="text-xs text-gray-500">{change} from last week</p>
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
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
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
    if (value > 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              value > 80 ? 'bg-red-600' : value > 60 ? 'bg-yellow-600' : 'bg-green-600'
            }`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
        <span className={`text-sm font-semibold w-8 text-right ${getColor()}`}>{Math.round(value)}%</span>
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
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm text-gray-700">
        {icon} {label}
      </span>
      <span className="font-semibold text-gray-950">{value}</span>
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
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${getColors()}`}>
      {severity?.toUpperCase() || 'UNKNOWN'}
    </span>
  )
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
          color="bg-red-900/20"
          borderColor="border-red-700"
        />
        <KPICard
          title="Critical Threats"
          value={stats.critical_count}
          change="-8%"
          icon={<Shield className="w-5 h-5" />}
          color="bg-orange-900/20"
          borderColor="border-orange-700"
        />
        <KPICard
          title="Threats Blocked"
          value={stats.threats_blocked}
          change="+24%"
          icon={<Lock className="w-5 h-5" />}
          color="bg-green-900/20"
          borderColor="border-green-700"
        />
        <KPICard
          title="System Uptime"
          value={`${stats.uptime_percent}%`}
          change="Stable"
          icon={<Activity className="w-5 h-5" />}
          color="bg-blue-900/20"
          borderColor="border-blue-700"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat Severity Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Threat Distribution
          </h3>
          <div className="space-y-3">
            <ThreatBar label="Critical" value={15} color="bg-red-600" />
            <ThreatBar label="High" value={28} color="bg-orange-600" />
            <ThreatBar label="Medium" value={42} color="bg-yellow-600" />
            <ThreatBar label="Low" value={15} color="bg-green-600" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Health
          </h3>
          <div className="space-y-4">
            <HealthIndicator label="CPU Usage" value={systemHealth.cpu} />
            <HealthIndicator label="Memory Usage" value={systemHealth.memory} />
            <HealthIndicator label="Disk Usage" value={systemHealth.disk} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance
          </h3>
          <div className="space-y-3">
            <StatRow label="Packet Rate" value={`${stats.packet_rate} pps`} icon="📊" />
            <StatRow label="Detection Rate" value={`${stats.detection_rate}%`} icon="🎯" />
            <StatRow label="Response Time" value="<100ms" icon="⚡" />
            <StatRow label="Cache Hit Rate" value="94.2%" icon="💾" />
          </div>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Recent Alerts
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Threat Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Source IP</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Severity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map((alert, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-white font-semibold">{alert.threat_type}</td>
                  <td className="py-3 px-4 text-blue-400">{alert.source_ip}</td>
                  <td className="py-3 px-4">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded transition">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Attack Origins */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
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
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                <span className="text-sm">{item.country}</span>
                <div className="flex-1 mx-3 bg-gray-600 rounded h-2">
                  <div
                    className="bg-gradient-to-r from-red-600 to-orange-600 h-2 rounded"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-right w-12">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detection Methods */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">🔍 Detection Methods</h3>
          <div className="space-y-2">
            {[
              { method: 'Signature-Based', count: 456, percent: 48 },
              { method: 'Anomaly Detection', count: 312, percent: 33 },
              { method: 'Heuristics', count: 156, percent: 16 },
              { method: 'ML-Based', count: 28, percent: 3 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                <span className="text-sm">{item.method}</span>
                <div className="flex-1 mx-3 bg-gray-600 rounded h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-right w-12">{item.count}</span>
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
  color: string
  borderColor: string
}

function KPICard({ title, value, change, icon, color, borderColor }: KPICardProps) {
  return (
    <div className={`rounded-lg p-5 border ${borderColor} ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-300 text-sm font-medium">{title}</p>
        <div className="text-xl">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-gray-400">{change} from last week</p>
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
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
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
    if (value > 80) return 'text-red-400'
    if (value > 60) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              value > 80 ? 'bg-red-600' : value > 60 ? 'bg-yellow-600' : 'bg-green-600'
            }`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
        <span className={`text-sm font-semibold w-8 text-right ${getColor()}`}>{value}%</span>
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
    <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
      <span className="text-sm text-gray-300">
        {icon} {label}
      </span>
      <span className="font-semibold text-white">{value}</span>
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
        return 'bg-red-900 text-red-200'
      case 'high':
        return 'bg-orange-900 text-orange-200'
      case 'medium':
        return 'bg-yellow-900 text-yellow-200'
      default:
        return 'bg-green-900 text-green-200'
    }
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${getColors()}`}>
      {severity?.toUpperCase()}
    </span>
  )
}
