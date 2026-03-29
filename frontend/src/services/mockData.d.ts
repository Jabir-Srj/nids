export declare const mockAlerts: ({
    id: string;
    type: string;
    severity: "critical";
    timestamp: string;
    source: string;
    destination: string;
    message: string;
} | {
    id: string;
    type: string;
    severity: "high";
    timestamp: string;
    source: string;
    destination: string;
    message: string;
} | {
    id: string;
    type: string;
    severity: "medium";
    timestamp: string;
    source: string;
    destination: string;
    message: string;
})[];
export declare const mockStats: {
    overview: {
        total_alerts: number;
        critical_count: number;
        high_count: number;
        medium_count: number;
        low_count: number;
        alerts_today: number;
        detection_accuracy: number;
        packets_processed: number;
    };
    byTime: {
        hour: string;
        threats: number;
        packets: number;
    }[];
    bySeverity: {
        severity: string;
        count: number;
        percentage: number;
    }[];
};
export declare const mockRules: {
    id: string;
    name: string;
    pattern: string;
    pattern_type: string;
    threat_type: string;
    enabled: boolean;
    confidence: number;
}[];
export declare const mockGeoData: {
    country: string;
    incidents: number;
    severity: string;
    percentage: number;
}[];
export declare const mockNetworkTopology: {
    nodes: ({
        id: string;
        label: string;
        type: "attacker";
        threat_count: number;
    } | {
        id: string;
        label: string;
        type: "target";
        threat_count: number;
    } | {
        id: string;
        label: string;
        type: "dest";
        threat_count: number;
    } | {
        id: string;
        label: string;
        type: "source";
        threat_count: number;
    })[];
    edges: {
        source: string;
        target: string;
        threats: number;
        severity: string;
        protocol: string;
    }[];
    stats: {
        total_connections: number;
        critical_paths: number;
    };
};
export declare const mockPackets: {
    id: string;
    source_ip: string;
    dest_ip: string;
    protocol: string;
    port: number;
    payload_size: number;
    timestamp: string;
    flags: string;
    threat_score: number;
}[];
//# sourceMappingURL=mockData.d.ts.map