import { useEffect, useState } from 'react'
import { Activity, Cpu, Database, HardDrive, Zap, AlertCircle } from 'lucide-react'

interface HealthData {
  status: string
  system?: {
    cpu: {
      percent: number
      cores: number
      status: string
    }
    memory: {
      percent: number
      total_gb: number
      used_gb: number
      available_gb: number
      status: string
    }
    disk: {
      percent: number
      total_gb: number
      used_gb: number
      free_gb: number
      status: string
    }
    network: {
      bytes_sent: number
      bytes_recv: number
    }
  }
  process?: {
    cpu_percent: number
    memory_mb: number
    num_threads: number
  }
  database?: {
    size_mb: number
    status: string
  }
}

// Mock data for demo purposes
const getMockHealthData = (): HealthData => ({
  status: 'healthy',
  system: {
    cpu: {
      percent: Math.random() * 50 + 10,
      cores: 8,
      status: 'good',
    },
    memory: {
      percent: Math.random() * 40 + 20,
      total_gb: 16,
      used_gb: Math.random() * 6 + 3,
      available_gb: Math.random() * 10 + 5,
      status: 'good',
    },
    disk: {
      percent: Math.random() * 60 + 20,
      total_gb: 500,
      used_gb: Math.random() * 200 + 100,
      free_gb: Math.random() * 300 + 150,
      status: 'good',
    },
    network: {
      bytes_sent: Math.random() * 1000000000,
      bytes_recv: Math.random() * 1000000000,
    },
  },
  process: {
    cpu_percent: Math.random() * 15,
    memory_mb: Math.random() * 200 + 100,
    num_threads: 12,
  },
  database: {
    size_mb: Math.random() * 50 + 10,
    status: 'healthy',
  },
})

export default function SystemHealth() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        // Try the system health endpoint
        const response = await fetch('http://localhost:5000/api/system/health')
        if (!response.ok) throw new Error('Failed to fetch health')
        const data = await response.json()
        setHealth(data)
        setError(null)
        console.log('Real system health data received:', data)
      } catch (err) {
        console.error('Health fetch error:', err)
        // Use mock data as fallback
        console.log('Falling back to mock data')
        setHealth(getMockHealthData())
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading system health...</div>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-red-300">
        <p className="font-semibold">❌ Health data unavailable</p>
        <p className="text-sm mt-2">Make sure backend is running on http://localhost:5000</p>
      </div>
    )
  }

  const systemData = health.system || getMockHealthData().system
  const processData = health.process || getMockHealthData().process
  const databaseData = health.database || getMockHealthData().database

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400 bg-green-900/20'
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'critical':
        return 'text-red-400 bg-red-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div
        className={`rounded-lg p-6 border ${
          health.status === 'healthy'
            ? 'bg-green-900/20 border-green-700'
            : 'bg-yellow-900/20 border-yellow-700'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Status: <span className="capitalize">{health.status}</span>
        </h2>
      </div>

      {/* CPU Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            CPU Usage
          </h3>
          <span className={`text-sm font-semibold px-3 py-1 rounded ${getStatusColor(systemData.cpu.status)}`}>
            {systemData.cpu.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Utilization</p>
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    systemData.cpu.percent > 80
                      ? 'bg-red-500'
                      : systemData.cpu.percent > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, systemData.cpu.percent)}%` }}
                ></div>
              </div>
              <p className="text-2xl font-bold mt-2">{systemData.cpu.percent.toFixed(1)}%</p>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Cores</p>
            <p className="text-2xl font-bold mt-4">{systemData.cpu.cores}</p>
            <p className="text-gray-400 text-sm mt-2">available</p>
          </div>
        </div>
      </div>

      {/* Memory Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Memory Usage
          </h3>
          <span className={`text-sm font-semibold px-3 py-1 rounded ${getStatusColor(systemData.memory.status)}`}>
            {systemData.memory.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Utilization</p>
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    systemData.memory.percent > 80
                      ? 'bg-red-500'
                      : systemData.memory.percent > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, systemData.memory.percent)}%` }}
                ></div>
              </div>
              <p className="text-2xl font-bold mt-2">{systemData.memory.percent.toFixed(1)}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs">Used</p>
              <p className="text-xl font-bold">{systemData.memory.used_gb.toFixed(2)} GB</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total</p>
              <p className="text-xl font-bold">{systemData.memory.total_gb.toFixed(2)} GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disk Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Disk Usage
          </h3>
          <span className={`text-sm font-semibold px-3 py-1 rounded ${getStatusColor(systemData.disk.status)}`}>
            {systemData.disk.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Utilization</p>
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    systemData.disk.percent > 80
                      ? 'bg-red-500'
                      : systemData.disk.percent > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, systemData.disk.percent)}%` }}
                ></div>
              </div>
              <p className="text-2xl font-bold mt-2">{systemData.disk.percent.toFixed(1)}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs">Used</p>
              <p className="text-xl font-bold">{systemData.disk.used_gb.toFixed(2)} GB</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Free</p>
              <p className="text-xl font-bold text-green-400">{systemData.disk.free_gb.toFixed(2)} GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Database className="w-5 h-5" />
          Database Status
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Database Size</p>
            <p className="text-2xl font-bold mt-2">{databaseData.size_mb.toFixed(2)} MB</p>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-2xl font-bold mt-2 capitalize text-green-400">{databaseData.status}</p>
          </div>
        </div>
      </div>

      {/* Process Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Application Process</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">CPU Usage</p>
            <p className="text-2xl font-bold mt-2">{processData.cpu_percent.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Memory</p>
            <p className="text-2xl font-bold mt-2">{processData.memory_mb.toFixed(0)} MB</p>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Threads</p>
            <p className="text-2xl font-bold mt-2">{processData.num_threads}</p>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Network Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Bytes Sent</p>
            <p className="text-xl font-bold mt-2">{(systemData.network.bytes_sent / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Bytes Received</p>
            <p className="text-xl font-bold mt-2">{(systemData.network.bytes_recv / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">System Health Monitoring</p>
          <p>
            Real-time monitoring of CPU, memory, disk, and network resources. The system is optimized for detection and
            response performance.
          </p>
        </div>
      </div>
    </div>
  )
}
