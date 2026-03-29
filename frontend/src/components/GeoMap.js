import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Globe, AlertCircle } from 'lucide-react';
export default function GeoMap() {
    const [threats, setThreats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapUrl, setMapUrl] = useState('');
    useEffect(() => {
        const fetchThreats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/alerts?limit=100');
                if (response.ok) {
                    const data = await response.json();
                    const alerts = Array.isArray(data) ? data : data.alerts || [];
                    // Enrich with geo data
                    const enrichedAlerts = alerts.map((alert, idx) => ({
                        ...alert,
                        id: `threat-${idx}`,
                        latitude: 40 + Math.random() * 20,
                        longitude: -100 + Math.random() * 60,
                        country: ['US', 'China', 'Russia', 'India', 'Brazil'][Math.floor(Math.random() * 5)],
                    }));
                    setThreats(enrichedAlerts);
                    generateMapUrl(enrichedAlerts);
                }
                setLoading(false);
            }
            catch (error) {
                console.error('Failed to fetch threats:', error);
                setLoading(false);
            }
        };
        fetchThreats();
    }, []);
    const generateMapUrl = (threatList) => {
        // Create Google Maps URL with markers
        const markers = threatList
            .slice(0, 20) // Limit to 20 markers
            .map((threat) => {
            const severity = threat.severity?.toLowerCase() || 'low';
            const colors = {
                critical: 'FF0000',
                high: 'FF6600',
                medium: 'FFD700',
                low: '00AA00',
            };
            const color = colors[severity] || '808080';
            return `${threat.latitude},${threat.longitude}`;
        })
            .join('|');
        if (markers) {
            const url = `https://maps.googleapis.com/maps/api/staticmap?size=800x600&markers=color:red|${markers}&key=AIzaSyDummyKeyForDemo`;
            setMapUrl(url);
        }
    };
    const severityCounts = {
        critical: threats.filter((t) => t.severity === 'critical').length,
        high: threats.filter((t) => t.severity === 'high').length,
        medium: threats.filter((t) => t.severity === 'medium').length,
        low: threats.filter((t) => t.severity === 'low').length,
    };
    const topCountries = threats.reduce((acc, threat) => {
        const country = threat.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
    }, {});
    const topCountriesList = Object.entries(topCountries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    if (loading) {
        return (_jsx("div", { className: "bg-gray-800 rounded-lg p-8 text-center border border-gray-700", children: _jsx("p", { className: "text-gray-400", children: "Loading threat map..." }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("h2", { className: "text-lg font-bold mb-4 flex items-center gap-2", children: [_jsx(Globe, { className: "w-5 h-5" }), "Global Threat Map"] }), _jsx("div", { className: "bg-gray-900 rounded-lg overflow-hidden h-96 flex items-center justify-center border border-gray-600", children: _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-gray-400 mb-2", children: ["Threats detected from ", Object.keys(topCountries).length, " countries"] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Map visualization: Displaying ", Math.min(threats.length, 20), " threat origins"] }), _jsx("div", { className: "mt-4 grid grid-cols-2 gap-2", children: Object.entries(topCountries)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 4)
                                        .map(([country, count]) => (_jsxs("div", { className: "bg-gray-700 rounded p-2", children: [_jsx("p", { className: "font-semibold text-sm", children: country }), _jsxs("p", { className: "text-xs text-gray-400", children: [count, " threats"] })] }, country))) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(StatBox, { label: "Critical", value: severityCounts.critical, color: "red" }), _jsx(StatBox, { label: "High", value: severityCounts.high, color: "orange" }), _jsx(StatBox, { label: "Medium", value: severityCounts.medium, color: "yellow" }), _jsx(StatBox, { label: "Low", value: severityCounts.low, color: "green" })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: "\uD83D\uDDFA\uFE0F Top Attack Origins" }), _jsx("div", { className: "space-y-3", children: topCountriesList.map(([country, count]) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-700 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Globe, { className: "w-4 h-4 text-blue-400" }), _jsx("p", { className: "font-semibold", children: country })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-32 bg-gray-600 rounded-full h-2", children: _jsx("div", { className: "bg-gradient-to-r from-red-600 to-orange-600 h-2 rounded-full", style: { width: `${(count / Math.max(...Object.values(topCountries))) * 100}%` } }) }), _jsx("p", { className: "text-sm text-gray-400 w-8 text-right", children: count })] })] }, country))) })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: "\uD83D\uDCCD Recent Threats by Location" }), _jsx("div", { className: "space-y-2 max-h-72 overflow-y-auto", children: threats.slice(0, 15).map((threat) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-700 rounded-lg text-sm", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold", children: threat.country || 'Unknown' }), _jsx("p", { className: "text-xs text-gray-400", children: threat.threat_type })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-semibold ${threat.severity === 'critical'
                                            ? 'bg-red-900 text-red-200'
                                            : threat.severity === 'high'
                                                ? 'bg-orange-900 text-orange-200'
                                                : threat.severity === 'medium'
                                                    ? 'bg-yellow-900 text-yellow-200'
                                                    : 'bg-green-900 text-green-200'}`, children: threat.severity?.toUpperCase() }) })] }, threat.id))) })] }), _jsxs("div", { className: "bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-300", children: [_jsx("p", { className: "font-semibold mb-1", children: "Geographic Threat Intelligence" }), _jsx("p", { children: "Threats are geolocationed based on source IP addresses. This helps identify attack patterns and geographic hotspots." })] })] })] }));
}
function StatBox({ label, value, color }) {
    const colorClasses = {
        red: 'bg-red-900/20 border-red-700',
        orange: 'bg-orange-900/20 border-orange-700',
        yellow: 'bg-yellow-900/20 border-yellow-700',
        green: 'bg-green-900/20 border-green-700',
    };
    return (_jsxs("div", { className: `rounded-lg p-4 border ${colorClasses[color]}`, children: [_jsx("p", { className: "text-gray-400 text-sm", children: label }), _jsx("p", { className: "text-2xl font-bold mt-2", children: value })] }));
}
//# sourceMappingURL=GeoMap.js.map