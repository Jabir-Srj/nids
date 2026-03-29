import React from 'react';
import { TimelinePoint } from '../types';
interface ThreatTimelineProps {
    data: TimelinePoint[];
}
export declare const ThreatTimeline: React.FC<ThreatTimelineProps>;
interface TopThreatsProps {
    data: Array<{
        type: string;
        count: number;
    }>;
}
export declare const TopThreats: React.FC<TopThreatsProps>;
interface TopAttackersProps {
    data: Array<{
        ip: string;
        count: number;
    }>;
}
export declare const TopAttackers: React.FC<TopAttackersProps>;
interface ProtocolDistributionProps {
    data: Array<{
        protocol: string;
        count: number;
    }>;
}
export declare const ProtocolDistribution: React.FC<ProtocolDistributionProps>;
export {};
//# sourceMappingURL=Charts.d.ts.map