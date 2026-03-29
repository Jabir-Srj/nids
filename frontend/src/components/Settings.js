import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { rulesAPI, captureAPI } from '../services/api';
import AISettings from './AISettings';
export default function Settings() {
    const [rules, setRules] = useState([]);
    const [captureSettings, setCaptureSettings] = useState({
        interface_name: 'eth0',
        packet_count: 10000,
        capture_enabled: true,
    });
    const [newRule, setNewRule] = useState({
        name: '',
        pattern: '',
        pattern_type: 'regex',
        threat_type: 'unknown',
    });
    const [interfaces, setInterfaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch rules
                try {
                    const res = await rulesAPI.getAll();
                    const data = Array.isArray(res.data) ? res.data : res.data?.rules || [];
                    setRules(data.map((rule) => ({
                        id: rule.id || Math.random().toString(),
                        name: rule.name || rule.rule_name || 'Unknown Rule',
                        pattern: rule.pattern || '',
                        pattern_type: rule.pattern_type || 'regex',
                        threat_type: rule.threat_type || 'unknown',
                        enabled: rule.enabled !== false,
                    })));
                }
                catch (e) {
                    console.log('Rules API not available');
                }
                // Fetch capture interfaces
                try {
                    const res = await captureAPI.interfaces();
                    if (res.data?.interfaces) {
                        setInterfaces(res.data.interfaces);
                    }
                }
                catch (e) {
                    console.log('Capture API not available');
                }
                // Fetch capture status
                try {
                    const res = await captureAPI.status();
                    if (res.data) {
                        setCaptureSettings((prev) => ({
                            ...prev,
                            interface_name: res.data.interface_name || prev.interface_name,
                            capture_enabled: res.data.enabled || prev.capture_enabled,
                        }));
                    }
                }
                catch (e) {
                    console.log('Status API not available');
                }
                setLoading(false);
            }
            catch (error) {
                console.error('Failed to fetch settings:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const handleAddRule = async () => {
        if (!newRule.name || !newRule.pattern) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }
        try {
            await rulesAPI.create(newRule);
            setRules([
                ...rules,
                {
                    id: Math.random().toString(),
                    ...newRule,
                    enabled: true,
                },
            ]);
            setNewRule({ name: '', pattern: '', pattern_type: 'regex', threat_type: 'unknown' });
            setMessage({ type: 'success', text: 'Rule added successfully' });
            setTimeout(() => setMessage(null), 3000);
        }
        catch (error) {
            setMessage({ type: 'error', text: 'Failed to add rule' });
        }
    };
    const handleDeleteRule = async (id) => {
        try {
            await rulesAPI.delete(id);
            setRules(rules.filter((r) => r.id !== id));
            setMessage({ type: 'success', text: 'Rule deleted' });
            setTimeout(() => setMessage(null), 3000);
        }
        catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete rule' });
        }
    };
    const handleToggleRule = async (id, enabled) => {
        try {
            await rulesAPI.toggle(id, !enabled);
            setRules(rules.map((r) => r.id === id ? { ...r, enabled: !enabled } : r));
        }
        catch (error) {
            console.error('Failed to toggle rule:', error);
        }
    };
    const handleSaveSettings = async () => {
        try {
            if (captureSettings.capture_enabled) {
                await captureAPI.start(captureSettings.interface_name);
            }
            else {
                await captureAPI.stop();
            }
            setMessage({ type: 'success', text: 'Settings saved successfully' });
            setTimeout(() => setMessage(null), 3000);
        }
        catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [message && (_jsxs("div", { className: `p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-900/20 border border-green-700 text-green-300'
                    : 'bg-red-900/20 border border-red-700 text-red-300'}`, children: [message.type === 'success' ? (_jsx(CheckCircle, { className: "w-5 h-5" })) : (_jsx(AlertCircle, { className: "w-5 h-5" })), message.text] })), _jsx(AISettings, {}), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83C\uDFAF Capture Settings" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Network Interface" }), _jsx("select", { value: captureSettings.interface_name, onChange: (e) => setCaptureSettings((prev) => ({ ...prev, interface_name: e.target.value })), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500", children: interfaces.length > 0 ? (interfaces.map((iface) => (_jsx("option", { value: iface, children: iface }, iface)))) : (_jsx("option", { value: "eth0", children: "eth0 (default)" })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Max Packets in Buffer" }), _jsx("input", { type: "number", value: captureSettings.packet_count, onChange: (e) => setCaptureSettings((prev) => ({
                                            ...prev,
                                            packet_count: parseInt(e.target.value),
                                        })), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", id: "capture_enabled", checked: captureSettings.capture_enabled, onChange: (e) => setCaptureSettings((prev) => ({ ...prev, capture_enabled: e.target.checked })), className: "w-4 h-4" }), _jsx("label", { htmlFor: "capture_enabled", className: "text-gray-300 font-semibold cursor-pointer", children: "Enable packet capture" })] }), _jsxs("button", { onClick: handleSaveSettings, className: "flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors", children: [_jsx(Save, { className: "w-4 h-4" }), "Save Capture Settings"] })] })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("h2", { className: "text-lg font-bold mb-4", children: ["\uD83D\uDD0D Detection Rules (", rules.length, ")"] }), _jsx("div", { className: "space-y-2 mb-6", children: rules.length > 0 ? (rules.map((rule) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("input", { type: "checkbox", checked: rule.enabled, onChange: () => handleToggleRule(rule.id, rule.enabled), className: "w-4 h-4" }), _jsx("p", { className: "font-semibold", children: rule.name }), _jsx("span", { className: "text-xs bg-gray-600 px-2 py-1 rounded", children: rule.pattern_type }), _jsx("span", { className: "text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded", children: rule.threat_type })] }), _jsxs("p", { className: "text-xs text-gray-400 truncate", children: ["Pattern: ", rule.pattern] })] }), _jsx("button", { onClick: () => handleDeleteRule(rule.id), className: "p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, rule.id)))) : (_jsx("p", { className: "text-gray-400", children: "No rules loaded" })) }), _jsxs("div", { className: "border-t border-gray-600 pt-6", children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add New Rule"] }), _jsxs("div", { className: "space-y-3", children: [_jsx("input", { type: "text", placeholder: "Rule name", value: newRule.name, onChange: (e) => setNewRule((prev) => ({ ...prev, name: e.target.value })), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" }), _jsx("input", { type: "text", placeholder: "Pattern (regex or string)", value: newRule.pattern, onChange: (e) => setNewRule((prev) => ({ ...prev, pattern: e.target.value })), className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("select", { value: newRule.pattern_type, onChange: (e) => setNewRule((prev) => ({ ...prev, pattern_type: e.target.value })), className: "bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "regex", children: "Regex" }), _jsx("option", { value: "string", children: "String" }), _jsx("option", { value: "hex", children: "Hex" }), _jsx("option", { value: "binary", children: "Binary" })] }), _jsxs("select", { value: newRule.threat_type, onChange: (e) => setNewRule((prev) => ({ ...prev, threat_type: e.target.value })), className: "bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "unknown", children: "Unknown" }), _jsx("option", { value: "sql-injection", children: "SQL Injection" }), _jsx("option", { value: "xss", children: "XSS" }), _jsx("option", { value: "port-scan", children: "Port Scan" }), _jsx("option", { value: "ddos", children: "DDoS" }), _jsx("option", { value: "malware", children: "Malware" })] })] }), _jsxs("button", { onClick: handleAddRule, className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Rule"] })] })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\u2139\uFE0F System Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "Backend Status" }), _jsx("p", { className: "text-lg font-semibold text-green-400", children: "\uD83D\uDFE2 Connected" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "API Version" }), _jsx("p", { className: "text-lg font-semibold text-blue-400", children: "1.0.0" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "ML Model" }), _jsx("p", { className: "text-lg font-semibold text-purple-400", children: "Isolation Forest" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-400", children: "Update Frequency" }), _jsx("p", { className: "text-lg font-semibold text-cyan-400", children: "Real-time" })] })] })] })] }));
}
//# sourceMappingURL=Settings.js.map