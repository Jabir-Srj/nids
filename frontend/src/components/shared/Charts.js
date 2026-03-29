import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
export const ThreatTimeline = ({ data }) => {
    return (_jsxs("div", { className: "bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-slate-100 dark:text-slate-100", children: "Threat Timeline (24h)" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(AreaChart, { data: data, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "colorCritical", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#ef4444", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#ef4444", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "colorHigh", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#f97316", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#f97316", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "colorMedium", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#f59e0b", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#f59e0b", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#475569" }), _jsx(XAxis, { dataKey: "timestamp", stroke: "#cbd5e1" }), _jsx(YAxis, { stroke: "#cbd5e1" }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '0.5rem',
                                color: '#f1f5f9',
                            } }), _jsx(Legend, {}), _jsx(Area, { type: "monotone", dataKey: "critical", stackId: "1", stroke: "#ef4444", fillOpacity: 1, fill: "url(#colorCritical)", name: "Critical" }), _jsx(Area, { type: "monotone", dataKey: "high", stackId: "1", stroke: "#f97316", fillOpacity: 1, fill: "url(#colorHigh)", name: "High" }), _jsx(Area, { type: "monotone", dataKey: "medium", stackId: "1", stroke: "#f59e0b", fillOpacity: 1, fill: "url(#colorMedium)", name: "Medium" })] }) })] }));
};
export const TopThreats = ({ data }) => {
    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4'];
    return (_jsxs("div", { className: "bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-slate-100 dark:text-slate-100", children: "Top Threat Types" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, label: ({ type, count, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`, outerRadius: 100, fill: "#8884d8", dataKey: "count", children: data.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '0.5rem',
                                color: '#f1f5f9',
                            } })] }) })] }));
};
export const TopAttackers = ({ data }) => {
    return (_jsxs("div", { className: "bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-slate-100 dark:text-slate-100", children: "Top Attacking IPs" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#475569" }), _jsx(XAxis, { dataKey: "ip", stroke: "#cbd5e1", angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { stroke: "#cbd5e1" }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '0.5rem',
                                color: '#f1f5f9',
                            } }), _jsx(Bar, { dataKey: "count", fill: "#06b6d4", radius: [8, 8, 0, 0] })] }) })] }));
};
export const ProtocolDistribution = ({ data }) => {
    const COLORS = ['#06b6d4', '#ec4899', '#a855f7', '#f59e0b', '#10b981', '#ef4444'];
    return (_jsxs("div", { className: "bg-slate-800 dark:bg-slate-800 rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-slate-100 dark:text-slate-100", children: "Protocol Distribution" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, label: ({ protocol, percent }) => `${protocol}: ${(percent * 100).toFixed(0)}%`, outerRadius: 100, fill: "#8884d8", dataKey: "count", children: data.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '0.5rem',
                                color: '#f1f5f9',
                            } })] }) })] }));
};
//# sourceMappingURL=Charts.js.map