import { useState } from 'react'
import { Filter, X, Plus, Search } from 'lucide-react'

interface FilterCriteria {
  severity?: string[]
  threatType?: string[]
  sourceIP?: string
  destIP?: string
  protocol?: string[]
  dateRange?: { start: string; end: string }
  cidrRange?: string
  payloadRegex?: string
  confidenceMin?: number
}

interface SavedFilter {
  id: string
  name: string
  criteria: FilterCriteria
}

export default function AdvancedFilters() {
  const [criteria, setCriteria] = useState<FilterCriteria>({})
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    { id: '1', name: 'Critical Alerts', criteria: { severity: ['critical'] } },
    { id: '2', name: 'SQL Injections', criteria: { threatType: ['SQL Injection'] } },
  ])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const severityOptions = ['critical', 'high', 'medium', 'low']
  const threatTypes = ['SQL Injection', 'XSS', 'DDoS', 'Malware', 'Buffer Overflow', 'Brute Force']
  const protocols = ['TCP', 'UDP', 'ICMP', 'DNS', 'HTTP', 'HTTPS']

  const toggleSeverity = (severity: string) => {
    const newSeverities = criteria.severity || []
    if (newSeverities.includes(severity)) {
      setCriteria({ ...criteria, severity: newSeverities.filter((s) => s !== severity) })
    } else {
      setCriteria({ ...criteria, severity: [...newSeverities, severity] })
    }
    setActiveFilters(['severity'])
  }

  const toggleThreatType = (threatType: string) => {
    const newTypes = criteria.threatType || []
    if (newTypes.includes(threatType)) {
      setCriteria({ ...criteria, threatType: newTypes.filter((t) => t !== threatType) })
    } else {
      setCriteria({ ...criteria, threatType: [...newTypes, threatType] })
    }
    setActiveFilters(['threatType'])
  }

  const toggleProtocol = (protocol: string) => {
    const newProtocols = criteria.protocol || []
    if (newProtocols.includes(protocol)) {
      setCriteria({ ...criteria, protocol: newProtocols.filter((p) => p !== protocol) })
    } else {
      setCriteria({ ...criteria, protocol: [...newProtocols, protocol] })
    }
    setActiveFilters(['protocol'])
  }

  const applyFilter = () => {
    // Fetch alerts with criteria
    const params = new URLSearchParams()
    if (criteria.severity?.length) params.append('severity', criteria.severity.join(','))
    if (criteria.threatType?.length) params.append('threatType', criteria.threatType.join(','))
    if (criteria.sourceIP) params.append('sourceIP', criteria.sourceIP)
    if (criteria.destIP) params.append('destIP', criteria.destIP)
    if (criteria.protocol?.length) params.append('protocol', criteria.protocol.join(','))
    if (criteria.cidrRange) params.append('cidrRange', criteria.cidrRange)
    if (criteria.payloadRegex) params.append('payloadRegex', criteria.payloadRegex)
    if (criteria.confidenceMin) params.append('confidenceMin', criteria.confidenceMin.toString())

    console.log('Fetching alerts with:', params.toString())
    // TODO: Fetch alerts from API
  }

  const saveFilter = () => {
    if (!filterName.trim()) return

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      criteria,
    }

    setSavedFilters([...savedFilters, newFilter])
    setFilterName('')
    setShowSaveDialog(false)
  }

  const loadFilter = (filter: SavedFilter) => {
    setCriteria(filter.criteria)
    setActiveFilters(['loaded'])
  }

  const clearAllFilters = () => {
    setCriteria({})
    setActiveFilters([])
  }

  return (
    <div className="space-y-6">
      {/* Filter Builder */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Advanced Filter Builder
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">Severity Level</label>
            <div className="space-y-2">
              {severityOptions.map((severity) => (
                <label key={severity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.severity?.includes(severity) || false}
                    onChange={() => toggleSeverity(severity)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700"
                  />
                  <span className="capitalize text-sm">{severity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Threat Type Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">Threat Type</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {threatTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.threatType?.includes(type) || false}
                    onChange={() => toggleThreatType(type)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Protocol Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">Protocol</label>
            <div className="space-y-2">
              {protocols.map((protocol) => (
                <label key={protocol} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.protocol?.includes(protocol) || false}
                    onChange={() => toggleProtocol(protocol)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700"
                  />
                  <span className="text-sm">{protocol}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Source IP */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Source IP</label>
            <input
              type="text"
              placeholder="192.168.1.100"
              value={criteria.sourceIP || ''}
              onChange={(e) => setCriteria({ ...criteria, sourceIP: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500"
            />
          </div>

          {/* Destination IP */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Destination IP</label>
            <input
              type="text"
              placeholder="10.0.0.5"
              value={criteria.destIP || ''}
              onChange={(e) => setCriteria({ ...criteria, destIP: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500"
            />
          </div>

          {/* CIDR Range */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">CIDR Range</label>
            <input
              type="text"
              placeholder="192.168.0.0/16"
              value={criteria.cidrRange || ''}
              onChange={(e) => setCriteria({ ...criteria, cidrRange: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500"
            />
          </div>

          {/* Payload Regex */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-gray-300">Payload Regex</label>
            <input
              type="text"
              placeholder="^[a-z]+@[a-z]+\\.com$"
              value={criteria.payloadRegex || ''}
              onChange={(e) => setCriteria({ ...criteria, payloadRegex: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500"
            />
          </div>

          {/* Confidence Threshold */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Min Confidence (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={criteria.confidenceMin || 0}
              onChange={(e) => setCriteria({ ...criteria, confidenceMin: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">From</label>
            <input
              type="date"
              value={criteria.dateRange?.start || ''}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  dateRange: { ...criteria.dateRange, start: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          </div>

          {/* Date Range End */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">To</label>
            <input
              type="date"
              value={criteria.dateRange?.end || ''}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  dateRange: { ...criteria.dateRange, end: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={applyFilter}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-sm flex items-center gap-2 transition"
          >
            <Search className="w-4 h-4" />
            Apply Filter
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold text-sm flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Save Filter
          </button>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold text-sm flex items-center gap-2 transition"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Saved Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">⭐ Saved Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {savedFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => loadFilter(filter)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition border border-gray-600 hover:border-blue-500"
            >
              <p className="font-semibold text-sm">{filter.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {Object.keys(filter.criteria)
                  .slice(0, 2)
                  .join(', ')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Save Filter</h3>
            <input
              type="text"
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded mb-4 text-white placeholder-gray-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={saveFilter}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold text-sm transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-semibold text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
