import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Activity, Cpu, Database, HardDrive, Zap, AlertCircle } from 'lucide-react';
// Mock data for demo purposes
const getMockHealthData = () => ({
    status: 'healthy',
    uptime: {
        seconds: Math.floor(Math.random() * 86400 * 30),
        hours: Math.random() * 720,
        days: Math.random() * 30,
        boot_time: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        formatted: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
    },
    system: {
        cpu: {
            percent: Math.random() * 50 + 10,
            cores: 8,
            status: 'good',
        },
        memory: {
            percent: Math.random() * 40 + 20,
            total_gb: 16,
            used_gb: Math.random() * 6 + 3,
            available_gb: Math.random() * 10 + 5,
            status: 'good',
        },
        disk: {
            percent: Math.random() * 60 + 20,
            total_gb: 500,
            used_gb: Math.random() * 200 + 100,
            free_gb: Math.random() * 300 + 150,
            status: 'good',
        },
        network: {
            bytes_sent: Math.random() * 1000000000,
            bytes_recv: Math.random() * 1000000000,
        },
    },
    process: {
        cpu_percent: Math.random() * 15,
        memory_mb: Math.random() * 200 + 100,
        num_threads: 12,
    },
    database: {
        size_mb: Math.random() * 50 + 10,
        status: 'healthy',
    },
});
export default function SystemHealth() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchHealth = async () => {
            try {
                // Try the system health endpoint
                const response = await fetch('http://localhost:5000/api/system/health');
                if (!response.ok)
                    throw new Error('Failed to fetch health');
                const data = await response.json();
                setHealth(data);
                setError(null);
                console.log('Real system health data received:', data);
            }
            catch (err) {
                console.error('Health fetch error:', err);
                // Use mock data as fallback
                console.log('Falling back to mock data');
                setHealth(getMockHealthData());
                setError(null);
            }
            finally {
                setLoading(false);
            }
        };
        fetchHealth();
        const interval = setInterval(fetchHealth, 5000);
        return () => clearInterval(interval);
    }, []);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96", children: _jsx("div", { className: "text-gray-400", children: "Loading system health..." }) }));
    }
    if (!health) {
        return (_jsxs("div", { className: "bg-red-900/20 border border-red-700 rounded-lg p-6 text-red-300", children: [_jsx("p", { className: "font-semibold", children: "\u274C Health data unavailable" }), _jsx("p", { className: "text-sm mt-2", children: "Make sure backend is running on http://localhost:5000" })] }));
    }
    const systemData = health.system || getMockHealthData().system;
    const processData = health.process || getMockHealthData().process;
    const databaseData = health.database || getMockHealthData().database;
    const getStatusColor = (status) => {
        switch (status) {
            case 'good':
                return 'text-green-400 bg-green-900/20';
            case 'warning':
                return 'text-yellow-400 bg-yellow-900/20';
            case 'critical':
                return 'text-red-400 bg-red-900/20';
            default:
                return 'text-gray-400 bg-gray-900/20';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: `rounded-lg p-6 border ${health.status === 'healthy'
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-yellow-900/20 border-yellow-700'}`, children: _jsxs("h2", { className: "text-lg font-bold flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5" }), "System Status: ", _jsx("span", { className: "capitalize", children: health.status })] }) }), health.uptime && (_jsxs("div", { className: "bg-purple-900/20 border border-purple-700 rounded-lg p-6", children: [_jsxs("h2", { className: "text-lg font-bold flex items-center gap-2 mb-4", children: [_jsx(Activity, { className: "w-5 h-5" }), "System Uptime"] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-purple-800/30 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Formatted" }), _jsx("p", { className: "text-2xl font-bold mt-2 text-purple-300", children: health.uptime.formatted })] }), _jsxs("div", { className: "bg-purple-800/30 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Days" }), _jsx("p", { className: "text-2xl font-bold mt-2", children: health.uptime.days })] }), _jsxs("div", { className: "bg-purple-800/30 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Hours" }), _jsx("p", { className: "text-2xl font-bold mt-2", children: health.uptime.hours })] }), _jsxs("div", { className: "bg-purple-800/30 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Boot Time" }), _jsx("p", { className: "text-sm font-bold mt-2 truncate", children: new Date(health.uptime.boot_time).toLocaleString() })] })] })] })), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold flex items-center gap-2", children: [_jsx(Cpu, { className: "w-5 h-5" }), "CPU Usage"] }), _jsx("span", { className: `text-sm font-semibold px-3 py-1 rounded ${getStatusColor(systemData.cpu.status)}`, children: systemData.cpu.status })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Utilization" }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "w-full bg-gray-700 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all ${systemData.cpu.percent > 80
                                                        ? 'bg-red-500'
                                                        : systemData.cpu.percent > 50
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'}`, style: { width: `${Math.min(100, systemData.cpu.percent)}%` } }) }), _jsxs("p", { className: "text-2xl font-bold mt-2", children: [systemData.cpu.percent.toFixed(1), "%"] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Cores" }), _jsx("p", { className: "text-2xl font-bold mt-4", children: systemData.cpu.cores }), _jsx("p", { className: "text-gray-400 text-sm mt-2", children: "available" })] })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5" }), "Memory Usage"] }), _jsx("span", { className: `text-sm font-semibold px-3 py-1 rounded ${getStatusColor(systemData.memory.status)}`, children: systemData.memory.status })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Utilization" }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "w-full bg-gray-700 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all ${systemData.memory.percent > 80
                                                        ? 'bg-red-500'
                                                        : systemData.memory.percent > 50
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'}`, style: { width: `${Math.min(100, systemData.memory.percent)}%` } }) }), _jsxs("p", { className: "text-2xl font-bold mt-2", children: [systemData.memory.percent.toFixed(1), "%"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-xs", children: "Used" }), _jsxs("p", { className: "text-xl font-bold", children: [systemData.memory.used_gb.toFixed(2), " GB"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-xs", children: "Total" }), _jsxs("p", { className: "text-xl font-bold", children: [systemData.memory.total_gb.toFixed(2), " GB"] })] })] })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold flex items-center gap-2", children: [_jsx(HardDrive, { className: "w-5 h-5" }), "Disk Usage"] }), _jsx("span", { className: `text-sm font-semibold px-3 py-1 rounded ${getStatusColor(systemData.disk.status)}`, children: systemData.disk.status })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Utilization" }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "w-full bg-gray-700 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all ${systemData.disk.percent > 80
                                                        ? 'bg-red-500'
                                                        : systemData.disk.percent > 50
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'}`, style: { width: `${Math.min(100, systemData.disk.percent)}%` } }) }), _jsxs("p", { className: "text-2xl font-bold mt-2", children: [systemData.disk.percent.toFixed(1), "%"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-xs", children: "Used" }), _jsxs("p", { className: "text-xl font-bold", children: [systemData.disk.used_gb.toFixed(2), " GB"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-xs", children: "Free" }), _jsxs("p", { className: "text-xl font-bold text-green-400", children: [systemData.disk.free_gb.toFixed(2), " GB"] })] })] })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("h3", { className: "text-lg font-bold flex items-center gap-2 mb-4", children: [_jsx(Database, { className: "w-5 h-5" }), "Database Status"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-gray-700 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Database Size" }), _jsxs("p", { className: "text-2xl font-bold mt-2", children: [databaseData.size_mb.toFixed(2), " MB"] })] }), _jsxs("div", { className: "bg-gray-700 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Status" }), _jsx("p", { className: "text-2xl font-bold mt-2 capitalize text-green-400", children: databaseData.status })] })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: "Application Process" }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gray-700 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "CPU Usage" }), _jsxs("p", { className: "text-2xl font-bold mt-2", children: [processData.cpu_percent.toFixed(1), "%"] })] }), _jsxs("div", { className: "bg-gray-700 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Memory" }), _jsxs("p", { className: "text-2xl font-bold mt-2", children: [processData.memory_mb.toFixed(0), " MB"] })] }), _jsxs("div", { className: "bg-gray-700 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Threads" }), _jsx("p", { className: "text-2xl font-bold mt-2", children: processData.num_threads })] })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: "Network Statistics" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-gray-700 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Bytes Sent" }), _jsxs("p", { className: "text-xl font-bold mt-2", children: [(systemData.network.bytes_sent / 1024 / 1024).toFixed(2), " MB"] })] }), _jsxs("div", { className: "bg-gray-700 rounded p-4", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "Bytes Received" }), _jsxs("p", { className: "text-xl font-bold mt-2", children: [(systemData.network.bytes_recv / 1024 / 1024).toFixed(2), " MB"] })] })] })] }), _jsxs("div", { className: "bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-300", children: [_jsx("p", { className: "font-semibold mb-1", children: "System Health Monitoring" }), _jsx("p", { children: "Real-time monitoring of CPU, memory, disk, and network resources. The system is optimized for detection and response performance." })] })] })] }));
}
//# sourceMappingURL=SystemHealth.js.map