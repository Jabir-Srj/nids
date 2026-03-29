import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, TrendingUp, Shield, Server, Zap, Globe, Lock, } from 'lucide-react';
export default function DashboardV2() {
    const [stats, setStats] = useState({
        total_alerts: 0,
        critical_count: 0,
        threats_blocked: 0,
        uptime_percent: 0,
        packet_rate: 0,
        detection_rate: 0,
    });
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        cpu: 0,
        memory: 0,
        disk: 0,
    });
    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(interval);
    }, []);
    const fetchDashboardData = async () => {
        try {
            // Fetch alerts and calculate stats
            const alertsRes = await fetch('http://localhost:5000/api/alerts');
            if (alertsRes.ok) {
                const alertData = await alertsRes.json();
                const alerts = Array.isArray(alertData) ? alertData : alertData.alerts || [];
                setRecentAlerts(alerts.slice(0, 5));
                // Calculate stats from alerts
                const total = alerts.length;
                const critical = alerts.filter((a) => a.severity?.toLowerCase() === 'critical').length;
                const high = alerts.filter((a) => a.severity?.toLowerCase() === 'high').length;
                setStats({
                    total_alerts: total,
                    critical_count: critical,
                    threats_blocked: high,
                    uptime_percent: 99.8,
                    packet_rate: total * 100,
                    detection_rate: 98.5,
                });
            }
            // Fetch system health
            const healthRes = await fetch('http://localhost:5000/api/system/health');
            if (healthRes.ok) {
                const healthData = await healthRes.json();
                setSystemHealth({
                    cpu: healthData.system?.cpu?.percent || 0,
                    memory: healthData.system?.memory?.percent || 0,
                    disk: healthData.system?.disk?.percent || 0,
                });
            }
        }
        catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(KPICard, { title: "Total Alerts", value: stats.total_alerts, change: "+12%", icon: _jsx(AlertTriangle, { className: "w-5 h-5" }), severity: "critical" }), _jsx(KPICard, { title: "Critical Threats", value: stats.critical_count, change: "-8%", icon: _jsx(Shield, { className: "w-5 h-5" }), severity: "warning" }), _jsx(KPICard, { title: "Threats Blocked", value: stats.threats_blocked, change: "+24%", icon: _jsx(Lock, { className: "w-5 h-5" }), severity: "success" }), _jsx(KPICard, { title: "System Uptime", value: `${stats.uptime_percent}%`, change: "Stable", icon: _jsx(Activity, { className: "w-5 h-5" }), severity: "info" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "rounded-lg p-6 border transition-all duration-300 hover:shadow-md", style: {
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderColor: 'rgb(229, 227, 224)',
                        }, children: [_jsxs("h3", { className: "text-lg font-serif-display font-bold mb-4 flex items-center gap-2", style: { color: '#1a1a1a' }, children: [_jsx(TrendingUp, { className: "w-5 h-5", style: { color: '#d97706' } }), "Threat Distribution"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(ThreatBar, { label: "Critical", value: 15, color: "#f97316" }), _jsx(ThreatBar, { label: "High", value: 28, color: "#d97706" }), _jsx(ThreatBar, { label: "Medium", value: 42, color: "#fcd34d" }), _jsx(ThreatBar, { label: "Low", value: 15, color: "#22c55e" })] })] }), _jsxs("div", { className: "rounded-lg p-6 border transition-all duration-300 hover:shadow-md", style: {
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderColor: 'rgb(229, 227, 224)',
                        }, children: [_jsxs("h3", { className: "text-lg font-serif-display font-bold mb-4 flex items-center gap-2", style: { color: '#1a1a1a' }, children: [_jsx(Server, { className: "w-5 h-5", style: { color: '#3b82f6' } }), "System Health"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(HealthIndicator, { label: "CPU Usage", value: systemHealth.cpu }), _jsx(HealthIndicator, { label: "Memory Usage", value: systemHealth.memory }), _jsx(HealthIndicator, { label: "Disk Usage", value: systemHealth.disk })] })] }), _jsxs("div", { className: "rounded-lg p-6 border transition-all duration-300 hover:shadow-md", style: {
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderColor: 'rgb(229, 227, 224)',
                        }, children: [_jsxs("h3", { className: "text-lg font-serif-display font-bold mb-4 flex items-center gap-2", style: { color: '#1a1a1a' }, children: [_jsx(Zap, { className: "w-5 h-5", style: { color: '#f97316' } }), "Performance"] }), _jsxs("div", { className: "space-y-3", children: [_jsx(StatRow, { label: "Packet Rate", value: `${stats.packet_rate} pps`, icon: "\uD83D\uDCCA" }), _jsx(StatRow, { label: "Detection Rate", value: `${stats.detection_rate.toFixed(1)}%`, icon: "\uD83C\uDFAF" }), _jsx(StatRow, { label: "Response Time", value: "<100ms", icon: "\u26A1" }), _jsx(StatRow, { label: "Cache Hit Rate", value: "94.2%", icon: "\uD83D\uDCBE" })] })] })] }), _jsxs("div", { className: "rounded-lg p-6 border transition-all duration-300 hover:shadow-md", style: {
                    backgroundColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(229, 227, 224)',
                }, children: [_jsxs("h3", { className: "text-lg font-serif-display font-bold mb-4 flex items-center gap-2", style: { color: '#1a1a1a' }, children: [_jsx(AlertTriangle, { className: "w-5 h-5", style: { color: '#f97316' } }), "Recent Alerts"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { style: { borderColor: 'rgb(229, 227, 224)' }, className: "border-b", children: [_jsx("th", { className: "text-left py-3 px-4 font-semibold", style: { color: '#6b6b6b' }, children: "Time" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold", style: { color: '#6b6b6b' }, children: "Threat Type" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold", style: { color: '#6b6b6b' }, children: "Source IP" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold", style: { color: '#6b6b6b' }, children: "Severity" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold", style: { color: '#6b6b6b' }, children: "Action" })] }) }), _jsx("tbody", { children: recentAlerts.length > 0 ? (recentAlerts.map((alert, idx) => (_jsxs("tr", { className: "border-b transition-colors duration-200 hover:bg-[#f5f3f0]", style: { borderColor: 'rgb(229, 227, 224)' }, children: [_jsx("td", { className: "py-3 px-4 font-code text-xs", style: { color: '#6b6b6b' }, children: new Date(alert.timestamp).toLocaleTimeString() }), _jsx("td", { className: "py-3 px-4 font-semibold", style: { color: '#1a1a1a' }, children: alert.type || alert.threat_type || 'Unknown' }), _jsx("td", { className: "py-3 px-4 font-code text-xs", style: { color: '#d97706' }, children: alert.source || alert.source_ip || 'N/A' }), _jsx("td", { className: "py-3 px-4", children: _jsx(SeverityBadge, { severity: alert.severity }) }), _jsx("td", { className: "py-3 px-4", children: _jsx("button", { className: "text-xs px-3 py-1.5 rounded-md font-semibold transition-all duration-200 hover:shadow-sm", style: {
                                                        backgroundColor: 'rgb(245, 243, 240)',
                                                        color: '#1a1a1a',
                                                        border: '1px solid rgb(229, 227, 224)',
                                                    }, children: "Details" }) })] }, idx)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "py-8 text-center", style: { color: '#6b6b6b' }, children: "No alerts yet" }) })) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "rounded-lg p-6 border transition-all duration-300 hover:shadow-md", style: {
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderColor: 'rgb(229, 227, 224)',
                        }, children: [_jsxs("h3", { className: "text-lg font-serif-display font-bold mb-4 flex items-center gap-2", style: { color: '#1a1a1a' }, children: [_jsx(Globe, { className: "w-5 h-5", style: { color: '#f97316' } }), "Top Attack Origins"] }), _jsx("div", { className: "space-y-2", children: [
                                    { country: 'China', count: 245, percent: 35 },
                                    { country: 'Russia', count: 189, percent: 27 },
                                    { country: 'India', count: 124, percent: 18 },
                                    { country: 'Brazil', count: 98, percent: 14 },
                                    { country: 'Others', count: 44, percent: 6 },
                                ].map((item, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-md transition-all duration-200", style: {
                                        backgroundColor: 'rgb(245, 243, 240)',
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = 'rgb(237, 233, 230)';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
                                    }, children: [_jsx("span", { className: "text-sm font-semibold", style: { color: '#2d2d2d' }, children: item.country }), _jsx("div", { className: "flex-1 mx-3 rounded-full h-2", style: { backgroundColor: 'rgb(229, 227, 224)' }, children: _jsx("div", { className: "h-2 rounded-full shadow-sm", style: { width: `${item.percent}%`, backgroundColor: '#f97316' } }) }), _jsx("span", { className: "text-sm font-bold text-right w-12", style: { color: '#1a1a1a' }, children: item.count })] }, idx))) })] }), _jsxs("div", { className: "rounded-lg p-6 border transition-all duration-300 hover:shadow-md", style: {
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderColor: 'rgb(229, 227, 224)',
                        }, children: [_jsxs("h3", { className: "text-lg font-serif-display font-bold mb-4 flex items-center gap-2", style: { color: '#1a1a1a' }, children: [_jsx("span", { children: "\uD83D\uDD0D" }), " Detection Methods"] }), _jsx("div", { className: "space-y-2", children: [
                                    { method: 'Signature-Based', count: 456, percent: 48 },
                                    { method: 'Anomaly Detection', count: 312, percent: 33 },
                                    { method: 'Heuristics', count: 156, percent: 16 },
                                    { method: 'ML-Based', count: 28, percent: 3 },
                                ].map((item, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-md transition-all duration-200", style: {
                                        backgroundColor: 'rgb(245, 243, 240)',
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = 'rgb(237, 233, 230)';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
                                    }, children: [_jsx("span", { className: "text-sm font-semibold", style: { color: '#2d2d2d' }, children: item.method }), _jsx("div", { className: "flex-1 mx-3 rounded-full h-2", style: { backgroundColor: 'rgb(229, 227, 224)' }, children: _jsx("div", { className: "h-2 rounded-full shadow-sm", style: { width: `${item.percent}%`, backgroundColor: '#3b82f6' } }) }), _jsx("span", { className: "text-sm font-bold text-right w-12", style: { color: '#1a1a1a' }, children: item.count })] }, idx))) })] })] })] }));
}
function KPICard({ title, value, change, icon, severity }) {
    const getColors = () => {
        switch (severity) {
            case 'critical':
                return { bg: 'rgba(249, 115, 22, 0.08)', border: 'rgb(249, 115, 22)', accent: '#f97316', text: '#f97316' };
            case 'warning':
                return { bg: 'rgba(217, 119, 6, 0.08)', border: 'rgb(217, 119, 6)', accent: '#d97706', text: '#d97706' };
            case 'success':
                return { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgb(34, 197, 94)', accent: '#22c55e', text: '#22c55e' };
            default:
                return { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgb(59, 130, 246)', accent: '#3b82f6', text: '#3b82f6' };
        }
    };
    const colors = getColors();
    return (_jsxs("div", { className: "rounded-lg p-6 border transition-all duration-300 hover:shadow-md animate-scale-in", style: {
            backgroundColor: colors.bg,
            borderColor: colors.border,
        }, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("p", { className: "text-sm font-semibold", style: { color: colors.text }, children: title }), _jsx("div", { style: { color: colors.accent }, children: icon })] }), _jsx("p", { className: "text-3xl font-serif-display font-bold mb-2", style: { color: '#1a1a1a' }, children: value }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: colors.accent } }), _jsxs("p", { className: "text-xs font-code", style: { color: '#6b6b6b' }, children: [change, " from last week"] })] })] }));
}
function ThreatBar({ label, value, color }) {
    return (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-semibold", style: { color: '#2d2d2d' }, children: label }), _jsxs("span", { className: "text-sm font-bold px-2 py-0.5 rounded", style: {
                            backgroundColor: 'rgb(245, 243, 240)',
                            color: '#1a1a1a',
                        }, children: [value, "%"] })] }), _jsx("div", { className: "w-full rounded-full h-3 overflow-hidden shadow-sm", style: { backgroundColor: 'rgb(229, 227, 224)' }, children: _jsx("div", { className: "h-3 rounded-full shadow-md transition-all duration-500", style: { width: `${value}%`, backgroundColor: color } }) })] }));
}
function HealthIndicator({ label, value }) {
    const getColor = () => {
        if (value > 80)
            return '#f97316';
        if (value > 60)
            return '#d97706';
        return '#22c55e';
    };
    const color = getColor();
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-semibold", style: { color: '#2d2d2d' }, children: label }), _jsxs("span", { className: "text-sm font-bold", style: { color }, children: [Math.round(value), "%"] })] }), _jsx("div", { className: "w-full rounded-full h-3 overflow-hidden shadow-sm", style: { backgroundColor: 'rgb(229, 227, 224)' }, children: _jsx("div", { className: "h-3 rounded-full shadow-md transition-all duration-500", style: { width: `${value}%`, backgroundColor: color } }) })] }));
}
function StatRow({ label, value, icon }) {
    return (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-md transition-all duration-200", style: {
            backgroundColor: 'rgb(245, 243, 240)',
        }, onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = 'rgb(237, 233, 230)';
        }, onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
        }, children: [_jsxs("span", { className: "text-sm font-semibold", style: { color: '#2d2d2d' }, children: [icon, " ", label] }), _jsx("span", { className: "font-bold", style: { color: '#1a1a1a' }, children: value })] }));
}
function SeverityBadge({ severity }) {
    const getColors = () => {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', border: '#f97316' };
            case 'high':
                return { bg: 'rgba(217, 119, 6, 0.1)', text: '#d97706', border: '#d97706' };
            case 'medium':
                return { bg: 'rgba(252, 211, 77, 0.1)', text: '#fcd34d', border: '#fcd34d' };
            default:
                return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: '#22c55e' };
        }
    };
    const colors = getColors();
    return (_jsx("span", { className: "px-2.5 py-1 rounded-md text-xs font-bold border", style: {
            backgroundColor: colors.bg,
            color: colors.text,
            borderColor: colors.border,
        }, children: severity?.toUpperCase() || 'UNKNOWN' }));
}
//# sourceMappingURL=DashboardV2.js.map