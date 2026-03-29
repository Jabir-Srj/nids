import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, } from 'recharts';
import { AlertCircle, TrendingUp, Package, Activity, Zap, Shield } from 'lucide-react';
import { statsAPI, alertsAPI, mlAPI } from '../services/api';
const COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
};
export default function Dashboard() {
    const [trafficData, setTrafficData] = useState([
        { time: '00:00', inbound: 1200, outbound: 800, anomalies: 2 },
        { time: '01:00', inbound: 1900, outbound: 1200, anomalies: 5 },
        { time: '02:00', inbound: 1600, outbound: 900, anomalies: 3 },
        { time: '03:00', inbound: 2100, outbound: 1400, anomalies: 8 },
        { time: '04:00', inbound: 1800, outbound: 1100, anomalies: 4 },
        { time: '05:00', inbound: 2400, outbound: 1600, anomalies: 12 },
    ]);
    const [threats, setThreats] = useState([]);
    const [stats, setStats] = useState({
        totalPackets: 0,
        threatsDetected: 0,
        rulesActive: 0,
        mlAccuracy: 0,
        packetRate: 0,
        avgResponseTime: 0,
    });
    const [threatTypes, setThreatTypes] = useState([]);
    const [protocolData, setProtocolData] = useState([]);
    const [systemHealth, setSystemHealth] = useState([
        { category: 'Detection', value: 92 },
        { category: 'Response', value: 88 },
        { category: 'Accuracy', value: 95 },
        { category: 'Coverage', value: 87 },
        { category: 'Performance', value: 91 },
    ]);
    const [loading, setLoading] = useState(true);
    // Fetch real data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch stats
                try {
                    const statsRes = await statsAPI.overview();
                    if (statsRes.data) {
                        setStats({
                            totalPackets: statsRes.data.total_packets || 0,
                            threatsDetected: statsRes.data.threats_detected || 0,
                            rulesActive: statsRes.data.active_rules || 0,
                            mlAccuracy: statsRes.data.ml_accuracy || 85,
                            packetRate: statsRes.data.packet_rate || 0,
                            avgResponseTime: statsRes.data.avg_response_time || 0,
                        });
                    }
                }
                catch (e) {
                    console.log('Stats API not fully implemented yet, using defaults');
                }
                // Fetch system health
                try {
                    const healthRes = await fetch('http://localhost:5000/api/system/health');
                    if (healthRes.ok) {
                        const healthData = await healthRes.json();
                        if (healthData.system) {
                            setSystemHealth([
                                { category: 'CPU', value: 100 - healthData.system.cpu.percent },
                                { category: 'Memory', value: 100 - healthData.system.memory.percent },
                                { category: 'Disk', value: 100 - healthData.system.disk.percent },
                                { category: 'Detection', value: 92 },
                                { category: 'Response', value: 88 },
                            ]);
                        }
                    }
                }
                catch (e) {
                    console.log('System health API not available');
                }
                // Fetch alerts
                try {
                    const alertsRes = await alertsAPI.getAll(10);
                    if (alertsRes.data) {
                        const threatsData = Array.isArray(alertsRes.data)
                            ? alertsRes.data.slice(0, 5)
                            : alertsRes.data.alerts?.slice(0, 5) || [];
                        setThreats(threatsData.map((alert) => ({
                            id: alert.id || Math.random().toString(),
                            type: alert.type || 'Unknown Threat',
                            severity: alert.severity || 'low',
                            timestamp: alert.timestamp || new Date().toISOString(),
                            source: alert.source_ip || alert.source || 'Unknown',
                        })));
                    }
                }
                catch (e) {
                    console.log('Alerts API not fully implemented yet');
                }
                // Fetch ML accuracy
                try {
                    const mlRes = await mlAPI.accuracy();
                    if (mlRes.data?.accuracy) {
                        setStats((prev) => ({
                            ...prev,
                            mlAccuracy: mlRes.data.accuracy,
                        }));
                    }
                }
                catch (e) {
                    console.log('ML API not fully implemented yet');
                }
                setLoading(false);
            }
            catch (error) {
                console.error('Failed to fetch data:', error);
                setLoading(false);
            }
        };
        fetchData();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);
    // Simulate live traffic updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTrafficData((prev) => {
                const newData = [...prev.slice(1)];
                const now = new Date();
                const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                newData.push({
                    time,
                    inbound: Math.floor(Math.random() * 2000 + 1000),
                    outbound: Math.floor(Math.random() * 1500 + 500),
                    anomalies: Math.floor(Math.random() * 15),
                });
                return newData;
            });
            setStats((prev) => ({
                ...prev,
                totalPackets: prev.totalPackets + Math.floor(Math.random() * 500 + 100),
                threatsDetected: prev.threatsDetected + (Math.random() > 0.85 ? 1 : 0),
                packetRate: Math.floor(Math.random() * 3000 + 500),
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    const threatDistribution = [
        { name: 'Critical', value: 5, color: COLORS.critical },
        { name: 'High', value: 12, color: COLORS.high },
        { name: 'Medium', value: 15, color: COLORS.medium },
        { name: 'Low', value: 10, color: COLORS.low },
    ];
    const protocolDistribution = [
        { name: 'TCP', value: 45 },
        { name: 'UDP', value: 30 },
        { name: 'ICMP', value: 15 },
        { name: 'Other', value: 10 },
    ];
    const topThreats = [
        { name: 'SQL Injection', value: 28 },
        { name: 'XSS', value: 18 },
        { name: 'Port Scan', value: 35 },
        { name: 'DDoS', value: 15 },
        { name: 'Malware', value: 12 },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [loading && (_jsxs("div", { className: "bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-blue-300", children: ["\u26A1 Connecting to backend... ", stats.totalPackets > 0 && '✓ Connected!'] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(StatCard, { icon: _jsx(Package, { className: "w-6 h-6" }), label: "Total Packets", value: stats.totalPackets.toLocaleString(), trend: "+12.5%", color: "blue" }), _jsx(StatCard, { icon: _jsx(AlertCircle, { className: "w-6 h-6" }), label: "Threats Detected", value: stats.threatsDetected, trend: "+8.2%", color: "red" }), _jsx(StatCard, { icon: _jsx(TrendingUp, { className: "w-6 h-6" }), label: "Active Rules", value: stats.rulesActive, trend: "100%", color: "green" }), _jsx(StatCard, { icon: _jsx(Activity, { className: "w-6 h-6" }), label: "ML Accuracy", value: `${Math.min(99.9, stats.mlAccuracy).toFixed(1)}%`, trend: "+0.5%", color: "purple" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(StatCard, { icon: _jsx(Zap, { className: "w-5 h-5" }), label: "Packet Rate", value: `${stats.packetRate.toLocaleString()} pps`, trend: "Real-time", color: "blue" }), _jsx(StatCard, { icon: _jsx(Shield, { className: "w-5 h-5" }), label: "Avg Response", value: `${stats.avgResponseTime.toFixed(2)}ms`, trend: "<100ms target", color: "green" })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83D\uDD34 Network Traffic (Live)" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(AreaChart, { data: trafficData, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "inbound", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "outbound", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "time", stroke: "#9ca3af" }), _jsx(YAxis, { stroke: "#9ca3af" }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }, labelStyle: { color: '#f3f4f6' } }), _jsx(Legend, {}), _jsx(Area, { type: "monotone", dataKey: "inbound", stroke: "#3b82f6", fillOpacity: 1, fill: "url(#inbound)", name: "Inbound (pps)" }), _jsx(Area, { type: "monotone", dataKey: "outbound", stroke: "#10b981", fillOpacity: 1, fill: "url(#outbound)", name: "Outbound (pps)" })] }) })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83D\uDD0D Anomalies Detected (Live)" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(LineChart, { data: trafficData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "time", stroke: "#9ca3af" }), _jsx(YAxis, { stroke: "#9ca3af" }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }, labelStyle: { color: '#f3f4f6' } }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "anomalies", stroke: "#ef4444", strokeWidth: 2, dot: { fill: '#ef4444', r: 4 }, name: "Anomaly Events" })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83D\uDCCA System Health" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(RadarChart, { data: systemHealth, children: [_jsx(PolarGrid, { stroke: "#374151" }), _jsx(PolarAngleAxis, { dataKey: "category", stroke: "#9ca3af" }), _jsx(PolarRadiusAxis, { stroke: "#9ca3af", domain: [0, 100] }), _jsx(Radar, { name: "Health Score", dataKey: "value", stroke: "#3b82f6", fill: "#3b82f6", fillOpacity: 0.6 }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }, labelStyle: { color: '#f3f4f6' } })] }) })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\u26A0\uFE0F Top Threat Types" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: topThreats, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "name", stroke: "#9ca3af" }), _jsx(YAxis, { stroke: "#9ca3af" }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }, labelStyle: { color: '#f3f4f6' } }), _jsx(Bar, { dataKey: "value", fill: "#ef4444", name: "Count", radius: [8, 8, 0, 0] })] }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83C\uDFAF Threat Severity Distribution" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: threatDistribution, cx: "50%", cy: "50%", labelLine: false, label: (entry) => `${entry.name}: ${entry.value}`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: threatDistribution.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }, labelStyle: { color: '#f3f4f6' } })] }) })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83D\uDCE1 Protocol Distribution" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: protocolDistribution, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "name", stroke: "#9ca3af" }), _jsx(YAxis, { stroke: "#9ca3af" }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }, labelStyle: { color: '#f3f4f6' } }), _jsx(Bar, { dataKey: "value", fill: "#3b82f6", name: "Packets (%)", radius: [8, 8, 0, 0] })] }) })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83D\uDEA8 Recent Threats" }), _jsx("div", { className: "space-y-3", children: threats.length > 0 ? (threats.map((threat) => (_jsxs("div", { className: `flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors`, children: [_jsxs("div", { className: "flex items-center gap-3 flex-1", children: [_jsx("div", { className: `w-3 h-3 rounded-full`, style: { backgroundColor: COLORS[threat.severity] } }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: threat.type }), _jsxs("p", { className: "text-sm text-gray-400", children: ["From: ", threat.source] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold capitalize`, style: {
                                                backgroundColor: COLORS[threat.severity] + '33',
                                                color: COLORS[threat.severity],
                                            }, children: threat.severity }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: new Date(threat.timestamp).toLocaleTimeString() })] })] }, threat.id)))) : (_jsx("p", { className: "text-gray-400 text-center py-4", children: "No threats detected yet" })) })] })] }));
}
function StatCard({ icon, label, value, trend, color }) {
    const colorClasses = {
        blue: 'bg-blue-900/20 border-blue-700',
        red: 'bg-red-900/20 border-red-700',
        green: 'bg-green-900/20 border-green-700',
        purple: 'bg-purple-900/20 border-purple-700',
    };
    return (_jsx("div", { className: `rounded-lg p-6 border ${colorClasses[color]}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: label }), _jsx("p", { className: "text-2xl font-bold mt-2", children: value }), _jsx("p", { className: "text-xs text-green-400 mt-1", children: trend })] }), _jsx("div", { className: "text-3xl opacity-50", children: icon })] }) }));
}
//# sourceMappingURL=Dashboard.js.map