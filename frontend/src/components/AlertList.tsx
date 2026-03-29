import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

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
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'SQL Injection Detected',
      severity: 'critical',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      source: '203.0.113.45',
      destination: '192.168.1.100',
      message: 'Potential SQL injection in login endpoint detected',
    },
    {
      id: '2',
      type: 'Port Scan',
      severity: 'high',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      source: '198.51.100.23',
      destination: '192.168.1.0/24',
      message: 'Rapid port scanning activity detected',
    },
    {
      id: '3',
      type: 'XSS Attempt',
      severity: 'medium',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      source: '192.168.1.50',
      destination: '192.168.1.100',
      message: 'Script injection attempt in HTTP request',
    },
  ])

  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')

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

  return (
    <div className="space-y-6">
      {/* Filters */}
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
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
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
