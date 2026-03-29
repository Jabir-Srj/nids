import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
export const ThreatTimeline = ({ data }) => {
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-white", children: "Threat Timeline (24h)" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(AreaChart, { data: data, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "colorCritical", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#dc2626", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#dc2626", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "colorHigh", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#ea580c", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#ea580c", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "colorMedium", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#eab308", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#eab308", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "timestamp", stroke: "#9ca3af" }), _jsx(YAxis, { stroke: "#9ca3af" }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                                color: '#f3f4f6',
                            } }), _jsx(Legend, {}), _jsx(Area, { type: "monotone", dataKey: "critical", stackId: "1", stroke: "#dc2626", fillOpacity: 1, fill: "url(#colorCritical)", name: "Critical" }), _jsx(Area, { type: "monotone", dataKey: "high", stackId: "1", stroke: "#ea580c", fillOpacity: 1, fill: "url(#colorHigh)", name: "High" }), _jsx(Area, { type: "monotone", dataKey: "medium", stackId: "1", stroke: "#eab308", fillOpacity: 1, fill: "url(#colorMedium)", name: "Medium" })] }) })] }));
};
export const TopThreats = ({ data }) => {
    const COLORS = ['#dc2626', '#ea580c', '#eab308', '#84cc16', '#22c55e', '#06b6d4'];
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-white", children: "Top Threat Types" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, label: ({ type, count, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`, outerRadius: 100, fill: "#8884d8", dataKey: "count", children: data.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                                color: '#f3f4f6',
                            } })] }) })] }));
};
export const TopAttackers = ({ data }) => {
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-white", children: "Top Attacking IPs" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "ip", stroke: "#9ca3af", angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { stroke: "#9ca3af" }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                                color: '#f3f4f6',
                            } }), _jsx(Bar, { dataKey: "count", fill: "#3b82f6", radius: [8, 8, 0, 0] })] }) })] }));
};
export const ProtocolDistribution = ({ data }) => {
    const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-white", children: "Protocol Distribution" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, label: ({ protocol, percent }) => `${protocol}: ${(percent * 100).toFixed(0)}%`, outerRadius: 100, fill: "#8884d8", dataKey: "count", children: data.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                                color: '#f3f4f6',
                            } })] }) })] }));
};
//# sourceMappingURL=Charts.js.map