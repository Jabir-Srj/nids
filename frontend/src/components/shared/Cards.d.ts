import React from 'react';
import { Alert } from '../types';
interface ThreatSummaryProps {
    stats: {
        total_alerts: number;
        critical_alerts: number;
        high_alerts: number;
        medium_alerts: number;
        low_alerts: number;
    };
}
export declare const ThreatSummary: React.FC<ThreatSummaryProps>;
interface LiveMetricsProps {
    packets_per_sec: number;
    bytes_per_sec: number;
    active_threats: number;
}
export declare const LiveMetrics: React.FC<LiveMetricsProps>;
interface RecentAlertsTableProps {
    alerts: Alert[];
    onAlertClick: (alert: Alert) => void;
    loading?: boolean;
}
export declare const RecentAlertsTable: React.FC<RecentAlertsTableProps>;
export {};
//# sourceMappingURL=Cards.d.ts.map