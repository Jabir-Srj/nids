import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, LinearProgress, Typography, } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
const DemoDataGenerator = ({ onComplete, onError }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const handleGenerateDemo = async () => {
        try {
            setLoading(true);
            setProgress(0);
            setMessage('Starting demo data generation...');
            setSuccess(false);
            // Call backend to generate demo alerts
            const response = await fetch('/api/demo/inject-alerts', {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to generate demo data');
            }
            const data = await response.json();
            setProgress(50);
            setMessage('Generating threat data...');
            // Simulate additional processing
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setProgress(75);
            setMessage('Indexing and finalizing...');
            await new Promise((resolve) => setTimeout(resolve, 500));
            setProgress(100);
            setMessage('Demo data generated successfully!');
            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                onComplete?.();
            }, 2000);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setMessage(`Error: ${errorMsg}`);
            onError?.(errorMsg);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: () => setOpen(true), size: "small", children: "Generate Demo Data" }), _jsxs(Dialog, { open: open, onClose: () => !loading && setOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Generate Demo Data" }), _jsxs(DialogContent, { sx: { mt: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { mb: 2, color: '#666' }, children: "Generate sample alerts and threat data for testing and demonstration purposes." }), loading && (_jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Box, { sx: { mb: 1, display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(CircularProgress, { size: 20 }), _jsx(Typography, { variant: "body2", children: message })] }), _jsx(LinearProgress, { variant: "determinate", value: progress }), _jsxs(Typography, { variant: "caption", sx: { mt: 1, display: 'block', color: '#999' }, children: [progress, "%"] })] })), success && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, children: "Demo data generated! Refreshing dashboard..." })), !loading && !success && (_jsxs(Alert, { severity: "info", children: ["This will create:", _jsxs("ul", { style: { margin: '8px 0 0 0', paddingLeft: 20 }, children: [_jsx("li", { children: "10+ sample security alerts" }), _jsx("li", { children: "Various threat types (SQL injection, brute force, DDoS, etc.)" }), _jsx("li", { children: "Different severity levels" }), _jsx("li", { children: "Realistic network traffic patterns" })] })] }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpen(false), disabled: loading, children: "Close" }), _jsx(Button, { variant: "contained", onClick: handleGenerateDemo, disabled: loading || success, children: loading ? 'Generating...' : 'Generate Demo Data' })] })] })] }));
};
export default DemoDataGenerator;
//# sourceMappingURL=DemoDataGenerator.js.map