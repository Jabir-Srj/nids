import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, EyeOff } from 'lucide-react';
export default function PacketInspector() {
    const [packets, setPackets] = useState([]);
    const [filteredPackets, setFilteredPackets] = useState([]);
    const [loading, setLoading] = useState(true);
    // Filters
    const [filters, setFilters] = useState({
        protocol: 'all',
        source_ip: '',
        dest_ip: '',
        threat_only: false,
        port: '',
    });
    const [showPayload, setShowPayload] = useState({});
    const [selectedPacket, setSelectedPacket] = useState(null);
    // Fetch packets
    useEffect(() => {
        const fetchPackets = async () => {
            try {
                // Simulate fetching packets from backend
                const mockPackets = generateMockPackets(50);
                setPackets(mockPackets);
                setFilteredPackets(mockPackets);
                setLoading(false);
            }
            catch (error) {
                console.error('Failed to fetch packets:', error);
                setLoading(false);
            }
        };
        fetchPackets();
        // Refresh every 10 seconds
        const interval = setInterval(fetchPackets, 10000);
        return () => clearInterval(interval);
    }, []);
    // Apply filters
    useEffect(() => {
        let filtered = packets;
        if (filters.protocol !== 'all') {
            filtered = filtered.filter((p) => p.protocol.toUpperCase() === filters.protocol);
        }
        if (filters.source_ip) {
            filtered = filtered.filter((p) => p.source_ip.includes(filters.source_ip));
        }
        if (filters.dest_ip) {
            filtered = filtered.filter((p) => p.dest_ip.includes(filters.dest_ip));
        }
        if (filters.threat_only) {
            filtered = filtered.filter((p) => p.threat_detected);
        }
        if (filters.port) {
            filtered = filtered.filter((p) => p.source_port.toString().includes(filters.port) || p.dest_port.toString().includes(filters.port));
        }
        setFilteredPackets(filtered);
    }, [filters, packets]);
    const exportPackets = (format) => {
        const content = format === 'json'
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
                .join('\n');
        const blob = new Blob([content], {
            type: format === 'json' ? 'application/json' : 'text/csv',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `packets.${format}`;
        a.click();
    };
    const protocolStats = {
        TCP: packets.filter((p) => p.protocol === 'TCP').length,
        UDP: packets.filter((p) => p.protocol === 'UDP').length,
        ICMP: packets.filter((p) => p.protocol === 'ICMP').length,
        OTHER: packets.filter((p) => !['TCP', 'UDP', 'ICMP'].includes(p.protocol)).length,
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(StatBox, { label: "Total Packets", value: packets.length, color: "blue" }), _jsx(StatBox, { label: "TCP", value: protocolStats.TCP, color: "green" }), _jsx(StatBox, { label: "UDP", value: protocolStats.UDP, color: "purple" }), _jsx(StatBox, { label: "Threats", value: packets.filter((p) => p.threat_detected).length, color: "red" })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("h2", { className: "text-lg font-bold mb-4 flex items-center gap-2", children: [_jsx(Filter, { className: "w-5 h-5" }), "Filter Packets"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Protocol" }), _jsxs("select", { value: filters.protocol, onChange: (e) => setFilters((prev) => ({ ...prev, protocol: e.target.value })), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "TCP", children: "TCP" }), _jsx("option", { value: "UDP", children: "UDP" }), _jsx("option", { value: "ICMP", children: "ICMP" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Source IP" }), _jsx("input", { type: "text", placeholder: "e.g. 192.168", value: filters.source_ip, onChange: (e) => setFilters((prev) => ({ ...prev, source_ip: e.target.value })), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Destination IP" }), _jsx("input", { type: "text", placeholder: "e.g. 10.0", value: filters.dest_ip, onChange: (e) => setFilters((prev) => ({ ...prev, dest_ip: e.target.value })), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Port" }), _jsx("input", { type: "text", placeholder: "e.g. 80, 443", value: filters.port, onChange: (e) => setFilters((prev) => ({ ...prev, port: e.target.value })), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" })] }), _jsx("div", { className: "flex items-end", children: _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: filters.threat_only, onChange: (e) => setFilters((prev) => ({ ...prev, threat_only: e.target.checked })), className: "w-4 h-4" }), _jsx("span", { className: "text-gray-300 font-semibold", children: "Threats Only" })] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => exportPackets('json'), className: "flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors", children: [_jsx(Download, { className: "w-4 h-4" }), "JSON"] }), _jsxs("button", { onClick: () => exportPackets('csv'), className: "flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors", children: [_jsx(Download, { className: "w-4 h-4" }), "CSV"] })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h2", { className: "text-lg font-bold", children: ["Packets (", filteredPackets.length, " of ", packets.length, ")"] }), loading ? (_jsx("div", { className: "bg-gray-800 rounded-lg p-8 text-center border border-gray-700", children: _jsx("p", { className: "text-gray-400", children: "Loading packets..." }) })) : filteredPackets.length > 0 ? (_jsx("div", { className: "space-y-2 overflow-x-auto", children: filteredPackets.map((packet) => (_jsxs("div", { children: [_jsx("div", { onClick: () => setSelectedPacket(selectedPacket?.id === packet.id ? null : packet), className: "bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "Timestamp" }), _jsx("p", { className: "font-mono", children: new Date(packet.timestamp).toLocaleTimeString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "Source" }), _jsxs("p", { className: "font-mono text-blue-400", children: [packet.source_ip, ":", packet.source_port] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "Destination" }), _jsxs("p", { className: "font-mono text-green-400", children: [packet.dest_ip, ":", packet.dest_port] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "Protocol" }), _jsx("p", { className: "font-mono", children: packet.protocol })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "Length" }), _jsxs("p", { className: "font-mono", children: [packet.length, " bytes"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "Threat" }), _jsx("p", { className: `font-semibold ${packet.threat_detected ? 'text-red-400' : 'text-green-400'}`, children: packet.threat_detected ? 'YES' : 'NO' })] })] }) }) }), selectedPacket?.id === packet.id && (_jsxs("div", { className: "bg-gray-700 rounded-lg p-4 border border-gray-600 mt-2", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 mb-2", children: "Packet Details" }), _jsxs("div", { className: "space-y-1 font-mono text-gray-300", children: [_jsxs("p", { children: ["Source IP: ", packet.source_ip] }), _jsxs("p", { children: ["Source Port: ", packet.source_port] }), _jsxs("p", { children: ["Destination IP: ", packet.dest_ip] }), _jsxs("p", { children: ["Destination Port: ", packet.dest_port] }), _jsxs("p", { children: ["Protocol: ", packet.protocol] }), _jsxs("p", { children: ["Length: ", packet.length, " bytes"] }), _jsxs("p", { children: ["Flags: ", packet.flags] })] })] }), packet.threat_detected && (_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 mb-2", children: "Threat Information" }), _jsxs("div", { className: "bg-red-900/20 border border-red-700 rounded-lg p-3", children: [_jsx("p", { className: "text-red-400 font-semibold", children: "Threat Detected" }), _jsxs("p", { className: "text-red-300 text-sm mt-1", children: ["Type: ", packet.threat_type] })] })] }))] }), packet.payload && (_jsxs("div", { className: "mt-4", children: [_jsxs("button", { onClick: () => setShowPayload((prev) => ({
                                                        ...prev,
                                                        [packet.id]: !prev[packet.id],
                                                    })), className: "flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold mb-2", children: [showPayload[packet.id] ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }), showPayload[packet.id] ? 'Hide' : 'Show', " Payload"] }), showPayload[packet.id] && (_jsx("div", { className: "bg-gray-900 rounded-lg p-3 overflow-x-auto", children: _jsx("p", { className: "font-mono text-xs text-gray-400 break-all", children: packet.payload }) }))] }))] }))] }, packet.id))) })) : (_jsxs("div", { className: "bg-gray-800 rounded-lg p-8 text-center border border-gray-700", children: [_jsx(Search, { className: "w-12 h-12 mx-auto text-gray-500 mb-3" }), _jsx("p", { className: "text-gray-400", children: "No packets match your filters" })] }))] })] }));
}
function generateMockPackets(count) {
    const packets = [];
    const protocols = ['TCP', 'UDP', 'ICMP'];
    const threatTypes = ['SQL Injection', 'XSS', 'Port Scan', 'DDoS', 'Malware'];
    for (let i = 0; i < count; i++) {
        const hasThreat = Math.random() > 0.8;
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
        });
    }
    return packets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
function StatBox({ label, value, color }) {
    const colorClasses = {
        blue: 'bg-blue-900/20 border-blue-700',
        red: 'bg-red-900/20 border-red-700',
        green: 'bg-green-900/20 border-green-700',
        purple: 'bg-purple-900/20 border-purple-700',
    };
    return (_jsxs("div", { className: `rounded-lg p-4 border ${colorClasses[color]}`, children: [_jsx("p", { className: "text-gray-400 text-sm", children: label }), _jsx("p", { className: "text-2xl font-bold mt-2", children: value })] }));
}
//# sourceMappingURL=PacketInspector.js.map