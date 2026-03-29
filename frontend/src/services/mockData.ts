// Mock data for development/fallback when backend is not available

export const mockAlerts = [
  {
    id: '1',
    type: 'SQL Injection',
    severity: 'critical' as const,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    source: '192.168.1.105',
    destination: '10.0.0.50',
    message: 'SQL injection pattern detected in HTTP request',
  },
  {
    id: '2',
    type: 'Port Scan',
    severity: 'high' as const,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    source: '203.0.113.42',
    destination: '10.0.0.0/24',
    message: 'Sequential port scanning detected',
  },
  {
    id: '3',
    type: 'Brute Force',
    severity: 'high' as const,
    timestamp: new Date(Date.now() - 900000).toISOString(),
    source: '198.51.100.89',
    destination: '10.0.0.100',
    message: 'Multiple failed SSH login attempts',
  },
  {
    id: '4',
    type: 'XSS Attack',
    severity: 'medium' as const,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    source: '192.168.1.200',
    destination: '10.0.0.75',
    message: 'Cross-site scripting payload detected',
  },
  {
    id: '5',
    type: 'DDoS',
    severity: 'critical' as const,
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    source: '203.0.113.0/24',
    destination: '10.0.0.25',
    message: 'Massive traffic spike detected from multiple IPs',
  },
]

export const mockStats = {
  overview: {
    total_alerts: 1247,
    critical_count: 23,
    high_count: 89,
    medium_count: 156,
    low_count: 979,
    alerts_today: 45,
    detection_accuracy: 96.2,
    packets_processed: 1204567,
  },
  byTime: [
    { hour: '00:00', threats: 5, packets: 1200 },
    { hour: '01:00', threats: 8, packets: 1900 },
    { hour: '02:00', threats: 3, packets: 1600 },
    { hour: '03:00', threats: 12, packets: 2100 },
    { hour: '04:00', threats: 4, packets: 1800 },
    { hour: '05:00', threats: 15, packets: 2400 },
    { hour: '06:00', threats: 10, packets: 2200 },
    { hour: '07:00', threats: 7, packets: 1700 },
  ],
  bySeverity: [
    { severity: 'critical', count: 23, percentage: 1.8 },
    { severity: 'high', count: 89, percentage: 7.1 },
    { severity: 'medium', count: 156, percentage: 12.5 },
    { severity: 'low', count: 979, percentage: 78.6 },
  ],
}

export const mockRules = [
  {
    id: '1',
    name: 'SQL Injection Detection',
    pattern: "(union|select|insert|update|delete).*from",
    pattern_type: 'regex',
    threat_type: 'SQL Injection',
    enabled: true,
    confidence: 95,
  },
  {
    id: '2',
    name: 'Port Scan Detection',
    pattern: 'sequential_port_access',
    pattern_type: 'pattern',
    threat_type: 'Port Scan',
    enabled: true,
    confidence: 88,
  },
  {
    id: '3',
    name: 'Brute Force Detection',
    pattern: 'multiple_failed_auth',
    pattern_type: 'behavioral',
    threat_type: 'Brute Force',
    enabled: true,
    confidence: 92,
  },
]

export const mockGeoData = [
  { country: 'China', incidents: 234, severity: 'critical', percentage: 18 },
  { country: 'Russia', incidents: 178, severity: 'high', percentage: 14 },
  { country: 'United States', incidents: 142, severity: 'medium', percentage: 11 },
  { country: 'India', incidents: 98, severity: 'high', percentage: 8 },
  { country: 'Brazil', incidents: 87, severity: 'medium', percentage: 7 },
  { country: 'Others', incidents: 508, severity: 'low', percentage: 42 },
]

export const mockNetworkTopology = {
  nodes: [
    { id: '192.168.1.1', label: 'Attacker', type: 'attacker' as const, threat_count: 45 },
    { id: '10.0.0.50', label: 'Web Server', type: 'target' as const, threat_count: 23 },
    { id: '10.0.0.100', label: 'Database', type: 'dest' as const, threat_count: 12 },
    { id: '203.0.113.42', label: 'Scanner', type: 'source' as const, threat_count: 34 },
  ],
  edges: [
    { source: '192.168.1.1', target: '10.0.0.50', threats: 23, severity: 'critical', protocol: 'HTTP' },
    { source: '203.0.113.42', target: '10.0.0.100', threats: 12, severity: 'high', protocol: 'SSH' },
    { source: '192.168.1.1', target: '10.0.0.100', threats: 8, severity: 'medium', protocol: 'MySQL' },
  ],
  stats: {
    total_connections: 45,
    critical_paths: 3,
  },
}

export const mockPackets = [
  {
    id: '1',
    source_ip: '192.168.1.105',
    dest_ip: '10.0.0.50',
    protocol: 'TCP',
    port: 80,
    payload_size: 1024,
    timestamp: new Date().toISOString(),
    flags: 'SYN',
    threat_score: 0.2,
  },
  {
    id: '2',
    source_ip: '203.0.113.42',
    dest_ip: '10.0.0.100',
    protocol: 'TCP',
    port: 22,
    payload_size: 256,
    timestamp: new Date().toISOString(),
    flags: 'PSH,ACK',
    threat_score: 0.85,
  },
]
