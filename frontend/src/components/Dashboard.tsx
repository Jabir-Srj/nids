import React, { useState, useEffect } from 'react';
import { AlertCircle, Activity, TrendingUp, Shield, Clock, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_alerts: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total_packets: 0,
  });
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAlerts();
    const interval = setInterval(() => {
      fetchStats();
      fetchAlerts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/overview');
      const data = await response.json();
      if (data.status === 'success') {
        setStats({
          total_alerts: data.total_alerts,
          critical: data.severity_distribution.CRITICAL || 0,
          high: data.severity_distribution.HIGH || 0,
          medium: data.severity_distribution.MEDIUM || 0,
          low: data.severity_distribution.LOW || 0,
          total_packets: data.total_packets,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts?limit=10');
      const data = await response.json();
      if (data.status === 'success') {
        setAlerts(data.alerts);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'CRITICAL': 'bg-red-900 text-red-100',
      'HIGH': 'bg-orange-900 text-orange-100',
      'MEDIUM': 'bg-yellow-900 text-yellow-100',
      'LOW': 'bg-blue-900 text-blue-100',
      'INFO': 'bg-gray-700 text-gray-100'
    };
    return colors[severity] || colors.LOW;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">NIDS Dashboard</h1>
          </div>
          <p className="text-gray-400">Real-time Network Intrusion Detection System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          
          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-4 border border-red-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-semibold">CRITICAL</p>
                <p className="text-3xl font-bold text-white">{stats.critical}</p>
              </div>
              <AlertCircle className="text-red-300" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-4 border border-orange-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-semibold">HIGH</p>
                <p className="text-3xl font-bold text-white">{stats.high}</p>
              </div>
              <AlertTriangle className="text-orange-300" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-4 border border-yellow-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-semibold">MEDIUM</p>
                <p className="text-3xl font-bold text-white">{stats.medium}</p>
              </div>
              <TrendingUp className="text-yellow-300" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-semibold">LOW</p>
                <p className="text-3xl font-bold text-white">{stats.low}</p>
              </div>
              <Shield className="text-blue-300" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4 border border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-semibold">Total Alerts</p>
                <p className="text-3xl font-bold text-white">{stats.total_alerts}</p>
              </div>
              <Activity className="text-purple-300" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-lg p-4 border border-teal-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-200 text-sm font-semibold">Packets</p>
                <p className="text-3xl font-bold text-white">{stats.total_packets.toLocaleString()}</p>
              </div>
              <Clock className="text-teal-300" size={32} />
            </div>
          </div>

        </div>

        {/* Recent Alerts */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-2xl overflow-hidden">
          <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle size={24} />
              Recent Alerts
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-400">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No alerts detected</div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Timestamp</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Source IP</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Threat Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Severity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {alerts.map((alert, idx) => (
                    <tr key={idx} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-300 font-mono">{alert.src_ip}</td>
                      <td className="px-6 py-3 text-sm text-gray-300">{alert.threat_type}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">{alert.signature_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
