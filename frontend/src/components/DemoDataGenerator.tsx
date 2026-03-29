import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  LinearProgress,
  Typography,
  Chip,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface DemoDataGeneratorProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const DemoDataGenerator: React.FC<DemoDataGeneratorProps> = ({ onComplete, onError }) => {
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Error: ${errorMsg}`);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => setOpen(true)}
        size="small"
      >
        Generate Demo Data
      </Button>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Demo Data</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Generate sample alerts and threat data for testing and demonstration purposes.
          </Typography>

          {loading && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">{message}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#999' }}>
                {progress}%
              </Typography>
            </Box>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Demo data generated! Refreshing dashboard...
            </Alert>
          )}

          {!loading && !success && (
            <Alert severity="info">
              This will create:
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                <li>10+ sample security alerts</li>
                <li>Various threat types (SQL injection, brute force, DDoS, etc.)</li>
                <li>Different severity levels</li>
                <li>Realistic network traffic patterns</li>
              </ul>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateDemo}
            disabled={loading || success}
          >
            {loading ? 'Generating...' : 'Generate Demo Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DemoDataGenerator;
