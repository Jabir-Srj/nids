import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ThreatSummary {
  total_threats_24h: number;
  critical_threats: number;
  high_threats: number;
  medium_threats: number;
  low_threats: number;
  threat_types: Array<{ type: string; count: number }>;
  malicious_ips: number;
  malware_families: number;
}

interface MaliciousIP {
  src_ip: string;
  incident_count: number;
  max_severity: string;
  unique_threats: number;
  last_seen: string;
  reputation_level: string;
  country: string;
  organization: string;
}

interface ThreatData {
  threat_name: string;
  detection_count: number;
  max_severity: string;
  critical_percentage: number;
}

const ThreatIntel: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ThreatSummary | null>(null);
  const [topIps, setTopIps] = useState<MaliciousIP[]>([]);
  const [topThreats, setTopThreats] = useState<ThreatData[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [selectedIp, setSelectedIp] = useState<MaliciousIP | null>(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch threat data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
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

  const getSeverityChipColor = (severity: string): any => {
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

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <h1 style={{ margin: 0, marginBottom: 8 }}>Threat Intelligence</h1>
              <p style={{ margin: 0, color: '#666' }}>Real-time threat analysis and monitoring</p>
            </Box>
            <Button variant="contained" onClick={fetchThreatData}>
              Refresh
            </Button>
          </Box>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}

        {loading && !summary ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Total Threats (24h)</p>
                          <h2 style={{ margin: '8px 0 0 0' }}>{summary.total_threats_24h}</h2>
                        </Box>
                        <TrendingUpIcon sx={{ fontSize: 40, color: '#2196f3' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Critical Threats</p>
                          <h2 style={{ margin: '8px 0 0 0', color: '#ff1744' }}>
                            {summary.critical_threats}
                          </h2>
                        </Box>
                        <SecurityIcon sx={{ fontSize: 40, color: '#ff1744' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Malicious IPs</p>
                          <h2 style={{ margin: '8px 0 0 0' }}>{summary.malicious_ips}</h2>
                        </Box>
                        <WarningIcon sx={{ fontSize: 40, color: '#ff9100' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Malware Families</p>
                          <h2 style={{ margin: '8px 0 0 0' }}>{summary.malware_families}</h2>
                        </Box>
                        <InfoIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Severity Distribution */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Threat Severity Distribution (24h)" />
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Critical', value: summary.critical_threats },
                              { name: 'High', value: summary.high_threats },
                              { name: 'Medium', value: summary.medium_threats },
                              { name: 'Low', value: summary.low_threats },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {['#ff1744', '#ff9100', '#2196f3', '#4caf50'].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Threat Types */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Top Threat Types (24h)" />
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={summary.threat_types.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#2196f3" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Timeline */}
                {timeline.length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Threat Timeline (Last 24 Hours)" />
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={timeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#2196f3" name="Threats" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            )}

            {/* Tabs for detailed views */}
            <Grid item xs={12}>
              <Paper>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                  <Tab label={`Top Malicious IPs (${topIps.length})`} />
                  <Tab label={`Top Threats (${topThreats.length})`} />
                </Tabs>

                {/* Top IPs Tab */}
                {tabValue === 0 && (
                  <Box sx={{ p: 2 }}>
                    {topIps.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell>IP Address</TableCell>
                              <TableCell align="center">Incidents</TableCell>
                              <TableCell align="center">Severity</TableCell>
                              <TableCell align="center">Threats</TableCell>
                              <TableCell>Reputation</TableCell>
                              <TableCell>Country</TableCell>
                              <TableCell align="center">Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topIps.map((ip) => (
                              <TableRow key={ip.src_ip} hover>
                                <TableCell>
                                  <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                                    {ip.src_ip}
                                  </code>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={ip.incident_count} size="small" />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={ip.max_severity}
                                    color={getSeverityChipColor(ip.max_severity)}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">{ip.unique_threats}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={ip.reputation_level}
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{ip.country}</TableCell>
                                <TableCell align="center">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                      setSelectedIp(ip);
                                      setIpDetailDialog(true);
                                    }}
                                  >
                                    Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>
                        No malicious IPs detected
                      </Box>
                    )}
                  </Box>
                )}

                {/* Top Threats Tab */}
                {tabValue === 1 && (
                  <Box sx={{ p: 2 }}>
                    {topThreats.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell>Threat Type</TableCell>
                              <TableCell align="center">Detections</TableCell>
                              <TableCell align="center">Peak Severity</TableCell>
                              <TableCell align="center">Critical %</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topThreats.map((threat, idx) => (
                              <TableRow key={idx} hover>
                                <TableCell>{threat.threat_name}</TableCell>
                                <TableCell align="center">
                                  <Chip label={threat.detection_count} size="small" />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={threat.max_severity}
                                    color={getSeverityChipColor(threat.max_severity)}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={threat.critical_percentage}
                                      sx={{ flex: 1 }}
                                    />
                                    <span>{Math.round(threat.critical_percentage)}%</span>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>
                        No threat data available
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      {/* IP Detail Dialog */}
      <Dialog open={ipDetailDialog} onClose={() => setIpDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>IP Details: {selectedIp?.src_ip}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedIp && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <strong>IP Address:</strong>
                <p>{selectedIp.src_ip}</p>
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Incidents:</strong>
                <p>{selectedIp.incident_count}</p>
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Severity:</strong>
                <Chip label={selectedIp.max_severity} color={getSeverityChipColor(selectedIp.max_severity)} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Unique Threats:</strong>
                <p>{selectedIp.unique_threats}</p>
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Reputation:</strong>
                <Chip label={selectedIp.reputation_level} variant="outlined" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Country:</strong>
                <p>{selectedIp.country}</p>
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Organization:</strong>
                <p>{selectedIp.organization}</p>
              </Box>
              <Box>
                <strong>Last Seen:</strong>
                <p>{selectedIp.last_seen}</p>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ThreatIntel;
