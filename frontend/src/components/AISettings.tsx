import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader, Save } from 'lucide-react'

interface Provider {
  name: string
  endpoint: string
  model: string
  requires: string[]
}

interface ProvidersData {
  [key: string]: Provider
}

interface ConfigStatus {
  [key: string]: boolean
}

export default function AISettings() {
  const [providers, setProviders] = useState<ProvidersData>({})
  const [activeProvider, setActiveProvider] = useState('ollama')
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    api_key: '',
    base_url: 'http://localhost:11434',
  })

  // Fetch providers and config
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available providers
        const providersRes = await fetch('http://localhost:5000/api/ai/providers')
        if (providersRes.ok) {
          const data = await providersRes.json()
          console.log('Providers:', data)
          setProviders(data.providers || {})
          setActiveProvider(data.active_provider || 'ollama')
        } else {
          console.error('Providers fetch failed:', providersRes.status)
        }

        // Fetch current config
        const configRes = await fetch('http://localhost:5000/api/ai/config')
        if (configRes.ok) {
          const config = await configRes.json()
          console.log('Config:', config)
          setActiveProvider(config.active_provider || 'ollama')
          const status: ConfigStatus = {}
          if (config.providers) {
            Object.entries(config.providers).forEach(([key, val]: [string, any]) => {
              status[key] = val.configured
            })
          }
          setConfigStatus(status)
        } else {
          console.error('Config fetch failed:', configRes.status)
        }

        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch AI config:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveConfig = async () => {
    try {
      const payload: any = {
        provider: activeProvider,
        config: {},
      }

      if (activeProvider === 'ollama') {
        payload.config.base_url = formData.base_url
      } else {
        payload.config.api_key = formData.api_key
      }

      const response = await fetch('http://localhost:5000/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `AI provider configured: ${activeProvider}` })
        setConfigStatus((prev) => ({ ...prev, [activeProvider]: true }))
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to save configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error}` })
    }
  }

  const checkHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ai/health')
      if (response.ok) {
        const data = await response.json()
        if (data.available) {
          setMessage({ type: 'success', text: `${activeProvider} is connected and available!` })
        } else {
          setMessage({ type: 'error', text: `${activeProvider} is not configured` })
        }
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check health' })
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <Loader className="w-8 h-8 animate-spin mx-auto text-blue-400 mb-2" />
        <p className="text-gray-400">Loading AI settings...</p>
      </div>
    )
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

      {/* Provider Selection */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">🤖 AI Provider Selection</h2>
        <div className="space-y-3">
          {Object.entries(providers).map(([key, provider]: [string, any]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="provider"
                  value={key}
                  checked={activeProvider === key}
                  onChange={() => setActiveProvider(key)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold">{provider.name}</p>
                  <p className="text-xs text-gray-400">Model: {provider.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {configStatus[key] ? (
                  <span className="text-green-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Configured
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">Not configured</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">⚙️ Configure Selected Provider</h2>

        {activeProvider === 'ollama' ? (
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Ollama Base URL</label>
            <input
              type="text"
              value={formData.base_url}
              onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
            />
            <p className="text-xs text-gray-400 mb-4">
              Make sure Ollama is running locally. Download from{' '}
              <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                ollama.ai
              </a>
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-gray-300 font-semibold mb-2">API Key</label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              placeholder="Enter your API key"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
            />
            <p className="text-xs text-gray-400 mb-4">
              {activeProvider === 'openai' && (
                <>
                  Get your API key from{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    platform.openai.com
                  </a>
                </>
              )}
              {activeProvider === 'claude' && (
                <>
                  Get your API key from{' '}
                  <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    console.anthropic.com
                  </a>
                </>
              )}
              {activeProvider === 'gemini' && (
                <>
                  Get your API key from{' '}
                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    makersuite.google.com
                  </a>
                </>
              )}
              {activeProvider === 'huggingface' && (
                <>
                  Get your API key from{' '}
                  <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    huggingface.co/settings/tokens
                  </a>
                </>
              )}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSaveConfig}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
          <button
            onClick={checkHealth}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Test Connection
          </button>
        </div>
      </div>

      {/* Provider Information */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-700">
        <h2 className="text-lg font-bold mb-4">ℹ️ AI Provider Information</h2>
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 font-semibold">OpenAI GPT-4</p>
            <p className="text-sm text-gray-300">Most capable model, ~$0.03-0.06 per request</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">Anthropic Claude</p>
            <p className="text-sm text-gray-300">Great reasoning, better for analysis, similar pricing</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">Google Gemini</p>
            <p className="text-sm text-gray-300">Competitive pricing, good for general tasks</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">Ollama (Local)</p>
            <p className="text-sm text-gray-300">Free, runs on your machine, best for privacy</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">Hugging Face</p>
            <p className="text-sm text-gray-300">Community models, rate-limited free tier</p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-6 border border-green-700">
        <h2 className="text-lg font-bold mb-4">🚀 How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
          <li>Select an AI provider from the list above</li>
          <li>Enter the required configuration (API key or local URL)</li>
          <li>Click "Save Configuration" to apply</li>
          <li>Click "Test Connection" to verify it works</li>
          <li>Once configured, AI threat analysis will be available in the Alerts page</li>
        </ol>
      </div>
    </div>
  )
}
