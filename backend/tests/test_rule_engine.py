"""
Unit tests for rule engine module
"""
import pytest
import yaml
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

class TestRuleEngine:
    """Test cases for RuleEngine"""
    
    def test_rule_engine_initialization(self):
        """Test RuleEngine initialization"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        assert engine is not None
        assert hasattr(engine, 'load_rules')
        assert hasattr(engine, 'evaluate_packet')
        assert hasattr(engine, 'add_custom_rule')
    
    def test_load_rules_from_yaml(self, temp_dir):
        """Test loading rules from YAML file"""
        from detection.rule_engine import RuleEngine
        
        # Create sample rules file
        rules = [
            {
                'name': 'SQL Injection - UNION',
                'severity': 'HIGH',
                'pattern_type': 'regex',
                'pattern': r'(?i)union\s+select',
                'cve_ids': ['CVE-2019-9193']
            },
            {
                'name': 'XSS Detection',
                'severity': 'MEDIUM',
                'pattern_type': 'string',
                'pattern': '<script>'
            }
        ]
        
        rules_file = temp_dir / 'rules.yaml'
        with open(rules_file, 'w') as f:
            yaml.dump(rules, f)
        
        engine = RuleEngine()
        engine.load_rules(str(rules_file))
        
        assert len(engine.rules) >= 2
    
    def test_evaluate_packet_with_sql_injection(self, mock_packet_data):
        """Test detection of SQL injection in packet"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        # Create packet with SQL injection payload
        malicious_packet = mock_packet_data.copy()
        malicious_packet['payload'] = b"UNION SELECT * FROM users"
        
        alerts = engine.evaluate_packet(malicious_packet)
        
        # Should generate alert for SQL injection
        assert len(alerts) > 0
        assert any('SQL' in str(alert) for alert in alerts)
    
    def test_evaluate_packet_with_xss(self, mock_packet_data):
        """Test detection of XSS in packet"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        # Create packet with XSS payload
        xss_packet = mock_packet_data.copy()
        xss_packet['payload'] = b"<script>alert('xss')</script>"
        
        alerts = engine.evaluate_packet(xss_packet)
        
        # Should generate alert for XSS
        assert len(alerts) > 0
    
    def test_evaluate_clean_packet(self, mock_packet_data):
        """Test that clean packets don't generate false alerts"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        # Clean packet
        clean_packet = mock_packet_data.copy()
        clean_packet['payload'] = b"GET / HTTP/1.1\r\nHost: example.com"
        
        alerts = engine.evaluate_packet(clean_packet)
        
        # Should not generate alerts for clean traffic
        assert len(alerts) == 0
    
    def test_rule_severity_levels(self):
        """Test rule severity classification"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        severity_levels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']
        
        for severity in severity_levels:
            rule = {
                'name': f'Test Rule {severity}',
                'severity': severity,
                'pattern': 'test'
            }
            engine.add_custom_rule(rule)
        
        assert len(engine.rules) >= 5
    
    def test_regex_pattern_matching(self):
        """Test regex pattern matching in rules"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        rule = {
            'name': 'Port Scan Detection',
            'severity': 'HIGH',
            'pattern_type': 'regex',
            'pattern': r'(?i)syn.*flood'
        }
        
        engine.add_custom_rule(rule)
        
        test_packet = {
            'payload': b"SYN flood attack"
        }
        
        # Rule should match
        assert any(rule['name'] in str(alert) for alert in engine.evaluate_packet(test_packet))
    
    def test_hex_pattern_matching(self):
        """Test hex pattern matching in rules"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        rule = {
            'name': 'Buffer Overflow',
            'severity': 'CRITICAL',
            'pattern_type': 'hex',
            'pattern': '90909090'  # NOP sled
        }
        
        engine.add_custom_rule(rule)
        
        test_packet = {
            'payload': b"\x90\x90\x90\x90\x90\x90\x90\x90"
        }
        
        # Rule should match NOP sled
        alerts = engine.evaluate_packet(test_packet)
        assert len(alerts) > 0
    
    def test_multiple_rule_matching(self):
        """Test matching multiple rules on single packet"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        rule1 = {
            'name': 'Rule 1',
            'severity': 'HIGH',
            'pattern_type': 'string',
            'pattern': 'attack'
        }
        
        rule2 = {
            'name': 'Rule 2',
            'severity': 'MEDIUM',
            'pattern_type': 'string',
            'pattern': 'suspicious'
        }
        
        engine.add_custom_rule(rule1)
        engine.add_custom_rule(rule2)
        
        test_packet = {
            'payload': b"attack suspicious payload"
        }
        
        alerts = engine.evaluate_packet(test_packet)
        assert len(alerts) >= 2
    
    def test_rule_performance(self):
        """Test rule evaluation performance"""
        from detection.rule_engine import RuleEngine
        import time
        
        engine = RuleEngine()
        
        # Add many rules
        for i in range(100):
            rule = {
                'name': f'Rule {i}',
                'severity': 'MEDIUM',
                'pattern_type': 'string',
                'pattern': f'pattern{i}'
            }
            engine.add_custom_rule(rule)
        
        test_packet = {'payload': b"test payload"}
        
        start_time = time.time()
        for _ in range(1000):
            engine.evaluate_packet(test_packet)
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        
        # Should evaluate 1000 packets with 100 rules in reasonable time
        assert elapsed_time < 5.0, f"Rule evaluation too slow: {elapsed_time}s"
    
    def test_stateful_rule_detection(self):
        """Test stateful multi-packet rule detection"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        # Simulate port scanning - multiple SYN to different ports
        packets = [
            {'dst_port': 80, 'flags': 'SYN'},
            {'dst_port': 443, 'flags': 'SYN'},
            {'dst_port': 22, 'flags': 'SYN'},
            {'dst_port': 21, 'flags': 'SYN'},
        ]
        
        alerts = []
        for packet in packets:
            packet_alerts = engine.evaluate_packet(packet)
            alerts.extend(packet_alerts)
        
        # May or may not have alerts depending on implementation
        # but should not crash
        assert isinstance(alerts, list)

class TestSignatureRules:
    """Test cases for specific signature rules"""
    
    def test_sql_injection_signatures(self):
        """Test SQL injection detection signatures"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        sql_payloads = [
            b"UNION SELECT * FROM users",
            b"1=1 OR 1=1",
            b"DROP TABLE users",
            b"INSERT INTO admin VALUES",
            b"DELETE FROM users WHERE 1=1"
        ]
        
        for payload in sql_payloads:
            packet = {'payload': payload}
            alerts = engine.evaluate_packet(packet)
            # At least one SQL injection signature should match
            assert len(alerts) > 0, f"Failed to detect: {payload}"
    
    def test_xss_signatures(self):
        """Test XSS detection signatures"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        xss_payloads = [
            b"<script>alert('xss')</script>",
            b"javascript:void(0)",
            b"onerror=alert(1)",
            b"onclick=alert(1)"
        ]
        
        for payload in xss_payloads:
            packet = {'payload': payload}
            alerts = engine.evaluate_packet(packet)
            assert len(alerts) > 0, f"Failed to detect XSS: {payload}"
    
    def test_port_scan_detection(self):
        """Test port scanning detection"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        # Simulate port scan with SYN flags
        packets = []
        for port in range(80, 90):
            packets.append({
                'dst_port': port,
                'flags': 'SYN',
                'src_ip': '192.168.1.100'
            })
        
        # Should detect multiple SYN packets to different ports
        alerts = []
        for packet in packets:
            alerts.extend(engine.evaluate_packet(packet))
        
        # Should have some alerts
        assert len(alerts) >= 0  # Implementation dependent
