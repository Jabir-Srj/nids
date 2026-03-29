import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, EyeOff } from 'lucide-react'

interface Packet {
  id: string
  timestamp: string
  source_ip: string
  dest_ip: string
  protocol: string
  source_port: number
  dest_port: number
  length: number
  flags: string
  payload?: string
  threat_detected: boolean
  threat_type?: string
}

export default function PacketInspector() {
  const [packets, setPackets] = useState<Packet[]>([])
  const [filteredPackets, setFilteredPackets] = useState<Packet[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filters, setFilters] = useState({
    protocol: 'all',
    source_ip: '',
    dest_ip: '',
    threat_only: false,
    port: '',
  })

  const [showPayload, setShowPayload] = useState<{ [key: string]: boolean }>({})
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null)

  // Fetch packets
  useEffect(() => {
    const fetchPackets = async () => {
      try {
        // Simulate fetching packets from backend
        const mockPackets: Packet[] = generateMockPackets(50)
        setPackets(mockPackets)
        setFilteredPackets(mockPackets)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch packets:', error)
        setLoading(false)
      }
    }

    fetchPackets()

    // Refresh every 10 seconds
    const interval = setInterval(fetchPackets, 10000)
    return () => clearInterval(interval)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = packets

    if (filters.protocol !== 'all') {
      filtered = filtered.filter((p) => p.protocol.toUpperCase() === filters.protocol)
    }

    if (filters.source_ip) {
      filtered = filtered.filter((p) => p.source_ip.includes(filters.source_ip))
    }

    if (filters.dest_ip) {
      filtered = filtered.filter((p) => p.dest_ip.includes(filters.dest_ip))
    }

    if (filters.threat_only) {
      filtered = filtered.filter((p) => p.threat_detected)
    }

    if (filters.port) {
      filtered = filtered.filter(
        (p) => p.source_port.toString().includes(filters.port) || p.dest_port.toString().includes(filters.port)
      )
    }

    setFilteredPackets(filtered)
  }, [filters, packets])

  const exportPackets = (format: 'json' | 'csv') => {
    const content =
      format === 'json'
        ? JSON.stringify(filteredPackets, null, 2)
        : [
            ['Timestamp', 'Source', 'Destination', 'Protocol', 'Length', 'Threat', 'Type'],
            ...filteredPackets.map((p) => [
              p.timestamp,
              `${p.source_ip}:${p.source_port}`,
              `${p.dest_ip}:${p.dest_port}`,
              p.protocol,
              p.length,
              p.threat_detected ? 'YES' : 'NO',
              p.threat_type || '-',
            ]),
          ]
            .map((row) => row.join(','))
            .join('\n')

    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `packets.${format}`
    a.click()
  }

  const protocolStats = {
    TCP: packets.filter((p) => p.protocol === 'TCP').length,
    UDP: packets.filter((p) => p.protocol === 'UDP').length,
    ICMP: packets.filter((p) => p.protocol === 'ICMP').length,
    OTHER: packets.filter((p) => !['TCP', 'UDP', 'ICMP'].includes(p.protocol)).length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Total Packets" value={packets.length} color="blue" />
        <StatBox label="TCP" value={protocolStats.TCP} color="green" />
        <StatBox label="UDP" value={protocolStats.UDP} color="purple" />
        <StatBox label="Threats" value={packets.filter((p) => p.threat_detected).length} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Packets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Protocol</label>
            <select
              value={filters.protocol}
              onChange={(e) => setFilters((prev) => ({ ...prev, protocol: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">Source IP</label>
            <input
              type="text"
              placeholder="e.g. 192.168"
              value={filters.source_ip}
              onChange={(e) => setFilters((prev) => ({ ...prev, source_ip: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">Destination IP</label>
            <input
              type="text"
              placeholder="e.g. 10.0"
              value={filters.dest_ip}
              onChange={(e) => setFilters((prev) => ({ ...prev, dest_ip: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">Port</label>
            <input
              type="text"
              placeholder="e.g. 80, 443"
              value={filters.port}
              onChange={(e) => setFilters((prev) => ({ ...prev, port: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.threat_only}
                onChange={(e) => setFilters((prev) => ({ ...prev, threat_only: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-gray-300 font-semibold">Threats Only</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => exportPackets('json')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => exportPackets('csv')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Packet List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">
          Packets ({filteredPackets.length} of {packets.length})
        </h2>

        {loading ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <p className="text-gray-400">Loading packets...</p>
          </div>
        ) : filteredPackets.length > 0 ? (
          <div className="space-y-2 overflow-x-auto">
            {filteredPackets.map((packet) => (
              <div key={packet.id}>
                <div
                  onClick={() => setSelectedPacket(selectedPacket?.id === packet.id ? null : packet)}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Timestamp</p>
                        <p className="font-mono">{new Date(packet.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Source</p>
                        <p className="font-mono text-blue-400">
                          {packet.source_ip}:{packet.source_port}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Destination</p>
                        <p className="font-mono text-green-400">
                          {packet.dest_ip}:{packet.dest_port}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Protocol</p>
                        <p className="font-mono">{packet.protocol}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Length</p>
                        <p className="font-mono">{packet.length} bytes</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Threat</p>
                        <p
                          className={`font-semibold ${
                            packet.threat_detected ? 'text-red-400' : 'text-green-400'
                          }`}
                        >
                          {packet.threat_detected ? 'YES' : 'NO'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed View */}
                {selectedPacket?.id === packet.id && (
                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-2">Packet Details</p>
                        <div className="space-y-1 font-mono text-gray-300">
                          <p>Source IP: {packet.source_ip}</p>
                          <p>Source Port: {packet.source_port}</p>
                          <p>Destination IP: {packet.dest_ip}</p>
                          <p>Destination Port: {packet.dest_port}</p>
                          <p>Protocol: {packet.protocol}</p>
                          <p>Length: {packet.length} bytes</p>
                          <p>Flags: {packet.flags}</p>
                        </div>
                      </div>

                      {packet.threat_detected && (
                        <div>
                          <p className="text-gray-400 mb-2">Threat Information</p>
                          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                            <p className="text-red-400 font-semibold">Threat Detected</p>
                            <p className="text-red-300 text-sm mt-1">Type: {packet.threat_type}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {packet.payload && (
                      <div className="mt-4">
                        <button
                          onClick={() =>
                            setShowPayload((prev) => ({
                              ...prev,
                              [packet.id]: !prev[packet.id],
                            }))
                          }
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold mb-2"
                        >
                          {showPayload[packet.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showPayload[packet.id] ? 'Hide' : 'Show'} Payload
                        </button>
                        {showPayload[packet.id] && (
                          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                            <p className="font-mono text-xs text-gray-400 break-all">{packet.payload}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <Search className="w-12 h-12 mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400">No packets match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

function generateMockPackets(count: number): Packet[] {
  const packets: Packet[] = []
  const protocols = ['TCP', 'UDP', 'ICMP']
  const threatTypes = ['SQL Injection', 'XSS', 'Port Scan', 'DDoS', 'Malware']

  for (let i = 0; i < count; i++) {
    const hasThreat = Math.random() > 0.8

    packets.push({
      id: `pkt-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
      source_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      dest_ip: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      source_port: Math.floor(Math.random() * 65535) + 1,
      dest_port: [22, 80, 443, 3306, 5432, 8080][Math.floor(Math.random() * 6)],
      length: Math.floor(Math.random() * 1500) + 20,
      flags: ['SYN', 'ACK', 'FIN', 'RST', 'PSH'][Math.floor(Math.random() * 5)],
      payload: hasThreat
        ? 'SELECT * FROM users; DROP TABLE accounts;--'
        : 'GET / HTTP/1.1\r\nHost: example.com\r\n',
      threat_detected: hasThreat,
      threat_type: hasThreat ? threatTypes[Math.floor(Math.random() * threatTypes.length)] : undefined,
    })
  }

  return packets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
    green: 'bg-green-900/20 border-green-700',
    purple: 'bg-purple-900/20 border-purple-700',
  }

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
