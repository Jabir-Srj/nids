import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Download } from 'lucide-react'
import { alertsAPI } from '../services/api'

interface Alert {
  id: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: string
  source: string
  destination: string
  message: string
}

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await alertsAPI.getAll(50)
        const data = Array.isArray(res.data) ? res.data : res.data?.alerts || []

        const formattedAlerts = data.map((alert: any) => ({
          id: alert.id || Math.random().toString(),
          type: alert.type || 'Unknown Threat',
          severity: alert.severity || 'low',
          timestamp: alert.timestamp || new Date().toISOString(),
          source: alert.source_ip || alert.source || 'Unknown',
          destination: alert.dest_ip || alert.destination || 'Unknown',
          message: alert.message || 'Threat detected',
        }))

        setAlerts(formattedAlerts)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
        setLoading(false)
      }
    }

    fetchAlerts()

    // Refresh every 10 seconds
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredAlerts =
    filter === 'all' ? alerts : alerts.filter((alert) => alert.severity === filter)

  const severityColors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  }

  const severityBg = {
    critical: 'bg-red-900/20',
    high: 'bg-orange-900/20',
    medium: 'bg-yellow-900/20',
    low: 'bg-green-900/20',
  }

  const exportData = (format: 'json' | 'csv') => {
    const content =
      format === 'json'
        ? JSON.stringify(filteredAlerts, null, 2)
        : [
            ['Type', 'Severity', 'Source', 'Destination', 'Timestamp'],
            ...filteredAlerts.map((a) => [a.type, a.severity, a.source, a.destination, a.timestamp]),
          ]
            .map((row) => row.join(','))
            .join('\n')

    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alerts.${format}`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                filter === severity
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {severity}
              {severity !== 'all' && ` (${alerts.filter((a) => a.severity === severity).length})`}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => exportData('json')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox
          label="Total Alerts"
          value={alerts.length}
          color="blue"
        />
        <StatBox
          label="Critical"
          value={alerts.filter((a) => a.severity === 'critical').length}
          color="red"
        />
        <StatBox
          label="High"
          value={alerts.filter((a) => a.severity === 'high').length}
          color="orange"
        />
        <StatBox
          label="Medium"
          value={alerts.filter((a) => a.severity === 'medium').length}
          color="yellow"
        />
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <p className="text-gray-400">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors ${severityBg[alert.severity]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <AlertCircle className={`w-5 h-5 mt-1 flex-shrink-0 ${severityColors[alert.severity]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{alert.type}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${severityColors[alert.severity]}`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{alert.message}</p>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-gray-400">
                      <p>
                        <span className="text-gray-500">Source:</span> {alert.source}
                      </p>
                      <p>
                        <span className="text-gray-500">Destination:</span> {alert.destination}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <Clock className="w-4 h-4" />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
            <p className="text-gray-400">No alerts in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface StatBoxProps {
  label: string
  value: number
  color: string
}

function StatBox({ label, value, color }: StatBoxProps) {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-700',
    red: 'bg-red-900/20 border-red-700',
    orange: 'bg-orange-900/20 border-orange-700',
    yellow: 'bg-yellow-900/20 border-yellow-700',
    green: 'bg-green-900/20 border-green-700',
  }

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
