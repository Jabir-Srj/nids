import React, { useState, useEffect } from 'react';
import { ThreatTimeline, TopThreats, TopAttackers, ProtocolDistribution } from './shared/Charts';
import { TimelinePoint } from '../types';
import api from '../services/api';

export const Analytics: React.FC = () => {
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [threatData, setThreatData] = useState<Array<{ type: string; count: number }>>([]);
  const [topIPs, setTopIPs] = useState<Array<{ ip: string; count: number }>>([]);
  const [protocolData, setProtocolData] = useState<Array<{ protocol: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [timeline, threats, ips, protocols] = await Promise.all([
        api.getThreatTimeline(timeRange),
        api.getThreatStats(),
        api.getTopIPs(),
        api.getProtocolStats(),
      ]);

      setTimelineData(timeline || []);
      setThreatData(threats?.threat_types || []);
      setTopIPs(ips?.top_ips || []);
      setProtocolData(protocols?.protocol_distribution || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Last {range}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Timeline */}
      {timelineData.length > 0 && <ThreatTimeline data={timelineData} />}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {threatData.length > 0 && <TopThreats data={threatData} />}
        {protocolData.length > 0 && <ProtocolDistribution data={protocolData} />}
      </div>

      {/* Top Attackers */}
      {topIPs.length > 0 && <TopAttackers data={topIPs} />}

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={loadAnalytics}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
};

export default Analytics;
