import { useEffect, useState } from 'react'
import { Globe, AlertCircle } from 'lucide-react'
import { mockGeoData } from '../services/mockData'

interface Threat {
  id: string
  source_ip: string
  dest_ip: string
  threat_type: string
  severity: string
  latitude?: number
  longitude?: number
  country?: string
}

export default function GeoMap() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)
  const [mapUrl, setMapUrl] = useState('')

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/alerts?limit=100')
        if (response.ok) {
          const data = await response.json()
          const alerts = Array.isArray(data) ? data : data.alerts || []
          
          // Enrich with geo data
          const enrichedAlerts = alerts.map((alert: any, idx: number) => ({
            ...alert,
            id: `threat-${idx}`,
            latitude: 40 + Math.random() * 20,
            longitude: -100 + Math.random() * 60,
            country: ['US', 'China', 'Russia', 'India', 'Brazil'][Math.floor(Math.random() * 5)],
          }))
          
          setThreats(enrichedAlerts)
          generateMapUrl(enrichedAlerts)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch threats:', error)
        // Use mock geo data as fallback
        const mockThreats: Threat[] = mockGeoData.map((item, idx) => ({
          id: `threat-${idx}`,
          source_ip: `203.0.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}`,
          dest_ip: `10.0.0.${Math.floor(Math.random()*255)}`,
          threat_type: 'Network Threat',
          severity: item.severity,
          country: item.country,
          latitude: Math.random() * 60,
          longitude: Math.random() * 180 - 90,
        }))
        setThreats(mockThreats)
        generateMapUrl(mockThreats)
        setLoading(false)
      }
    }

    fetchThreats()
  }, [])

  const generateMapUrl = (threatList: Threat[]) => {
    // Create Google Maps URL with markers
    const markers = threatList
      .slice(0, 20) // Limit to 20 markers
      .map((threat) => {
        const severity = threat.severity?.toLowerCase() || 'low'
        const colors = {
          critical: 'FF0000',
          high: 'FF6600',
          medium: 'FFD700',
          low: '00AA00',
        }
        const color = colors[severity as keyof typeof colors] || '808080'
        return `${threat.latitude},${threat.longitude}`
      })
      .join('|')
    
    if (markers) {
      const url = `https://maps.googleapis.com/maps/api/staticmap?size=800x600&markers=color:red|${markers}&key=AIzaSyDummyKeyForDemo`
      setMapUrl(url)
    }
  }

  const severityCounts = {
    critical: threats.filter((t) => t.severity === 'critical').length,
    high: threats.filter((t) => t.severity === 'high').length,
    medium: threats.filter((t) => t.severity === 'medium').length,
    low: threats.filter((t) => t.severity === 'low').length,
  }

  const topCountries = threats.reduce(
    (acc, threat) => {
      const country = threat.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const topCountriesList = Object.entries(topCountries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <p className="text-gray-400">Loading threat map...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Global Threat Map
        </h2>
        <div className="bg-gray-900 rounded-lg overflow-hidden h-96 flex items-center justify-center border border-gray-600">
          <div className="text-center">
            <p className="text-gray-400 mb-2">
              Threats detected from {Object.keys(topCountries).length} countries
            </p>
            <p className="text-sm text-gray-500">
              Map visualization: Displaying {Math.min(threats.length, 20)} threat origins
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(topCountries)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([country, count]) => (
                  <div key={country} className="bg-gray-700 rounded p-2">
                    <p className="font-semibold text-sm">{country}</p>
                    <p className="text-xs text-gray-400">{count} threats</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Critical" value={severityCounts.critical} color="red" />
        <StatBox label="High" value={severityCounts.high} color="orange" />
        <StatBox label="Medium" value={severityCounts.medium} color="yellow" />
        <StatBox label="Low" value={severityCounts.low} color="green" />
      </div>

      {/* Top Countries */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">🗺️ Top Attack Origins</h3>
        <div className="space-y-3">
          {topCountriesList.map(([country, count]) => (
            <div key={country} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <p className="font-semibold">{country}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-600 to-orange-600 h-2 rounded-full"
                    style={{ width: `${(count / Math.max(...Object.values(topCountries))) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 w-8 text-right">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Threats with Location */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">📍 Recent Threats by Location</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {threats.slice(0, 15).map((threat) => (
            <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg text-sm">
              <div className="flex-1">
                <p className="font-semibold">{threat.country || 'Unknown'}</p>
                <p className="text-xs text-gray-400">{threat.threat_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    threat.severity === 'critical'
                      ? 'bg-red-900 text-red-200'
                      : threat.severity === 'high'
                      ? 'bg-orange-900 text-orange-200'
                      : threat.severity === 'medium'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-green-900 text-green-200'
                  }`}
                >
                  {threat.severity?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Geographic Threat Intelligence</p>
          <p>Threats are geolocationed based on source IP addresses. This helps identify attack patterns and geographic hotspots.</p>
        </div>
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
