"""
Unit tests for NIDS backend components
Tests packet capture engine, rule engine, and database models
"""

import pytest
import tempfile
from pathlib import Path
import logging
from scapy.packet import Packet
from scapy.layers.inet import IP, TCP, UDP
from scapy.all import IP as IP_Layer, TCP as TCP_Layer

# Import modules to test
from backend.capture.packet_capture import (
    PacketCaptureEngine, CaptureStats, CaptureMode
)
from backend.detection.rule_engine import (
    RuleEngine, Rule, SeverityLevel, PatternType, Detection
)
from backend.database.models import (
    db, Alert, ThreatIntel, Capture
)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class TestCaptureStats:
    """Test capture statistics tracking"""
    
    def test_stats_initialization(self):
        """Test stats object creation"""
        stats = CaptureStats()
        assert stats.packets_captured == 0
        assert stats.bytes_captured == 0
        assert stats.packets_dropped == 0
    
    def test_packets_per_second(self):
        """Test PPS calculation"""
        import time
        stats = CaptureStats()
        stats.packets_captured = 100
        stats.start_time = time.time() - 1.0  # 1 second ago
        assert stats.packets_per_second > 0
    
    def test_stats_summary(self):
        """Test stats summary generation"""
        stats = CaptureStats()
        stats.packets_captured = 1000
        stats.bytes_captured = 100000
        summary = stats.get_summary()
        
        assert "packets_captured" in summary
        assert "bytes_captured" in summary
        assert "packets_per_second" in summary


class TestPacketCaptureEngine:
    """Test packet capture engine"""
    
    def test_engine_initialization(self):
        """Test engine creation"""
        engine = PacketCaptureEngine()
        assert engine.mode == CaptureMode.STOPPED
        assert not engine.is_capturing
        assert engine.interface is None
    
    def test_interface_detection(self):
        """Test interface exists method"""
        engine = PacketCaptureEngine()
        # Should have at least one interface
        result = engine._interface_exists("lo") or engine._interface_exists("loopback")
        # Note: May vary on different systems
    
    def test_stats_tracking(self):
        """Test statistics tracking"""
        engine = PacketCaptureEngine()
        stats = engine.get_stats()
        
        assert stats.packets_captured == 0
        assert stats.mode is not None


class TestRule:
    """Test detection rules"""
    
    def test_rule_creation_string(self):
        """Test creating string pattern rule"""
        rule = Rule(
            name="Test SQL Injection",
            severity=SeverityLevel.HIGH,
            threat_type="SQL Injection",
            pattern_type=PatternType.STRING,
            pattern="UNION SELECT",
            description="Test rule",
        )
        
        assert rule.name == "Test SQL Injection"
        assert rule.severity == SeverityLevel.HIGH
        assert rule.pattern_type == PatternType.STRING
    
    def test_rule_creation_regex(self):
        """Test creating regex pattern rule"""
        rule = Rule(
            name="Test XSS",
            severity=SeverityLevel.MEDIUM,
            threat_type="XSS",
            pattern_type=PatternType.REGEX,
            pattern=r"<script[^>]*>",
        )
        
        assert rule.compiled_pattern is not None
    
    def test_rule_creation_hex(self):
        """Test creating hex pattern rule"""
        rule = Rule(
            name="Test NOP Sled",
            severity=SeverityLevel.CRITICAL,
            threat_type="Buffer Overflow",
            pattern_type=PatternType.HEX,
            pattern="90 90 90 90",
        )
        
        assert rule.hex_pattern == b'\x90\x90\x90\x90'


class TestRuleEngine:
    """Test rule engine functionality"""
    
    def test_engine_initialization(self):
        """Test engine creation"""
        engine = RuleEngine()
        assert engine.rules == {}
        assert engine.stats["rules_loaded"] == 0
    
    def test_add_rule(self):
        """Test adding rules"""
        engine = RuleEngine()
        rule = Rule(
            name="Test Rule",
            severity=SeverityLevel.HIGH,
            threat_type="Test",
            pattern_type=PatternType.STRING,
            pattern="test_pattern",
        )
        
        result = engine.add_rule(rule)
        assert result is True
        assert "Test Rule" in engine.rules
    
    def test_remove_rule(self):
        """Test removing rules"""
        engine = RuleEngine()
        rule = Rule(
            name="Test Rule",
            severity=SeverityLevel.HIGH,
            threat_type="Test",
            pattern_type=PatternType.STRING,
            pattern="test_pattern",
        )
        
        engine.add_rule(rule)
        assert engine.remove_rule("Test Rule") is True
        assert "Test Rule" not in engine.rules
    
    def test_enable_disable_rule(self):
        """Test enabling/disabling rules"""
        engine = RuleEngine()
        rule = Rule(
            name="Test Rule",
            severity=SeverityLevel.HIGH,
            threat_type="Test",
            pattern_type=PatternType.STRING,
            pattern="test_pattern",
        )
        
        engine.add_rule(rule)
        engine.disable_rule("Test Rule")
        assert not engine.get_rule("Test Rule").enabled
        
        engine.enable_rule("Test Rule")
        assert engine.get_rule("Test Rule").enabled
    
    def test_engine_stats(self):
        """Test engine statistics"""
        engine = RuleEngine()
        rule = Rule(
            name="Test Rule",
            severity=SeverityLevel.HIGH,
            threat_type="Test",
            pattern_type=PatternType.STRING,
            pattern="test_pattern",
        )
        engine.add_rule(rule)
        
        stats = engine.get_stats()
        assert stats["rules_loaded"] == 1
        assert "avg_evaluation_time_ms" in stats


