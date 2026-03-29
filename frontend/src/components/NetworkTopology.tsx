import { useEffect, useState } from 'react'
import { useEffect, useState } from 'react'
import { Network, AlertCircle, Zap } from 'lucide-react'

interface Node {
  id: string
  label: string
  type: 'source' | 'dest' | 'attacker' | 'target'
  severity?: string
  threat_count?: number
}

interface Edge {
  source: string
  target: string
  threats: number
  severity: string
  protocol: string
}

export default function NetworkTopology() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [stats, setStats] = useState({ total_connections: 0, critical_paths: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNetworkData()
    const interval = setInterval(fetchNetworkData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchNetworkData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alerts?limit=100')
      if (response.ok) {
        const data = await response.json()
        const alerts = Array.isArray(data) ? data : data.alerts || []

        // Build network graph from alerts
        const nodeMap = new Map<string, Node>()
        const edgeMap = new Map<string, Edge>()

        alerts.forEach((alert: any) => {
          const src = alert.source_ip
          const dst = alert.dest_ip

          if (!nodeMap.has(src)) {
            nodeMap.set(src, {
              id: src,
              label: src,
              type: 'source',
              severity: alert.severity,
              threat_count: 0,
            })
          }

          if (!nodeMap.has(dst)) {
            nodeMap.set(dst, {
              id: dst,
              label: dst,
              type: 'dest',
              severity: alert.severity,
              threat_count: 0,
            })
          }

          const srcNode = nodeMap.get(src)!
          const dstNode = nodeMap.get(dst)!
          srcNode.threat_count = (srcNode.threat_count || 0) + 1
          dstNode.threat_count = (dstNode.threat_count || 0) + 1

          if (alert.severity === 'critical' || alert.severity === 'high') {
            srcNode.type = 'attacker'
            dstNode.type = 'target'
          }

          const edgeKey = `${src}→${dst}`
          if (!edgeMap.has(edgeKey)) {
            edgeMap.set(edgeKey, {
              source: src,
              target: dst,
              threats: 0,
              severity: alert.severity,
              protocol: alert.protocol || 'TCP',
            })
          }
          const edge = edgeMap.get(edgeKey)!
          edge.threats += 1
        })

        setNodes(Array.from(nodeMap.values()))
        setEdges(Array.from(edgeMap.values()))
        setStats({
          total_connections: edgeMap.size,
          critical_paths: Array.from(edgeMap.values()).filter((e) => e.severity === 'critical').length,
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch network data:', error)
      setLoading(false)
    }
  }

  const getNodeColor = (node: Node) => {
    if (node.type === 'attacker') return 'fill-red-600'
    if (node.type === 'target') return 'fill-orange-600'
    return 'fill-blue-600'
  }

  const getEdgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'stroke-red-600'
      case 'high':
        return 'stroke-orange-600'
      case 'medium':
        return 'stroke-yellow-600'
      default:
        return 'stroke-green-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <p className="text-gray-400">Loading network topology...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Network Connections" value={stats.total_connections} icon="🔗" />
        <StatCard label="Critical Attack Paths" value={stats.critical_paths} icon="🔴" />
        <StatCard label="Unique IPs Involved" value={nodes.length} icon="🖥️" />
      </div>

      {/* Network Topology Visualization */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Network className="w-5 h-5" />
          Network Attack Topology
        </h2>

        <div className="bg-gray-900 rounded-lg p-4 h-96 border border-gray-600 overflow-auto">
          <svg width="100%" height="100%" viewBox="0 0 800 400" className="min-h-full">
            {/* Draw edges */}
            {edges.map((edge, idx) => {
              const srcNode = nodes.find((n) => n.id === edge.source)
              const dstNode = nodes.find((n) => n.id === edge.target)
              if (!srcNode || !dstNode) return null

              const srcIdx = nodes.indexOf(srcNode)
              const dstIdx = nodes.indexOf(dstNode)
              const x1 = 100 + (srcIdx % 5) * 120
              const y1 = 100 + Math.floor(srcIdx / 5) * 100
              const x2 = 100 + (dstIdx % 5) * 120
              const y2 = 100 + Math.floor(dstIdx / 5) * 100

              return (
                <line
                  key={`edge-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={`${getEdgeColor(edge.severity)} opacity-60`}
                  strokeWidth={Math.min(edge.threats / 5 + 1, 5)}
                  markerEnd="url(#arrowhead)"
                />
              )
            })}

            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#666" />
              </marker>
            </defs>

            {/* Draw nodes */}
            {nodes.map((node, idx) => {
              const x = 100 + (idx % 5) * 120
              const y = 100 + Math.floor(idx / 5) * 100

              return (
                <g key={node.id} onClick={() => setSelectedNode(node.id)} className="cursor-pointer">
                  <circle cx={x} cy={y} r="20" className={`${getNodeColor(node)} opacity-80 hover:opacity-100`} />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="text-xs fill-white font-bold"
                    fontSize="10"
                  >
                    {node.threat_count}
                  </text>
                  <text
                    x={x}
                    y={y + 35}
                    textAnchor="middle"
                    className="text-xs fill-gray-300"
                    fontSize="9"
                  >
                    {node.label.split('.').slice(-2).join('.')}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <p>🔴 Red = Attacker | 🟠 Orange = Target | 🔵 Blue = Other</p>
        </div>
      </div>

      {/* Connection Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Attack Paths */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">🔗 Top Attack Paths</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {edges
              .sort((a, b) => b.threats - a.threats)
              .slice(0, 10)
              .map((edge, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg text-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-blue-300">{edge.source}</p>
                    <p className="text-xs text-gray-400">→ {edge.target}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{edge.threats}</p>
                    <p className={`text-xs font-semibold ${
                      edge.severity === 'critical' ? 'text-red-400' :
                      edge.severity === 'high' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`}>
                      {edge.severity.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Most Targeted IPs */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">🎯 Most Targeted IPs</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {nodes
              .filter((n) => n.type === 'target' || n.type === 'dest')
              .sort((a, b) => (b.threat_count || 0) - (a.threat_count || 0))
              .slice(0, 10)
              .map((node, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg text-sm">
                  <div>
                    <p className="font-semibold">{node.label}</p>
                    <p className="text-xs text-gray-400">{node.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${node.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`} />
                    <p className="font-bold text-white w-6 text-right">{node.threat_count}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-gray-800 rounded-lg p-6 border border-blue-600">
          <h3 className="text-lg font-bold mb-4">📍 Node Details: {selectedNode}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Incoming Connections</p>
              <p className="text-2xl font-bold">
                {edges.filter((e) => e.target === selectedNode).length}
              </p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Outgoing Connections</p>
              <p className="text-2xl font-bold">
                {edges.filter((e) => e.source === selectedNode).length}
              </p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Total Incidents</p>
              <p className="text-2xl font-bold">
                {nodes.find((n) => n.id === selectedNode)?.threat_count || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Network Topology Visualization</p>
          <p>Shows attack paths between source and destination IPs. Red nodes are attackers, orange are targets. Line thickness indicates threat count.</p>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: string
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
