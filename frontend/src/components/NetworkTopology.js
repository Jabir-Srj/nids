import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Network, AlertCircle, Zap } from 'lucide-react';
export default function NetworkTopology() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [stats, setStats] = useState({ total_connections: 0, critical_paths: 0 });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchNetworkData();
        const interval = setInterval(fetchNetworkData, 5000);
        return () => clearInterval(interval);
    }, []);
    const fetchNetworkData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/alerts?limit=100');
            if (response.ok) {
                const data = await response.json();
                const alerts = Array.isArray(data) ? data : data.alerts || [];
                // Build network graph from alerts
                const nodeMap = new Map();
                const edgeMap = new Map();
                alerts.forEach((alert) => {
                    const src = alert.source_ip;
                    const dst = alert.dest_ip;
                    if (!nodeMap.has(src)) {
                        nodeMap.set(src, {
                            id: src,
                            label: src,
                            type: 'source',
                            severity: alert.severity,
                            threat_count: 0,
                        });
                    }
                    if (!nodeMap.has(dst)) {
                        nodeMap.set(dst, {
                            id: dst,
                            label: dst,
                            type: 'dest',
                            severity: alert.severity,
                            threat_count: 0,
                        });
                    }
                    const srcNode = nodeMap.get(src);
                    const dstNode = nodeMap.get(dst);
                    srcNode.threat_count = (srcNode.threat_count || 0) + 1;
                    dstNode.threat_count = (dstNode.threat_count || 0) + 1;
                    if (alert.severity === 'critical' || alert.severity === 'high') {
                        srcNode.type = 'attacker';
                        dstNode.type = 'target';
                    }
                    const edgeKey = `${src}→${dst}`;
                    if (!edgeMap.has(edgeKey)) {
                        edgeMap.set(edgeKey, {
                            source: src,
                            target: dst,
                            threats: 0,
                            severity: alert.severity,
                            protocol: alert.protocol || 'TCP',
                        });
                    }
                    const edge = edgeMap.get(edgeKey);
                    edge.threats += 1;
                });
                setNodes(Array.from(nodeMap.values()));
                setEdges(Array.from(edgeMap.values()));
                setStats({
                    total_connections: edgeMap.size,
                    critical_paths: Array.from(edgeMap.values()).filter((e) => e.severity === 'critical').length,
                });
                setLoading(false);
            }
        }
        catch (error) {
            console.error('Failed to fetch network data:', error);
            setLoading(false);
        }
    };
    const getNodeColor = (node) => {
        if (node.type === 'attacker')
            return 'fill-red-600';
        if (node.type === 'target')
            return 'fill-orange-600';
        return 'fill-blue-600';
    };
    const getEdgeColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'stroke-red-600';
            case 'high':
                return 'stroke-orange-600';
            case 'medium':
                return 'stroke-yellow-600';
            default:
                return 'stroke-green-600';
        }
    };
    if (loading) {
        return (_jsx("div", { className: "bg-gray-800 rounded-lg p-8 text-center border border-gray-700", children: _jsx("p", { className: "text-gray-400", children: "Loading network topology..." }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(StatCard, { label: "Network Connections", value: stats.total_connections, icon: "\uD83D\uDD17" }), _jsx(StatCard, { label: "Critical Attack Paths", value: stats.critical_paths, icon: "\uD83D\uDD34" }), _jsx(StatCard, { label: "Unique IPs Involved", value: nodes.length, icon: "\uD83D\uDDA5\uFE0F" })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("h2", { className: "text-lg font-bold mb-4 flex items-center gap-2", children: [_jsx(Network, { className: "w-5 h-5" }), "Network Attack Topology"] }), _jsx("div", { className: "bg-gray-900 rounded-lg p-4 h-96 border border-gray-600 overflow-auto", children: _jsxs("svg", { width: "100%", height: "100%", viewBox: "0 0 800 400", className: "min-h-full", children: [edges.map((edge, idx) => {
                                    const srcNode = nodes.find((n) => n.id === edge.source);
                                    const dstNode = nodes.find((n) => n.id === edge.target);
                                    if (!srcNode || !dstNode)
                                        return null;
                                    const srcIdx = nodes.indexOf(srcNode);
                                    const dstIdx = nodes.indexOf(dstNode);
                                    const x1 = 100 + (srcIdx % 5) * 120;
                                    const y1 = 100 + Math.floor(srcIdx / 5) * 100;
                                    const x2 = 100 + (dstIdx % 5) * 120;
                                    const y2 = 100 + Math.floor(dstIdx / 5) * 100;
                                    return (_jsx("line", { x1: x1, y1: y1, x2: x2, y2: y2, className: `${getEdgeColor(edge.severity)} opacity-60`, strokeWidth: Math.min(edge.threats / 5 + 1, 5), markerEnd: "url(#arrowhead)" }, `edge-${idx}`));
                                }), _jsx("defs", { children: _jsx("marker", { id: "arrowhead", markerWidth: "10", markerHeight: "10", refX: "9", refY: "3", orient: "auto", children: _jsx("polygon", { points: "0 0, 10 3, 0 6", fill: "#666" }) }) }), nodes.map((node, idx) => {
                                    const x = 100 + (idx % 5) * 120;
                                    const y = 100 + Math.floor(idx / 5) * 100;
                                    return (_jsxs("g", { onClick: () => setSelectedNode(node.id), className: "cursor-pointer", children: [_jsx("circle", { cx: x, cy: y, r: "20", className: `${getNodeColor(node)} opacity-80 hover:opacity-100` }), _jsx("text", { x: x, y: y + 4, textAnchor: "middle", className: "text-xs fill-white font-bold", fontSize: "10", children: node.threat_count }), _jsx("text", { x: x, y: y + 35, textAnchor: "middle", className: "text-xs fill-gray-300", fontSize: "9", children: node.label.split('.').slice(-2).join('.') })] }, node.id));
                                })] }) }), _jsx("div", { className: "mt-4 text-xs text-gray-400", children: _jsx("p", { children: "\uD83D\uDD34 Red = Attacker | \uD83D\uDFE0 Orange = Target | \uD83D\uDD35 Blue = Other" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: "\uD83D\uDD17 Top Attack Paths" }), _jsx("div", { className: "space-y-2 max-h-72 overflow-y-auto", children: edges
                                    .sort((a, b) => b.threats - a.threats)
                                    .slice(0, 10)
                                    .map((edge, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-700 rounded-lg text-sm", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-blue-300", children: edge.source }), _jsxs("p", { className: "text-xs text-gray-400", children: ["\u2192 ", edge.target] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-bold text-white", children: edge.threats }), _jsx("p", { className: `text-xs font-semibold ${edge.severity === 'critical' ? 'text-red-400' :
                                                        edge.severity === 'high' ? 'text-orange-400' :
                                                            'text-yellow-400'}`, children: edge.severity.toUpperCase() })] })] }, idx))) })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: "\uD83C\uDFAF Most Targeted IPs" }), _jsx("div", { className: "space-y-2 max-h-72 overflow-y-auto", children: nodes
                                    .filter((n) => n.type === 'target' || n.type === 'dest')
                                    .sort((a, b) => (b.threat_count || 0) - (a.threat_count || 0))
                                    .slice(0, 10)
                                    .map((node, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-700 rounded-lg text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: node.label }), _jsx("p", { className: "text-xs text-gray-400", children: node.type })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: `w-4 h-4 ${node.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}` }), _jsx("p", { className: "font-bold text-white w-6 text-right", children: node.threat_count })] })] }, idx))) })] })] }), selectedNode && (_jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-blue-600", children: [_jsxs("h3", { className: "text-lg font-bold mb-4", children: ["\uD83D\uDCCD Node Details: ", selectedNode] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gray-700 rounded p-3", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Incoming Connections" }), _jsx("p", { className: "text-2xl font-bold", children: edges.filter((e) => e.target === selectedNode).length })] }), _jsxs("div", { className: "bg-gray-700 rounded p-3", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Outgoing Connections" }), _jsx("p", { className: "text-2xl font-bold", children: edges.filter((e) => e.source === selectedNode).length })] }), _jsxs("div", { className: "bg-gray-700 rounded p-3", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Total Incidents" }), _jsx("p", { className: "text-2xl font-bold", children: nodes.find((n) => n.id === selectedNode)?.threat_count || 0 })] })] })] })), _jsxs("div", { className: "bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-300", children: [_jsx("p", { className: "font-semibold mb-1", children: "Network Topology Visualization" }), _jsx("p", { children: "Shows attack paths between source and destination IPs. Red nodes are attackers, orange are targets. Line thickness indicates threat count." })] })] })] }));
}
function StatCard({ label, value, icon }) {
    return (_jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [_jsx("div", { className: "text-3xl mb-2", children: icon }), _jsx("p", { className: "text-gray-400 text-sm", children: label }), _jsx("p", { className: "text-2xl font-bold mt-2", children: value })] }));
}
//# sourceMappingURL=NetworkTopology.js.map