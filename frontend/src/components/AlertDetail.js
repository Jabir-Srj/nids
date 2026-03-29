import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const AlertDetail = ({ alert, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    if (!alert) {
        return (_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", children: _jsx("p", { className: "text-center text-gray-500 dark:text-gray-400", children: "Select an alert to view details" }) }));
    }
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'HIGH':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'LOW':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const getThreatExplanation = (threatType) => {
        const explanations = {
            port_scan: 'Port Scan - Attacker is probing your network for open ports and services',
            ddos: 'DDoS Attack - Distributed Denial of Service attempting to overwhelm network resources',
            sql_injection: 'SQL Injection - Attacker is attempting to execute unauthorized SQL commands',
            xss: 'Cross-Site Scripting - Malicious script injection attempt',
            buffer_overflow: 'Buffer Overflow - Attempt to write beyond allocated buffer memory boundaries',
            malware: 'Malware - Detection of known malicious software signatures',
            xxe: 'XML External Entity - XXE injection attempt through XML parsing',
            brute_force: 'Brute Force - Multiple failed authentication attempts detected',
            data_exfiltration: 'Data Exfiltration - Suspicious outbound data transfer detected',
        };
        return explanations[threatType] || 'Unknown threat type';
    };
    const getRemediation = (threatType) => {
        const remediations = {
            port_scan: [
                'Block the source IP at the firewall',
                'Enable IPS (Intrusion Prevention System)',
                'Review firewall rules for unnecessary open ports',
                'Consider port knocking or single packet authorization',
            ],
            ddos: [
                'Activate DDoS mitigation rules',
                'Block source IPs with high traffic volume',
                'Contact ISP for upstream filtering',
                'Consider DDoS protection service',
            ],
            sql_injection: [
                'Review and patch vulnerable application code',
                'Implement parameterized queries',
                'Use input validation and sanitization',
                'Enable SQL query logging and monitoring',
            ],
            xss: [
                'Update and patch affected application',
                'Implement Content Security Policy (CSP)',
                'Use HTML escaping and encoding',
                'Review code for input validation',
            ],
            buffer_overflow: [
                'Immediately patch affected software',
                'Enable ASLR (Address Space Layout Randomization)',
                'Enable DEP/NX (Data Execution Prevention)',
                'Consider sandboxing the application',
            ],
            malware: [
                'Isolate affected system from network',
                'Run full system antivirus scan',
                'Update antivirus signatures',
                'Monitor for lateral movement',
            ],
        };
        return remediations[threatType] || ['Review logs', 'Update security policies', 'Monitor closely'];
    };
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "Alert Details" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl", children: "\u00D7" })] }), _jsx("div", { className: "flex border-b border-gray-200 dark:border-gray-700", children: ['overview', 'packet', 'analysis'].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: `px-6 py-3 font-medium text-sm transition-colors ${activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`, children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) }), _jsxs("div", { className: "p-6", children: [activeTab === 'overview' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Alert ID" }), _jsx("p", { className: "text-lg font-mono text-gray-900 dark:text-white", children: alert.id })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Timestamp" }), _jsx("p", { className: "text-lg text-gray-900 dark:text-white", children: new Date(alert.timestamp).toLocaleString() })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Severity" }), _jsx("div", { className: "mt-1", children: _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-semibold inline-block ${getSeverityColor(alert.severity)}`, children: alert.severity }) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Threat Type" }), _jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-white mt-1", children: alert.threat_type })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Source IP" }), _jsx("p", { className: "text-lg font-mono text-gray-900 dark:text-white", children: alert.src_ip })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Destination IP" }), _jsx("p", { className: "text-lg font-mono text-gray-900 dark:text-white", children: alert.dst_ip })] })] }), _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Source Port" }), _jsx("p", { className: "text-lg font-mono text-gray-900 dark:text-white", children: alert.src_port })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Dest Port" }), _jsx("p", { className: "text-lg font-mono text-gray-900 dark:text-white", children: alert.dst_port })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Protocol" }), _jsx("p", { className: "text-lg font-mono text-gray-900 dark:text-white", children: alert.protocol.toUpperCase() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Action" }), _jsx("p", { className: "text-lg font-mono text-gray-900 dark:text-white", children: alert.action })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Signature" }), _jsx("p", { className: "text-sm font-mono text-gray-900 dark:text-white mt-1 bg-gray-100 dark:bg-gray-700 p-3 rounded", children: alert.signature })] })] })), activeTab === 'packet' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "Payload (Hex Dump)" }), _jsx("div", { className: "bg-gray-900 text-green-400 font-mono text-xs p-4 rounded overflow-x-auto max-h-96 overflow-y-auto", children: _jsx("pre", { children: alert.payload || 'No payload data available' }) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "Packet Data" }), _jsx("div", { className: "bg-gray-900 text-green-400 font-mono text-xs p-4 rounded overflow-x-auto max-h-96 overflow-y-auto", children: _jsx("pre", { children: alert.packet_data || 'No packet data available' }) })] })] })), activeTab === 'analysis' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-3", children: "Threat Explanation" }), _jsx("p", { className: "text-gray-700 dark:text-gray-300 leading-relaxed", children: getThreatExplanation(alert.threat_type) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-3", children: "Recommended Actions" }), _jsx("ul", { className: "space-y-2", children: getRemediation(alert.threat_type).map((action, index) => (_jsxs("li", { className: "flex items-start text-gray-700 dark:text-gray-300", children: [_jsxs("span", { className: "mr-3 text-blue-500 font-bold", children: [index + 1, "."] }), _jsx("span", { children: action })] }, index))) })] }), _jsx("div", { className: "bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: [_jsx("strong", { children: "Note:" }), " This alert has been logged and is available for compliance and audit purposes. Review your security policies regularly to prevent similar attacks."] }) })] }))] })] }));
};
export default AlertDetail;
//# sourceMappingURL=AlertDetail.js.map