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

export default function AISettings() {
  const [providers, setProviders] = useState<ProvidersData>({})
  const [activeProvider, setActiveProvider] = useState('ollama')
  const [configStatus, setConfigStatus] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    api_key: '',
    base_url: 'http://localhost:11434',
    custom_url: 'https://your-api.com/v1/chat/completions',
  })

  // Fetch providers and config
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('Fetching AI providers...')

        // Fetch available providers
        const providersRes = await fetch('http://localhost:5000/api/ai/providers')
        console.log('Providers response status:', providersRes.status)

        if (!providersRes.ok) {
          throw new Error(`Provider fetch failed: ${providersRes.status}`)
        }

        const data = await providersRes.json()
        console.log('Providers data:', data)

        if (!data.providers) {
          throw new Error('No providers in response')
        }

        setProviders(data.providers)
        setActiveProvider(data.active_provider || 'ollama')

        // Fetch current config
        const configRes = await fetch('http://localhost:5000/api/ai/config')
        console.log('Config response status:', configRes.status)

        if (configRes.ok) {
          const config = await configRes.json()
          console.log('Config data:', config)
          setActiveProvider(config.active_provider || 'ollama')

          const status: { [key: string]: boolean } = {}
          if (config.providers) {
            Object.entries(config.providers).forEach(([key, val]: [string, any]) => {
              status[key] = val.configured
            })
          }
          setConfigStatus(status)
        }

        setLoading(false)
        setError(null)
      } catch (error) {
        console.error('Failed to fetch AI config:', error)
        setError(String(error))
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
      } else if (activeProvider === 'lmstudio') {
        payload.config.base_url = formData.base_url
      } else if (activeProvider === 'custom') {
        payload.config.base_url = formData.custom_url
        payload.config.api_key = formData.api_key
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
          setMessage({ type: 'success', text: `${activeProvider} is connected!` })
        } else {
          setMessage({ type: 'error', text: `${activeProvider} not configured` })
        }
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Connection check failed: ${error}` })
    }
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-red-300">
        <AlertCircle className="w-6 h-6 mb-2" />
        <p className="font-semibold">Error loading AI settings</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <Loader className="w-8 h-8 animate-spin mx-auto text-blue-400 mb-2" />
        <p className="text-gray-400">Loading AI settings...</p>
      </div>
    )
  }

  const providerEntries = Object.entries(providers)
  console.log('Provider entries:', providerEntries)

  if (providerEntries.length === 0) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 text-yellow-300">
        <AlertCircle className="w-6 h-6 mb-2" />
        <p className="font-semibold">No AI providers available</p>
        <p className="text-sm mt-2">Backend may not be running or AI service failed to initialize</p>
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
          {providerEntries.map(([key, provider]: [string, any]) => (
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
        <h2 className="text-lg font-bold mb-4">⚙️ Configure: {providers[activeProvider]?.name}</h2>

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
              Download Ollama from{' '}
              <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                ollama.ai
              </a>
            </p>
          </div>
        ) : activeProvider === 'lmstudio' ? (
          <div>
            <label className="block text-gray-300 font-semibold mb-2">LM Studio Base URL</label>
            <input
              type="text"
              value={formData.base_url}
              onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
              placeholder="http://localhost:1234"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
            />
            <p className="text-xs text-gray-400 mb-4">
              Download LM Studio from{' '}
              <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                lmstudio.ai
              </a>
              . Make sure to enable local server in LM Studio settings.
            </p>
          </div>
        ) : activeProvider === 'custom' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">API Endpoint URL</label>
              <input
                type="text"
                value={formData.custom_url}
                onChange={(e) => setFormData({ ...formData, custom_url: e.target.value })}
                placeholder="https://your-api.com/v1/chat/completions"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">OpenAI-compatible endpoint URL</p>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-2">API Key (Optional)</label>
              <input
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Optional API key for authentication"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
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
          </div>
        )}

        <div className="flex gap-3 mt-4">
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
    </div>
  )
}
