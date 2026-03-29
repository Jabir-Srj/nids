import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Chip, Grid, Alert, CircularProgress, InputAdornment, Select, MenuItem, FormControl, InputLabel, Switch, } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, PlayArrow as PlayArrowIcon, } from '@mui/icons-material';
const Rules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openTestDialog, setOpenTestDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [testingRuleId, setTestingRuleId] = useState(null);
    const [testData, setTestData] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [threatTypeFilter, setThreatTypeFilter] = useState('');
    const [enabledFilter, setEnabledFilter] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        pattern: '',
        severity: 'high',
        threat_type: 'malware',
        description: '',
    });
    // Fetch rules on component mount
    useEffect(() => {
        fetchRules();
    }, [searchTerm, severityFilter, threatTypeFilter, enabledFilter]);
    const fetchRules = async () => {
        try {
            setLoading(true);
            setError(null);
            let url = '/api/rules';
            const params = new URLSearchParams();
            if (searchTerm)
                params.append('search', searchTerm);
            if (severityFilter)
                params.append('severity', severityFilter);
            if (threatTypeFilter)
                params.append('threat_type', threatTypeFilter);
            if (enabledFilter)
                params.append('enabled', enabledFilter === 'enabled' ? 'true' : 'false');
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await fetch(url);
            if (!response.ok)
                throw new Error('Failed to fetch rules');
            const data = await response.json();
            setRules(data.rules || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateRule = async () => {
        try {
            if (!formData.name || !formData.pattern) {
                setError('Name and pattern are required');
                return;
            }
            const response = await fetch('/api/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create rule');
            }
            setOpenDialog(false);
            setFormData({
                name: '',
                pattern: '',
                severity: 'high',
                threat_type: 'malware',
                description: '',
            });
            fetchRules();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };
    const handleUpdateRule = async () => {
        if (!editingRule)
            return;
        try {
            const response = await fetch(`/api/rules/${editingRule.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    pattern: formData.pattern,
                    severity: formData.severity,
                    threat_type: formData.threat_type,
                    description: formData.description,
                }),
            });
            if (!response.ok)
                throw new Error('Failed to update rule');
            setOpenDialog(false);
            setEditingRule(null);
            setFormData({
                name: '',
                pattern: '',
                severity: 'high',
                threat_type: 'malware',
                description: '',
            });
            fetchRules();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };
    const handleDeleteRule = async (id) => {
        if (!window.confirm('Are you sure you want to delete this rule?'))
            return;
        try {
            const response = await fetch(`/api/rules/${id}`, { method: 'DELETE' });
            if (!response.ok)
                throw new Error('Failed to delete rule');
            fetchRules();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };
    const handleToggleEnabled = async (rule) => {
        try {
            const response = await fetch(`/api/rules/${rule.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !rule.enabled }),
            });
            if (!response.ok)
                throw new Error('Failed to update rule');
            fetchRules();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };
    const handleTestRule = async () => {
        if (!testingRuleId || !testData) {
            setError('Test data is required');
            return;
        }
        try {
            const response = await fetch(`/api/rules/${testingRuleId}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    test_data: testData.split('\n').filter(t => t.trim()),
                }),
            });
            if (!response.ok)
                throw new Error('Failed to test rule');
            const data = await response.json();
            setTestResult(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };
    const openEditDialog = (rule) => {
        setEditingRule(rule);
        setFormData({
            name: rule.name,
            pattern: rule.pattern,
            severity: rule.severity,
            threat_type: rule.threat_type,
            description: rule.description,
        });
        setOpenDialog(true);
    };
    const getSeverityColor = (severity) => {
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
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Box, { children: [_jsx("h1", { style: { margin: 0, marginBottom: 8 }, children: "Threat Detection Rules" }), _jsx("p", { style: { margin: 0, color: '#666' }, children: "Create and manage detection rules" })] }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => {
                                        setEditingRule(null);
                                        setFormData({
                                            name: '',
                                            pattern: '',
                                            severity: 'high',
                                            threat_type: 'malware',
                                            description: '',
                                        });
                                        setOpenDialog(true);
                                    }, children: "New Rule" })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Paper, { sx: { p: 2 }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(TextField, { fullWidth: true, placeholder: "Search rules...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                                            } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Severity" }), _jsxs(Select, { value: severityFilter, label: "Severity", onChange: (e) => setSeverityFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "critical", children: "Critical" }), _jsx(MenuItem, { value: "high", children: "High" }), _jsx(MenuItem, { value: "medium", children: "Medium" }), _jsx(MenuItem, { value: "low", children: "Low" })] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Threat Type" }), _jsxs(Select, { value: threatTypeFilter, label: "Threat Type", onChange: (e) => setThreatTypeFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "malware", children: "Malware" }), _jsx(MenuItem, { value: "anomaly", children: "Anomaly" }), _jsx(MenuItem, { value: "intrusion", children: "Intrusion" }), _jsx(MenuItem, { value: "policy_violation", children: "Policy Violation" })] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Status" }), _jsxs(Select, { value: enabledFilter, label: "Status", onChange: (e) => setEnabledFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "enabled", children: "Enabled" }), _jsx(MenuItem, { value: "disabled", children: "Disabled" })] })] }) })] }) }) }), error && (_jsx(Grid, { item: true, xs: 12, children: _jsx(Alert, { severity: "error", onClose: () => setError(null), children: error }) })), _jsx(Grid, { item: true, xs: 12, children: loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 }, children: _jsx(CircularProgress, {}) })) : (_jsxs(TableContainer, { component: Paper, children: [_jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: '#f5f5f5' }, children: [_jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Severity" }), _jsx(TableCell, { children: "Threat Type" }), _jsx(TableCell, { align: "center", children: "Matches" }), _jsx(TableCell, { align: "center", children: "Status" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: rules.map((rule) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsxs(Box, { children: [_jsx("strong", { children: rule.name }), _jsx("p", { style: { margin: '4px 0 0 0', fontSize: '0.85em', color: '#666' }, children: rule.description })] }) }), _jsx(TableCell, { children: _jsx(Chip, { label: rule.severity, color: getSeverityColor(rule.severity), size: "small", variant: "outlined" }) }), _jsx(TableCell, { children: rule.threat_type }), _jsx(TableCell, { align: "center", children: rule.matches_count }), _jsx(TableCell, { align: "center", children: _jsx(Switch, { checked: rule.enabled, onChange: () => handleToggleEnabled(rule) }) }), _jsxs(TableCell, { align: "right", children: [_jsx(IconButton, { size: "small", onClick: () => {
                                                                    setTestingRuleId(rule.id);
                                                                    setTestData('');
                                                                    setTestResult(null);
                                                                    setOpenTestDialog(true);
                                                                }, title: "Test Rule", children: _jsx(PlayArrowIcon, {}) }), _jsx(IconButton, { size: "small", onClick: () => openEditDialog(rule), title: "Edit Rule", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { size: "small", onClick: () => handleDeleteRule(rule.id), title: "Delete Rule", children: _jsx(DeleteIcon, {}) })] })] }, rule.id))) })] }), rules.length === 0 && !loading && (_jsx(Box, { sx: { p: 4, textAlign: 'center', color: '#999' }, children: "No rules found. Create one to get started!" }))] })) })] }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingRule ? 'Edit Rule' : 'Create New Rule' }), _jsxs(DialogContent, { sx: { mt: 2 }, children: [_jsx(TextField, { fullWidth: true, label: "Rule Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, label: "Regex Pattern", value: formData.pattern, onChange: (e) => setFormData({ ...formData, pattern: e.target.value }), multiline: true, rows: 3, sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, label: "Description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), multiline: true, rows: 2, sx: { mb: 2 } }), _jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { children: "Severity" }), _jsxs(Select, { value: formData.severity, label: "Severity", onChange: (e) => setFormData({ ...formData, severity: e.target.value }), children: [_jsx(MenuItem, { value: "critical", children: "Critical" }), _jsx(MenuItem, { value: "high", children: "High" }), _jsx(MenuItem, { value: "medium", children: "Medium" }), _jsx(MenuItem, { value: "low", children: "Low" })] })] }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Threat Type" }), _jsxs(Select, { value: formData.threat_type, label: "Threat Type", onChange: (e) => setFormData({ ...formData, threat_type: e.target.value }), children: [_jsx(MenuItem, { value: "malware", children: "Malware" }), _jsx(MenuItem, { value: "anomaly", children: "Anomaly" }), _jsx(MenuItem, { value: "intrusion", children: "Intrusion" }), _jsx(MenuItem, { value: "policy_violation", children: "Policy Violation" })] })] })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { variant: "contained", onClick: editingRule ? handleUpdateRule : handleCreateRule, children: editingRule ? 'Update' : 'Create' })] })] }), _jsxs(Dialog, { open: openTestDialog, onClose: () => setOpenTestDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Test Rule" }), _jsxs(DialogContent, { sx: { mt: 2 }, children: [_jsx(TextField, { fullWidth: true, label: "Test Data (one per line)", value: testData, onChange: (e) => setTestData(e.target.value), multiline: true, rows: 4, placeholder: "Enter test strings, one per line", sx: { mb: 2 } }), testResult && (_jsxs(Alert, { severity: testResult.success ? 'success' : 'warning', sx: { mb: 2 }, children: [_jsxs("strong", { children: ["Matches: ", testResult.match_count, "/", testResult.test_count] }), testResult.matches.length > 0 && (_jsxs("div", { style: { marginTop: 8 }, children: [_jsx("strong", { children: "Matched strings:" }), _jsx("ul", { style: { margin: '8px 0', paddingLeft: 20 }, children: testResult.matches.map((m, i) => (_jsx("li", { children: m }, i))) })] }))] }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenTestDialog(false), children: "Close" }), _jsx(Button, { variant: "contained", onClick: handleTestRule, children: "Test" })] })] })] }));
};
export default Rules;
//# sourceMappingURL=Rules.js.map