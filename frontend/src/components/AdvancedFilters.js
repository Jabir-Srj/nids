import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Filter, X, Plus, Search } from 'lucide-react';
export default function AdvancedFilters() {
    const [criteria, setCriteria] = useState({});
    const [savedFilters, setSavedFilters] = useState([
        { id: '1', name: 'Critical Alerts', criteria: { severity: ['critical'] } },
        { id: '2', name: 'SQL Injections', criteria: { threatType: ['SQL Injection'] } },
    ]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const severityOptions = ['critical', 'high', 'medium', 'low'];
    const threatTypes = ['SQL Injection', 'XSS', 'DDoS', 'Malware', 'Buffer Overflow', 'Brute Force'];
    const protocols = ['TCP', 'UDP', 'ICMP', 'DNS', 'HTTP', 'HTTPS'];
    const toggleSeverity = (severity) => {
        const newSeverities = criteria.severity || [];
        if (newSeverities.includes(severity)) {
            setCriteria({ ...criteria, severity: newSeverities.filter((s) => s !== severity) });
        }
        else {
            setCriteria({ ...criteria, severity: [...newSeverities, severity] });
        }
        setActiveFilters(['severity']);
    };
    const toggleThreatType = (threatType) => {
        const newTypes = criteria.threatType || [];
        if (newTypes.includes(threatType)) {
            setCriteria({ ...criteria, threatType: newTypes.filter((t) => t !== threatType) });
        }
        else {
            setCriteria({ ...criteria, threatType: [...newTypes, threatType] });
        }
        setActiveFilters(['threatType']);
    };
    const toggleProtocol = (protocol) => {
        const newProtocols = criteria.protocol || [];
        if (newProtocols.includes(protocol)) {
            setCriteria({ ...criteria, protocol: newProtocols.filter((p) => p !== protocol) });
        }
        else {
            setCriteria({ ...criteria, protocol: [...newProtocols, protocol] });
        }
        setActiveFilters(['protocol']);
    };
    const applyFilter = () => {
        // Fetch alerts with criteria
        const params = new URLSearchParams();
        if (criteria.severity?.length)
            params.append('severity', criteria.severity.join(','));
        if (criteria.threatType?.length)
            params.append('threatType', criteria.threatType.join(','));
        if (criteria.sourceIP)
            params.append('sourceIP', criteria.sourceIP);
        if (criteria.destIP)
            params.append('destIP', criteria.destIP);
        if (criteria.protocol?.length)
            params.append('protocol', criteria.protocol.join(','));
        if (criteria.cidrRange)
            params.append('cidrRange', criteria.cidrRange);
        if (criteria.payloadRegex)
            params.append('payloadRegex', criteria.payloadRegex);
        if (criteria.confidenceMin)
            params.append('confidenceMin', criteria.confidenceMin.toString());
        console.log('Fetching alerts with:', params.toString());
        // TODO: Fetch alerts from API
    };
    const saveFilter = () => {
        if (!filterName.trim())
            return;
        const newFilter = {
            id: Date.now().toString(),
            name: filterName,
            criteria,
        };
        setSavedFilters([...savedFilters, newFilter]);
        setFilterName('');
        setShowSaveDialog(false);
    };
    const loadFilter = (filter) => {
        setCriteria(filter.criteria);
        setActiveFilters(['loaded']);
    };
    const clearAllFilters = () => {
        setCriteria({});
        setActiveFilters([]);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("h2", { className: "text-lg font-bold mb-6 flex items-center gap-2", children: [_jsx(Filter, { className: "w-5 h-5" }), "Advanced Filter Builder"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-3 text-gray-300", children: "Severity Level" }), _jsx("div", { className: "space-y-2", children: severityOptions.map((severity) => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: criteria.severity?.includes(severity) || false, onChange: () => toggleSeverity(severity), className: "w-4 h-4 rounded border-gray-600 bg-gray-700" }), _jsx("span", { className: "capitalize text-sm", children: severity })] }, severity))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-3 text-gray-300", children: "Threat Type" }), _jsx("div", { className: "space-y-2 max-h-40 overflow-y-auto", children: threatTypes.map((type) => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: criteria.threatType?.includes(type) || false, onChange: () => toggleThreatType(type), className: "w-4 h-4 rounded border-gray-600 bg-gray-700" }), _jsx("span", { className: "text-sm", children: type })] }, type))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-3 text-gray-300", children: "Protocol" }), _jsx("div", { className: "space-y-2", children: protocols.map((protocol) => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: criteria.protocol?.includes(protocol) || false, onChange: () => toggleProtocol(protocol), className: "w-4 h-4 rounded border-gray-600 bg-gray-700" }), _jsx("span", { className: "text-sm", children: protocol })] }, protocol))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-300", children: "Source IP" }), _jsx("input", { type: "text", placeholder: "192.168.1.100", value: criteria.sourceIP || '', onChange: (e) => setCriteria({ ...criteria, sourceIP: e.target.value }), className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-300", children: "Destination IP" }), _jsx("input", { type: "text", placeholder: "10.0.0.5", value: criteria.destIP || '', onChange: (e) => setCriteria({ ...criteria, destIP: e.target.value }), className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-300", children: "CIDR Range" }), _jsx("input", { type: "text", placeholder: "192.168.0.0/16", value: criteria.cidrRange || '', onChange: (e) => setCriteria({ ...criteria, cidrRange: e.target.value }), className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-300", children: "Payload Regex" }), _jsx("input", { type: "text", placeholder: "^[a-z]+@[a-z]+\\\\.com$", value: criteria.payloadRegex || '', onChange: (e) => setCriteria({ ...criteria, payloadRegex: e.target.value }), className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-300", children: "Min Confidence (%)" }), _jsx("input", { type: "number", min: "0", max: "100", value: criteria.confidenceMin || 0, onChange: (e) => setCriteria({ ...criteria, confidenceMin: parseInt(e.target.value) }), className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-300", children: "From" }), _jsx("input", { type: "date", value: criteria.dateRange?.start || '', onChange: (e) => setCriteria({
                                            ...criteria,
                                            dateRange: { ...criteria.dateRange, start: e.target.value },
                                        }), className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-300", children: "To" }), _jsx("input", { type: "date", value: criteria.dateRange?.end || '', onChange: (e) => setCriteria({
                                            ...criteria,
                                            dateRange: { ...criteria.dateRange, end: e.target.value },
                                        }), className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" })] })] }), _jsxs("div", { className: "flex gap-3 flex-wrap", children: [_jsxs("button", { onClick: applyFilter, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-sm flex items-center gap-2 transition", children: [_jsx(Search, { className: "w-4 h-4" }), "Apply Filter"] }), _jsxs("button", { onClick: () => setShowSaveDialog(true), className: "px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold text-sm flex items-center gap-2 transition", children: [_jsx(Plus, { className: "w-4 h-4" }), "Save Filter"] }), _jsxs("button", { onClick: clearAllFilters, className: "px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold text-sm flex items-center gap-2 transition", children: [_jsx(X, { className: "w-4 h-4" }), "Clear All"] })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: "\u2B50 Saved Filters" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: savedFilters.map((filter) => (_jsxs("button", { onClick: () => loadFilter(filter), className: "p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition border border-gray-600 hover:border-blue-500", children: [_jsx("p", { className: "font-semibold text-sm", children: filter.name }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: Object.keys(filter.criteria)
                                        .slice(0, 2)
                                        .join(', ') })] }, filter.id))) })] }), showSaveDialog && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg", children: _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 w-96 border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: "Save Filter" }), _jsx("input", { type: "text", placeholder: "Filter name...", value: filterName, onChange: (e) => setFilterName(e.target.value), className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded mb-4 text-white placeholder-gray-500", autoFocus: true }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: saveFilter, className: "flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold text-sm transition", children: "Save" }), _jsx("button", { onClick: () => setShowSaveDialog(false), className: "flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-semibold text-sm transition", children: "Cancel" })] })] }) }))] }));
}
//# sourceMappingURL=AdvancedFilters.js.map