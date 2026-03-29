export declare function fetchWithFallback<T>(apiFn: () => Promise<any>, fallbackData: T, dataExtractor?: (response: any) => T): Promise<T>;
export declare const mockDataMap: {
    alerts: ({
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
    stats: {
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
    rules: {
        id: string;
        name: string;
        pattern: string;
        pattern_type: string;
        threat_type: string;
        enabled: boolean;
        confidence: number;
    }[];
    geoData: {
        country: string;
        incidents: number;
        severity: string;
        percentage: number;
    }[];
    networkTopology: {
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
    packets: {
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
};
export default fetchWithFallback;
//# sourceMappingURL=fetchWithFallback.d.ts.map