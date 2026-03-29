import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface Rule {
  id: string;
  name: string;
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  threat_type: string;
  description: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  matches_count: number;
}

interface RuleFormData {
  name: string;
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  threat_type: string;
  description: string;
}

const Rules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);
  const [testData, setTestData] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [threatTypeFilter, setThreatTypeFilter] = useState<string>('');
  const [enabledFilter, setEnabledFilter] = useState<string>('');

  const [formData, setFormData] = useState<RuleFormData>({
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

      if (searchTerm) params.append('search', searchTerm);
      if (severityFilter) params.append('severity', severityFilter);
      if (threatTypeFilter) params.append('threat_type', threatTypeFilter);
      if (enabledFilter) params.append('enabled', enabledFilter === 'enabled' ? 'true' : 'false');

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch rules');

      const data = await response.json();
      setRules(data.rules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

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

      if (!response.ok) throw new Error('Failed to update rule');

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/rules/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete rule');
      fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleToggleEnabled = async (rule: Rule) => {
    try {
      const response = await fetch(`/api/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !rule.enabled }),
      });

      if (!response.ok) throw new Error('Failed to update rule');
      fetchRules();
    } catch (err) {
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

      if (!response.ok) throw new Error('Failed to test rule');

      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const openEditDialog = (rule: Rule) => {
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

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <h1 style={{ margin: 0, marginBottom: 8 }}>Threat Detection Rules</h1>
              <p style={{ margin: 0, color: '#666' }}>Create and manage detection rules</p>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingRule(null);
                setFormData({
                  name: '',
                  pattern: '',
                  severity: 'high',
                  threat_type: 'malware',
                  description: '',
                });
                setOpenDialog(true);
              }}
            >
              New Rule
            </Button>
          </Box>
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={severityFilter}
                    label="Severity"
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Threat Type</InputLabel>
                  <Select
                    value={threatTypeFilter}
                    label="Threat Type"
                    onChange={(e) => setThreatTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="malware">Malware</MenuItem>
                    <MenuItem value="anomaly">Anomaly</MenuItem>
                    <MenuItem value="intrusion">Intrusion</MenuItem>
                    <MenuItem value="policy_violation">Policy Violation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={enabledFilter}
                    label="Status"
                    onChange={(e) => setEnabledFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}

        {/* Rules Table */}
        <Grid item xs={12}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Threat Type</TableCell>
                    <TableCell align="center">Matches</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id} hover>
                      <TableCell>
                        <Box>
                          <strong>{rule.name}</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85em', color: '#666' }}>
                            {rule.description}
                          </p>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rule.severity}
                          color={getSeverityColor(rule.severity)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{rule.threat_type}</TableCell>
                      <TableCell align="center">{rule.matches_count}</TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={rule.enabled}
                          onChange={() => handleToggleEnabled(rule)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setTestingRuleId(rule.id);
                            setTestData('');
                            setTestResult(null);
                            setOpenTestDialog(true);
                          }}
                          title="Test Rule"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(rule)}
                          title="Edit Rule"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRule(rule.id)}
                          title="Delete Rule"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rules.length === 0 && !loading && (
                <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>
                  No rules found. Create one to get started!
                </Box>
              )}
            </TableContainer>
          )}
        </Grid>
      </Grid>

      {/* Create/Edit Rule Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Rule' : 'Create New Rule'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Rule Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Regex Pattern"
            value={formData.pattern}
            onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={formData.severity}
              label="Severity"
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
            >
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Threat Type</InputLabel>
            <Select
              value={formData.threat_type}
              label="Threat Type"
              onChange={(e) => setFormData({ ...formData, threat_type: e.target.value })}
            >
              <MenuItem value="malware">Malware</MenuItem>
              <MenuItem value="anomaly">Anomaly</MenuItem>
              <MenuItem value="intrusion">Intrusion</MenuItem>
              <MenuItem value="policy_violation">Policy Violation</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={editingRule ? handleUpdateRule : handleCreateRule}
          >
            {editingRule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Rule Dialog */}
      <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Rule</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Test Data (one per line)"
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            multiline
            rows={4}
            placeholder="Enter test strings, one per line"
            sx={{ mb: 2 }}
          />
          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'warning'} sx={{ mb: 2 }}>
              <strong>Matches: {testResult.match_count}/{testResult.test_count}</strong>
              {testResult.matches.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Matched strings:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                    {testResult.matches.map((m: string, i: number) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>Close</Button>
          <Button variant="contained" onClick={handleTestRule}>
            Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rules;
