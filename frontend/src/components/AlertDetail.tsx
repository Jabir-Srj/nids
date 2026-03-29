import React, { useState } from 'react';
import { Alert } from '../types';

interface AlertDetailProps {
  alert: Alert | null;
  onClose: () => void;
}

export const AlertDetail: React.FC<AlertDetailProps> = ({ alert, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packet' | 'analysis'>('overview');

  if (!alert) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">Select an alert to view details</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
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

  const getThreatExplanation = (threatType: string): string => {
    const explanations: Record<string, string> = {
      port_scan: 'Port Scan - Attacker is probing your network for open ports and services',
      ddos: 'DDoS Attack - Distributed Denial of Service attempting to overwhelm network resources',
      sql_injection:
        'SQL Injection - Attacker is attempting to execute unauthorized SQL commands',
      xss: 'Cross-Site Scripting - Malicious script injection attempt',
      buffer_overflow:
        'Buffer Overflow - Attempt to write beyond allocated buffer memory boundaries',
      malware: 'Malware - Detection of known malicious software signatures',
      xxe: 'XML External Entity - XXE injection attempt through XML parsing',
      brute_force: 'Brute Force - Multiple failed authentication attempts detected',
      data_exfiltration:
        'Data Exfiltration - Suspicious outbound data transfer detected',
    };
    return explanations[threatType] || 'Unknown threat type';
  };

  const getRemediation = (threatType: string): string[] => {
    const remediations: Record<string, string[]> = {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alert Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['overview', 'packet', 'analysis'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alert ID</p>
                <p className="text-lg font-mono text-gray-900 dark:text-white">{alert.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Timestamp</p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity</p>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Threat Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {alert.threat_type}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Source IP</p>
                <p className="text-lg font-mono text-gray-900 dark:text-white">{alert.src_ip}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Destination IP</p>
                <p className="text-lg font-mono text-gray-900 dark:text-white">{alert.dst_ip}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Source Port</p>
                <p className="text-lg font-mono text-gray-900 dark:text-white">{alert.src_port}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dest Port</p>
                <p className="text-lg font-mono text-gray-900 dark:text-white">{alert.dst_port}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Protocol</p>
                <p className="text-lg font-mono text-gray-900 dark:text-white">
                  {alert.protocol.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Action</p>
                <p className="text-lg font-mono text-gray-900 dark:text-white">{alert.action}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Signature</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white mt-1 bg-gray-100 dark:bg-gray-700 p-3 rounded">
                {alert.signature}
              </p>
            </div>
          </div>
        )}

        {/* Packet Tab */}
        {activeTab === 'packet' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Payload (Hex Dump)</p>
              <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                <pre>{alert.payload || 'No payload data available'}</pre>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Packet Data</p>
              <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                <pre>
                  {alert.packet_data || 'No packet data available'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Threat Explanation
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {getThreatExplanation(alert.threat_type)}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Recommended Actions
              </h3>
              <ul className="space-y-2">
                {getRemediation(alert.threat_type).map((action, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700 dark:text-gray-300"
                  >
                    <span className="mr-3 text-blue-500 font-bold">{index + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> This alert has been logged and is available for compliance and audit
                purposes. Review your security policies regularly to prevent similar attacks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertDetail;