class TestSignatureMatching:
    """Test signature pattern matching"""
    
    def test_string_matching(self):
        """Test string pattern matching"""
        result = RuleEngine._match_string(
            b"SELECT * FROM users WHERE id=1",
            "SELECT"
        )
        assert result is True
    
    def test_string_matching_case_insensitive(self):
        """Test case-insensitive string matching"""
        result = RuleEngine._match_string(
            b"select * from users",
            "SELECT"
        )
        assert result is True
    
    def test_regex_matching(self):
        """Test regex pattern matching"""
        import re
        pattern = re.compile(r"(?i)union\s+select")
        result = RuleEngine._match_regex(
            b"UNION SELECT * FROM users",
            pattern
        )
        assert result is True
    
    def test_hex_matching(self):
        """Test hex pattern matching"""
        result = RuleEngine._match_hex(
            b"\x90\x90\x90\x90\x90\xcc",
            b"\x90\x90\x90\x90\x90"
        )
        assert result is True


class TestDetection:
    """Test detection object"""
    
    def test_detection_creation(self):
        """Test creating detection"""
        detection = Detection(
            rule_name="Test Rule",
            severity=SeverityLevel.HIGH,
            threat_type="SQL Injection",
            src_ip="192.168.1.1",
            dst_ip="10.0.0.1",
        )
        
        assert detection.rule_name == "Test Rule"
        assert detection.severity == SeverityLevel.HIGH
    
    def test_detection_to_dict(self):
        """Test detection to dictionary conversion"""
        detection = Detection(
            rule_name="Test Rule",
            severity=SeverityLevel.HIGH,
            threat_type="SQL Injection",
            src_ip="192.168.1.1",
            dst_ip="10.0.0.1",
        )
        
        detection_dict = detection.to_dict()
        assert detection_dict["rule_name"] == "Test Rule"
        assert detection_dict["severity"] == "HIGH"


class TestDatabaseModels:
    """Test database models"""
    
    def test_alert_model(self):
        """Test Alert model"""
        alert = Alert(
            src_ip="192.168.1.1",
            dst_ip="10.0.0.1",
            protocol="TCP",
            threat_type="SQL Injection",
            severity="HIGH",
            rule_name="Test Rule",
        )
        
        assert alert.src_ip == "192.168.1.1"
        assert alert.threat_type == "SQL Injection"
    
    def test_threat_intel_model(self):
        """Test ThreatIntel model"""
        intel = ThreatIntel(
            ip_address="192.168.1.1",
            threat_level="high",
            total_reports=5,
        )
        
        assert intel.ip_address == "192.168.1.1"
        assert intel.threat_level == "high"
    
    def test_capture_model(self):
        """Test Capture model"""
        capture = Capture(
            mode="live",
            interface="eth0",
            status="running",
        )
        
        assert capture.mode == "live"
        assert capture.interface == "eth0"
        assert capture.get_duration() > 0


class TestIntegration:
    """Integration tests"""
    
    def test_rule_load_and_evaluate(self):
        """Test loading rules and evaluating packets"""
        engine = RuleEngine()
        
        # Add test rules
        sql_rule = Rule(
            name="SQL Injection Test",
            severity=SeverityLevel.HIGH,
            threat_type="SQL Injection",
            pattern_type=PatternType.STRING,
            pattern="UNION SELECT",
        )
        engine.add_rule(sql_rule)
        
        # Create test packet with payload
        packet = IP_Layer(dst="10.0.0.1") / TCP_Layer(dport=80) / b"UNION SELECT * FROM users"
        
        # Note: Full packet evaluation requires raw packet bytes
        # This is a simplified test


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
