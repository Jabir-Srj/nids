import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  OpenInNew as OpenInNewIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

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

const AlertModal: React.FC<AlertModalProps> = ({ open, alert, onClose, onUpdate }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityColor = (severity: string): any => {
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

  if (!alert) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{alert.alert_type}</Typography>
          <Chip
            label={alert.severity}
            color={getSeverityColor(alert.severity)}
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Alert Summary Card */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Alert Summary" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Alert ID
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <code style={{ fontSize: '0.85em', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                          {alert.id}
                        </code>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCopy(alert.id)}
                          endIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                        >
                          Copy
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Timestamp
                      </Typography>
                      <Typography sx={{ mt: 0.5 }}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Threat Type
                      </Typography>
                      <Chip label={alert.threat_type} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Confidence
                      </Typography>
                      <Typography sx={{ mt: 0.5 }}>
                        {Math.round(alert.confidence * 100)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Network Details Card */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Network Details" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Source IP : Port
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <code style={{ fontSize: '0.85em', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                          {alert.src_ip}:{alert.src_port}
                        </code>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCopy(`${alert.src_ip}`)}
                        >
                          Copy IP
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Destination IP : Port
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <code style={{ fontSize: '0.85em', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                          {alert.dst_ip}:{alert.dst_port}
                        </code>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCopy(`${alert.dst_ip}`)}
                        >
                          Copy IP
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Protocol
                      </Typography>
                      <Chip label={alert.protocol} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Alert Message Card */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Alert Message" />
              <CardContent>
                <Alert severity={getSeverityColor(alert.severity)} sx={{ mb: 2 }}>
                  {alert.message}
                </Alert>
                {alert.rule_matched && (
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Rule Matched
                    </Typography>
                    <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                      <code>{alert.rule_matched}</code>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Protocol Breakdown */}
          {alert.payload && (
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Packet Payload (Preview)" />
                <CardContent>
                  <Box
                    sx={{
                      backgroundColor: '#1e1e1e',
                      color: '#d4d4d4',
                      p: 2,
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: 200,
                      fontFamily: 'monospace',
                      fontSize: '0.85em',
                    }}
                  >
                    {alert.payload.substring(0, 500)}
                    {alert.payload.length > 500 && '...'}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Suggested Actions Card */}
          {alert.suggested_actions && alert.suggested_actions.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Suggested Actions" />
                <CardContent>
                  <List dense>
                    {alert.suggested_actions.map((action, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={action}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Related Alerts Card */}
          {alert.related_alerts && alert.related_alerts.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Related Alerts" />
                <CardContent>
                  <List dense>
                    {alert.related_alerts.map((related_id, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={`Alert ${idx + 1}`}
                          secondary={related_id}
                          secondaryTypographyProps={{ variant: 'caption', component: 'div' }}
                        />
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Status Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Status
                    </Typography>
                    <Chip label={alert.status} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Severity
                    </Typography>
                    <Chip
                      label={alert.severity}
                      color={getSeverityColor(alert.severity)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onClose}>
          Mark as Reviewed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertModal;
