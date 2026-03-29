import React from 'react';
interface AlertDetail {
    id: string;
    timestamp: string;
    alert_type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    threat_type: string;
    src_ip: string;
    dst_ip: string;
    src_port: number;
    dst_port: number;
    protocol: string;
    message: string;
    payload?: string;
    rule_matched?: string;
    confidence: number;
    status: string;
    suggested_actions?: string[];
    related_alerts?: string[];
}
interface AlertModalProps {
    open: boolean;
    alert: AlertDetail | null;
    onClose: () => void;
    onUpdate?: (alert: AlertDetail) => void;
}
declare const AlertModal: React.FC<AlertModalProps>;
export default AlertModal;
//# sourceMappingURL=AlertModal.d.ts.map