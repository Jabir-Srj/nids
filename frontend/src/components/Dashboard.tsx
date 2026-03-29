import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { AlertCircle, TrendingUp, Package, Activity } from 'lucide-react'

interface TrafficData {
  time: string
  inbound: number
  outbound: number
  anomalies: number
}

interface Threat {
  id: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: string
  source: string
}

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

export default function Dashboard() {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([
    { time: '00:00', inbound: 1200, outbound: 800, anomalies: 2 },
    { time: '01:00', inbound: 1900, outbound: 1200, anomalies: 5 },
    { time: '02:00', inbound: 1600, outbound: 900, anomalies: 3 },
    { time: '03:00', inbound: 2100, outbound: 1400, anomalies: 8 },
    { time: '04:00', inbound: 1800, outbound: 1100, anomalies: 4 },
    { time: '05:00', inbound: 2400, outbound: 1600, anomalies: 12 },
  ])

  const [threats, setThreats] = useState<Threat[]>([
    {
      id: '1',
      type: 'SQL Injection',
      severity: 'critical',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      source: '192.168.1.105',
    },
    {
      id: '2',
      type: 'Port Scanning',
      severity: 'high',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      source: '192.168.1.110',
    },
    {
      id: '3',
      type: 'XSS Attack',
      severity: 'medium',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      source: '192.168.1.115',
    },
    {
      id: '4',
      type: 'Anomaly Detected',
      severity: 'low',
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      source: '192.168.1.120',
    },
  ])

  const [stats, setStats] = useState({
    totalPackets: 125430,
    threatsDetected: 42,
    rulesActive: 90,
    mlAccuracy: 97.2,
  })

  // Simulate live traffic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData((prev) => {
        const newData = [...prev.slice(1)]
        const now = new Date()
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        newData.push({
          time,
          inbound: Math.floor(Math.random() * 2000 + 1000),
          outbound: Math.floor(Math.random() * 1500 + 500),
          anomalies: Math.floor(Math.random() * 15),
        })

        return newData
      })

      setStats((prev) => ({
        ...prev,
        totalPackets: prev.totalPackets + Math.floor(Math.random() * 500),
        threatsDetected: prev.threatsDetected + (Math.random() > 0.7 ? 1 : 0),
        mlAccuracy: Math.min(99.9, prev.mlAccuracy + Math.random() * 0.1),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const threatDistribution = [
    { name: 'Critical', value: 5, color: COLORS.critical },
    { name: 'High', value: 12, color: COLORS.high },
    { name: 'Medium', value: 15, color: COLORS.medium },
    { name: 'Low', value: 10, color: COLORS.low },
  ]

  const protocolDistribution = [
    { name: 'TCP', value: 45 },
    { name: 'UDP', value: 30 },
    { name: 'ICMP', value: 15 },
    { name: 'Other', value: 10 },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="Total Packets"
          value={stats.totalPackets.toLocaleString()}
          trend="+12.5%"
          color="blue"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="Threats Detected"
          value={stats.threatsDetected}
          trend="+8.2%"
          color="red"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Active Rules"
          value={stats.rulesActive}
          trend="100%"
          color="green"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          label="ML Accuracy"
          value={`${stats.mlAccuracy.toFixed(1)}%`}
          trend="+0.5%"
          color="purple"
        />
      </div>

      {/* Live Traffic Graph */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">Network Traffic (Live)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trafficData}>
            <defs>
              <linearGradient id="inbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="inbound"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#inbound)"
              name="Inbound (packets/s)"
            />
            <Area
              type="monotone"
              dataKey="outbound"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#outbound)"
              name="Outbound (packets/s)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Anomalies Timeline */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">Anomalies Detected</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="anomalies"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Anomaly Events"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">Threat Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={threatDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {threatDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Protocol Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">Protocol Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={protocolDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="value" fill="#3b82f6" name="Packets (%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">Recent Threats</h2>
        <div className="space-y-3">
          {threats.map((threat) => (
            <div
              key={threat.id}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-3 h-3 rounded-full`}
                  style={{ backgroundColor: COLORS[threat.severity] }}
                ></div>
                <div>
                  <p className="font-semibold">{threat.type}</p>
                  <p className="text-sm text-gray-400">From: {threat.source}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize`}
                  style={{
                    backgroundColor: COLORS[threat.severity] + '33',
                    color: COLORS[threat.severity],
                  }}
                >
                  {threat.severity}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(threat.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend: string
  color: string
}

function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-700',
    red: 'bg-red-900/20 border-red-700',
    green: 'bg-green-900/20 border-green-700',
    purple: 'bg-purple-900/20 border-purple-700',
  }

  return (
    <div className={`rounded-lg p-6 border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className="text-xs text-green-400 mt-1">{trend}</p>
        </div>
        <div className="text-3xl opacity-50">{icon}</div>
      </div>
    </div>
  )
}
