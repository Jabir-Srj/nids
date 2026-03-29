import { useState, useEffect } from 'react'
import { Save, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { rulesAPI, captureAPI } from '../services/api'
import AISettings from './AISettings'

interface Rule {
  id: string
  name: string
  pattern: string
  pattern_type: string
  threat_type: string
  enabled: boolean
}

interface CaptureSettings {
  interface_name: string
  packet_count: number
  capture_enabled: boolean
}

export default function Settings() {
  const [rules, setRules] = useState<Rule[]>([])
  const [captureSettings, setCaptureSettings] = useState<CaptureSettings>({
    interface_name: 'eth0',
    packet_count: 10000,
    capture_enabled: true,
  })

  const [newRule, setNewRule] = useState({
    name: '',
    pattern: '',
    pattern_type: 'regex',
    threat_type: 'unknown',
  })

  const [interfaces, setInterfaces] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rules
        try {
          const res = await rulesAPI.getAll()
          const data = Array.isArray(res.data) ? res.data : res.data?.rules || []
          setRules(
            data.map((rule: any) => ({
              id: rule.id || Math.random().toString(),
              name: rule.name || rule.rule_name || 'Unknown Rule',
              pattern: rule.pattern || '',
              pattern_type: rule.pattern_type || 'regex',
              threat_type: rule.threat_type || 'unknown',
              enabled: rule.enabled !== false,
            }))
          )
        } catch (e) {
          console.log('Rules API not available')
        }

        // Fetch capture interfaces
        try {
          const res = await captureAPI.interfaces()
          if (res.data?.interfaces) {
            setInterfaces(res.data.interfaces)
          }
        } catch (e) {
          console.log('Capture API not available')
        }

        // Fetch capture status
        try {
          const res = await captureAPI.status()
          if (res.data) {
            setCaptureSettings((prev) => ({
              ...prev,
              interface_name: res.data.interface_name || prev.interface_name,
              capture_enabled: res.data.enabled || prev.capture_enabled,
            }))
          }
        } catch (e) {
          console.log('Status API not available')
        }

        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddRule = async () => {
    if (!newRule.name || !newRule.pattern) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    try {
      await rulesAPI.create(newRule)
      setRules([
        ...rules,
        {
          id: Math.random().toString(),
          ...newRule,
          enabled: true,
        },
      ])
      setNewRule({ name: '', pattern: '', pattern_type: 'regex', threat_type: 'unknown' })
      setMessage({ type: 'success', text: 'Rule added successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add rule' })
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      await rulesAPI.delete(id)
      setRules(rules.filter((r) => r.id !== id))
      setMessage({ type: 'success', text: 'Rule deleted' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete rule' })
    }
  }

  const handleToggleRule = async (id: string, enabled: boolean) => {
    try {
      await rulesAPI.toggle(id, !enabled)
      setRules(
        rules.map((r) =>
          r.id === id ? { ...r, enabled: !enabled } : r
        )
      )
    } catch (error) {
      console.error('Failed to toggle rule:', error)
    }
  }

  const handleSaveSettings = async () => {
    try {
      if (captureSettings.capture_enabled) {
        await captureAPI.start(captureSettings.interface_name)
      } else {
        await captureAPI.stop()
      }
      setMessage({ type: 'success', text: 'Settings saved successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-700 text-green-300'
              : 'bg-red-900/20 border border-red-700 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* AI Settings */}
      <AISettings />

      {/* Capture Settings */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">🎯 Capture Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Network Interface</label>
            <select
              value={captureSettings.interface_name}
              onChange={(e) =>
                setCaptureSettings((prev) => ({ ...prev, interface_name: e.target.value }))
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {interfaces.length > 0 ? (
                interfaces.map((iface) => (
                  <option key={iface} value={iface}>
                    {iface}
                  </option>
                ))
              ) : (
                <option value="eth0">eth0 (default)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              Max Packets in Buffer
            </label>
            <input
              type="number"
              value={captureSettings.packet_count}
              onChange={(e) =>
                setCaptureSettings((prev) => ({
                  ...prev,
                  packet_count: parseInt(e.target.value),
                }))
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="capture_enabled"
              checked={captureSettings.capture_enabled}
              onChange={(e) =>
                setCaptureSettings((prev) => ({ ...prev, capture_enabled: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <label htmlFor="capture_enabled" className="text-gray-300 font-semibold cursor-pointer">
              Enable packet capture
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Capture Settings
          </button>
        </div>
      </div>

      {/* Detection Rules */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">🔍 Detection Rules ({rules.length})</h2>

        {/* Active Rules List */}
        <div className="space-y-2 mb-6">
          {rules.length > 0 ? (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id, rule.enabled)}
                      className="w-4 h-4"
                    />
                    <p className="font-semibold">{rule.name}</p>
                    <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                      {rule.pattern_type}
                    </span>
                    <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                      {rule.threat_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">Pattern: {rule.pattern}</p>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No rules loaded</p>
          )}
        </div>

        {/* Add New Rule */}
        <div className="border-t border-gray-600 pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Rule
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Rule name"
              value={newRule.name}
              onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Pattern (regex or string)"
              value={newRule.pattern}
              onChange={(e) => setNewRule((prev) => ({ ...prev, pattern: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newRule.pattern_type}
                onChange={(e) => setNewRule((prev) => ({ ...prev, pattern_type: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="regex">Regex</option>
                <option value="string">String</option>
                <option value="hex">Hex</option>
                <option value="binary">Binary</option>
              </select>
              <select
                value={newRule.threat_type}
                onChange={(e) => setNewRule((prev) => ({ ...prev, threat_type: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="unknown">Unknown</option>
                <option value="sql-injection">SQL Injection</option>
                <option value="xss">XSS</option>
                <option value="port-scan">Port Scan</option>
                <option value="ddos">DDoS</option>
                <option value="malware">Malware</option>
              </select>
            </div>
            <button
              onClick={handleAddRule}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-700">
        <h2 className="text-lg font-bold mb-4">ℹ️ System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Backend Status</p>
            <p className="text-lg font-semibold text-green-400">🟢 Connected</p>
          </div>
          <div>
            <p className="text-gray-400">API Version</p>
            <p className="text-lg font-semibold text-blue-400">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-400">ML Model</p>
            <p className="text-lg font-semibold text-purple-400">Isolation Forest</p>
          </div>
          <div>
            <p className="text-gray-400">Update Frequency</p>
            <p className="text-lg font-semibold text-cyan-400">Real-time</p>
          </div>
        </div>
      </div>
    </div>
  )
}
