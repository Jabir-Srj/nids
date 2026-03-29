import React, { useState, useEffect } from 'react';
import { Alert, AlertFilter, PaginationState } from '../types';
import api from '../services/api';

interface AlertListProps {
  onAlertSelect: (alert: Alert) => void;
  selectedAlertId?: number;
}

export const AlertList: React.FC<AlertListProps> = ({ onAlertSelect, selectedAlertId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    current_page: 1,
    total_pages: 1,
    items_per_page: 20,
    total_items: 0,
  });

  // Filter states
  const [filters, setFilters] = useState<AlertFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [threatTypeFilter, setThreatTypeFilter] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');

  // Load alerts
  const loadAlerts = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: AlertFilter = {
        ...filters,
        search: searchQuery || undefined,
        severity: severityFilter || undefined,
        threat_type: threatTypeFilter || undefined,
        protocol: protocolFilter || undefined,
      };

      const response = await api.filterAlerts(params);
      setAlerts(response.alerts || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts(pagination.current_page);
  }, [filters, searchQuery, severityFilter, threatTypeFilter, protocolFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination({ ...pagination, current_page: 1 });
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const blob = await api.exportAlerts(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alerts.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="IP, threat type, signature..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPagination({ ...pagination, current_page: 1 });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Threat Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Threat Type
            </label>
            <select
              value={threatTypeFilter}
              onChange={(e) => {
                setThreatTypeFilter(e.target.value);
                setPagination({ ...pagination, current_page: 1 });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="port_scan">Port Scan</option>
              <option value="ddos">DDoS</option>
              <option value="sql_injection">SQL Injection</option>
              <option value="xss">XSS</option>
              <option value="buffer_overflow">Buffer Overflow</option>
              <option value="malware">Malware</option>
            </select>
          </div>

          {/* Protocol Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Protocol
            </label>
            <select
              value={protocolFilter}
              onChange={(e) => {
                setProtocolFilter(e.target.value);
                setPagination({ ...pagination, current_page: 1 });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
              <option value="DNS">DNS</option>
              <option value="HTTP">HTTP</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => handleExport('json')}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Source IP
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dest IP
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Threat Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Protocol
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No alerts found
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => onAlertSelect(alert)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      selectedAlertId === alert.id
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-300">
                      {alert.src_ip}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-300">
                      {alert.dst_ip}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {alert.threat_type}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-300">
                      {alert.protocol.toUpperCase()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(pagination.current_page - 1) * pagination.items_per_page + 1}-
              {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} of{' '}
              {pagination.total_items} alerts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  loadAlerts(Math.max(1, pagination.current_page - 1))
                }
                disabled={pagination.current_page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                onClick={() =>
                  loadAlerts(Math.min(pagination.total_pages, pagination.current_page + 1))
                }
                disabled={pagination.current_page === pagination.total_pages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertList;
