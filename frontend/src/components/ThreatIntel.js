import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardHeader, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, LinearProgress, } from '@mui/material';
import { TrendingUp as TrendingUpIcon, Security as SecurityIcon, Warning as WarningIcon, Info as InfoIcon, } from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const ThreatIntel = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [topIps, setTopIps] = useState([]);
    const [topThreats, setTopThreats] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [selectedIp, setSelectedIp] = useState(null);
    const [ipDetailDialog, setIpDetailDialog] = useState(false);
    useEffect(() => {
        fetchThreatData();
    }, []);
    const fetchThreatData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch summary
            const summaryRes = await fetch('/api/threat-intel/summary');
            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setSummary(summaryData.summary);
            }
            // Fetch top IPs
            const ipsRes = await fetch('/api/threat-intel/top-ips?limit=20');
            if (ipsRes.ok) {
                const ipsData = await ipsRes.json();
                setTopIps(ipsData.ips || []);
            }
            // Fetch top threats
            const threatsRes = await fetch('/api/threat-intel/top-threats?limit=20');
            if (threatsRes.ok) {
                const threatsData = await threatsRes.json();
                setTopThreats(threatsData.threats || []);
            }
            // Fetch timeline
            const timelineRes = await fetch('/api/threat-intel/timeline?hours=24&granularity=1h');
            if (timelineRes.ok) {
                const timelineData = await timelineRes.json();
                setTimeline(timelineData.timeline || []);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch threat data');
        }
        finally {
            setLoading(false);
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return '#ff1744';
            case 'high':
                return '#ff9100';
            case 'medium':
                return '#2196f3';
            case 'low':
                return '#4caf50';
            default:
                return '#9e9e9e';
        }
    };
    const getSeverityChipColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'error';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };
    const COLORS = ['#ff1744', '#ff9100', '#2196f3', '#4caf50', '#9e9e9e'];
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Box, { children: [_jsx("h1", { style: { margin: 0, marginBottom: 8 }, children: "Threat Intelligence" }), _jsx("p", { style: { margin: 0, color: '#666' }, children: "Real-time threat analysis and monitoring" })] }), _jsx(Button, { variant: "contained", onClick: fetchThreatData, children: "Refresh" })] }) }), error && (_jsx(Grid, { item: true, xs: 12, children: _jsx(Alert, { severity: "error", onClose: () => setError(null), children: error }) })), loading && !summary ? (_jsx(Grid, { item: true, xs: 12, children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 }, children: _jsx(CircularProgress, {}) }) })) : (_jsxs(_Fragment, { children: [summary && (_jsxs(_Fragment, { children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs(Box, { children: [_jsx("p", { style: { margin: 0, fontSize: '0.9em', color: '#666' }, children: "Total Threats (24h)" }), _jsx("h2", { style: { margin: '8px 0 0 0' }, children: summary.total_threats_24h })] }), _jsx(TrendingUpIcon, { sx: { fontSize: 40, color: '#2196f3' } })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs(Box, { children: [_jsx("p", { style: { margin: 0, fontSize: '0.9em', color: '#666' }, children: "Critical Threats" }), _jsx("h2", { style: { margin: '8px 0 0 0', color: '#ff1744' }, children: summary.critical_threats })] }), _jsx(SecurityIcon, { sx: { fontSize: 40, color: '#ff1744' } })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs(Box, { children: [_jsx("p", { style: { margin: 0, fontSize: '0.9em', color: '#666' }, children: "Malicious IPs" }), _jsx("h2", { style: { margin: '8px 0 0 0' }, children: summary.malicious_ips })] }), _jsx(WarningIcon, { sx: { fontSize: 40, color: '#ff9100' } })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs(Box, { children: [_jsx("p", { style: { margin: 0, fontSize: '0.9em', color: '#666' }, children: "Malware Families" }), _jsx("h2", { style: { margin: '8px 0 0 0' }, children: summary.malware_families })] }), _jsx(InfoIcon, { sx: { fontSize: 40, color: '#4caf50' } })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Threat Severity Distribution (24h)" }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: [
                                                                        { name: 'Critical', value: summary.critical_threats },
                                                                        { name: 'High', value: summary.high_threats },
                                                                        { name: 'Medium', value: summary.medium_threats },
                                                                        { name: 'Low', value: summary.low_threats },
                                                                    ], cx: "50%", cy: "50%", labelLine: true, label: ({ name, value }) => `${name}: ${value}`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: ['#ff1744', '#ff9100', '#2196f3', '#4caf50'].map((color, index) => (_jsx(Cell, { fill: color }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Top Threat Types (24h)" }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: summary.threat_types.slice(0, 10), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "type" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", fill: "#2196f3" })] }) }) })] }) }), timeline.length > 0 && (_jsx(Grid, { item: true, xs: 12, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Threat Timeline (Last 24 Hours)" }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: timeline, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "count", stroke: "#2196f3", name: "Threats" })] }) }) })] }) }))] })), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Paper, { children: [_jsxs(Tabs, { value: tabValue, onChange: (e, val) => setTabValue(val), children: [_jsx(Tab, { label: `Top Malicious IPs (${topIps.length})` }), _jsx(Tab, { label: `Top Threats (${topThreats.length})` })] }), tabValue === 0 && (_jsx(Box, { sx: { p: 2 }, children: topIps.length > 0 ? (_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: '#f5f5f5' }, children: [_jsx(TableCell, { children: "IP Address" }), _jsx(TableCell, { align: "center", children: "Incidents" }), _jsx(TableCell, { align: "center", children: "Severity" }), _jsx(TableCell, { align: "center", children: "Threats" }), _jsx(TableCell, { children: "Reputation" }), _jsx(TableCell, { children: "Country" }), _jsx(TableCell, { align: "center", children: "Action" })] }) }), _jsx(TableBody, { children: topIps.map((ip) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsx("code", { style: { backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }, children: ip.src_ip }) }), _jsx(TableCell, { align: "center", children: _jsx(Chip, { label: ip.incident_count, size: "small" }) }), _jsx(TableCell, { align: "center", children: _jsx(Chip, { label: ip.max_severity, color: getSeverityChipColor(ip.max_severity), size: "small", variant: "outlined" }) }), _jsx(TableCell, { align: "center", children: ip.unique_threats }), _jsx(TableCell, { children: _jsx(Chip, { label: ip.reputation_level, variant: "outlined", size: "small" }) }), _jsx(TableCell, { children: ip.country }), _jsx(TableCell, { align: "center", children: _jsx(Button, { size: "small", variant: "outlined", onClick: () => {
                                                                                setSelectedIp(ip);
                                                                                setIpDetailDialog(true);
                                                                            }, children: "Details" }) })] }, ip.src_ip))) })] }) })) : (_jsx(Box, { sx: { p: 4, textAlign: 'center', color: '#999' }, children: "No malicious IPs detected" })) })), tabValue === 1 && (_jsx(Box, { sx: { p: 2 }, children: topThreats.length > 0 ? (_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: '#f5f5f5' }, children: [_jsx(TableCell, { children: "Threat Type" }), _jsx(TableCell, { align: "center", children: "Detections" }), _jsx(TableCell, { align: "center", children: "Peak Severity" }), _jsx(TableCell, { align: "center", children: "Critical %" })] }) }), _jsx(TableBody, { children: topThreats.map((threat, idx) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: threat.threat_name }), _jsx(TableCell, { align: "center", children: _jsx(Chip, { label: threat.detection_count, size: "small" }) }), _jsx(TableCell, { align: "center", children: _jsx(Chip, { label: threat.max_severity, color: getSeverityChipColor(threat.max_severity), size: "small", variant: "outlined" }) }), _jsx(TableCell, { align: "center", children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(LinearProgress, { variant: "determinate", value: threat.critical_percentage, sx: { flex: 1 } }), _jsxs("span", { children: [Math.round(threat.critical_percentage), "%"] })] }) })] }, idx))) })] }) })) : (_jsx(Box, { sx: { p: 4, textAlign: 'center', color: '#999' }, children: "No threat data available" })) }))] }) })] }))] }), _jsxs(Dialog, { open: ipDetailDialog, onClose: () => setIpDetailDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["IP Details: ", selectedIp?.src_ip] }), _jsx(DialogContent, { sx: { mt: 2 }, children: selectedIp && (_jsxs(Box, { children: [_jsxs(Box, { sx: { mb: 2 }, children: [_jsx("strong", { children: "IP Address:" }), _jsx("p", { children: selectedIp.src_ip })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx("strong", { children: "Incidents:" }), _jsx("p", { children: selectedIp.incident_count })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx("strong", { children: "Severity:" }), _jsx(Chip, { label: selectedIp.max_severity, color: getSeverityChipColor(selectedIp.max_severity) })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx("strong", { children: "Unique Threats:" }), _jsx("p", { children: selectedIp.unique_threats })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx("strong", { children: "Reputation:" }), _jsx(Chip, { label: selectedIp.reputation_level, variant: "outlined" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx("strong", { children: "Country:" }), _jsx("p", { children: selectedIp.country })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx("strong", { children: "Organization:" }), _jsx("p", { children: selectedIp.organization })] }), _jsxs(Box, { children: [_jsx("strong", { children: "Last Seen:" }), _jsx("p", { children: selectedIp.last_seen })] })] })) })] })] }));
};
export default ThreatIntel;
//# sourceMappingURL=ThreatIntel.js.map