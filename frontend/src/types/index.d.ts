export interface Alert {
    id: number;
    timestamp: string;
    src_ip: string;
    dst_ip: string;
    src_port: number;
    dst_port: number;
    protocol: string;
    threat_type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    signature: string;
    payload: string;
    action: string;
    packet_data?: string;
}
export interface DashboardStats {
    total_alerts: number;
    critical_alerts: number;
    high_alerts: number;
    medium_alerts: number;
    low_alerts: number;
    packets_per_sec: number;
    bytes_per_sec: number;
    active_threats: number;
    top_protocols: Array<{
        protocol: string;
        count: number;
    }>;
    top_ips: Array<{
        ip: string;
        count: number;
    }>;
    threat_types: Array<{
        type: string;
        count: number;
    }>;
}
export interface TimelinePoint {
    timestamp: string;
    count: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
}
export interface AlertFilter {
    severity?: string;
    threat_type?: string;
    src_ip?: string;
    dst_ip?: string;
    date_from?: string;
    date_to?: string;
    protocol?: string;
    search?: string;
}
export interface PaginationState {
    current_page: number;
    total_pages: number;
    items_per_page: number;
    total_items: number;
}
export interface WebSocketMessage {
    type: 'alert' | 'stats' | 'status' | 'error';
    data: any;
    timestamp: string;
}
//# sourceMappingURL=index.d.ts.map