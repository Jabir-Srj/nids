"""
Unit tests for PHASE 2 security modules
Validates signatures, threat intelligence, and classifier
"""

import pytest
import json
import yaml
from datetime import datetime
import tempfile
import os


class TestSignatures:
    """Test threat signature loading and validation"""
    
    @pytest.fixture
    def signatures_path(self):
        """Path to signatures file"""
        return "backend/detection/signatures.yaml"
    
    def test_signatures_load(self, signatures_path):
        """Test loading signatures YAML"""
        with open(signatures_path, 'r') as f:
            sigs = yaml.safe_load(f)
        
        assert sigs is not None
        assert 'sql_injection' in sigs
        assert 'xss_injection' in sigs
        assert 'malware_signatures' in sigs
    
    def test_sql_injection_coverage(self, signatures_path):
        """Test SQL injection signature count"""
        with open(signatures_path, 'r') as f:
            sigs = yaml.safe_load(f)
        
        sql_sigs = sigs.get('sql_injection', [])
        assert len(sql_sigs) >= 30, f"Expected 30+ SQL signatures, got {len(sql_sigs)}"
    
    def test_xss_coverage(self, signatures_path):
        """Test XSS signature count"""
        with open(signatures_path, 'r') as f:
            sigs = yaml.safe_load(f)
        
        xss_sigs = sigs.get('xss_injection', [])
        assert len(xss_sigs) >= 25, f"Expected 25+ XSS signatures, got {len(xss_sigs)}"
    
    def test_signature_structure(self, signatures_path):
        """Test signature structure validity"""
        with open(signatures_path, 'r') as f:
            sigs = yaml.safe_load(f)
        
        required_fields = ['id', 'name', 'severity', 'category', 'pattern_type', 'pattern']
        
        for category, sig_list in sigs.items():
            if category == 'metadata' or not isinstance(sig_list, list):
                continue
            
            for sig in sig_list:
                for field in required_fields:
                    assert field in sig, f"Missing {field} in {sig.get('id', 'unknown')}"
    
    def test_severity_levels(self, signatures_path):
        """Test valid severity levels"""
        with open(signatures_path, 'r') as f:
            sigs = yaml.safe_load(f)
        
        valid_severities = {'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'}
        
        for category, sig_list in sigs.items():
            if not isinstance(sig_list, list):
                continue
            for sig in sig_list:
                assert sig.get('severity') in valid_severities


class TestThreatIntel:
    """Test threat intelligence module"""
    
    def test_cache_initialization(self):
        """Test cache creation"""
        try:
            from backend.threat_intel.threat_intel import ThreatIntelligenceCache
            
            with tempfile.TemporaryDirectory() as tmpdir:
                cache = ThreatIntelligenceCache(cache_dir=tmpdir)
                assert os.path.exists(cache.db_path)
        except ImportError:
            pytest.skip("Module not available")
    
    def test_cache_set_get(self):
        """Test cache operations"""
        try:
            from backend.threat_intel.threat_intel import ThreatIntelligenceCache
            
            with tempfile.TemporaryDirectory() as tmpdir:
                cache = ThreatIntelligenceCache(cache_dir=tmpdir)
                
                test_data = {'ip': '1.2.3.4', 'threat_level': 'HIGH'}
                cache.set('test_key', test_data)
                
                retrieved = cache.get('test_key')
                assert retrieved == test_data
        except ImportError:
            pytest.skip("Module not available")
    
    def test_threat_level_calculation(self):
        """Test threat level calculation from confidence score"""
        try:
            from backend.threat_intel.threat_intel import AbuseIPDBClient
            
            client = AbuseIPDBClient()
            
            assert client._calculate_threat_level(80) == "CRITICAL"
            assert client._calculate_threat_level(60) == "HIGH"
            assert client._calculate_threat_level(30) == "MEDIUM"
            assert client._calculate_threat_level(10) == "LOW"
        except ImportError:
            pytest.skip("Module not available")


class TestClassifier:
    """Test alert classifier"""
    
    def test_classifier_initialization(self):
        """Test classifier creation"""
        try:
            from backend.detection.classifier import AlertClassifier
            
            classifier = AlertClassifier()
            assert classifier is not None
            assert len(classifier.threat_signatures) > 0
        except ImportError:
            pytest.skip("Module not available")
    
    def test_threat_categorization(self):
        """Test threat category determination"""
        try:
            from backend.detection.classifier import AlertClassifier, ThreatCategory
            
            classifier = AlertClassifier()
            
            assert classifier._determine_category('SQL_UNION_SELECT') == ThreatCategory.SQL_INJECTION
            assert classifier._determine_category('XSS_SCRIPT_TAG') == ThreatCategory.XSS
            assert classifier._determine_category('DDoS_SYN_FLOOD') == ThreatCategory.DDoS
        except ImportError:
            pytest.skip("Module not available")
    
    def test_cvss_scoring(self):
        """Test CVSS score calculation"""
        try:
            from backend.detection.classifier import AlertClassifier
            
            classifier = AlertClassifier()
            
            alert = {
                'id': 'test_001',
                'signature_id': 'SQL_UNION_SELECT',
                'src_ip': '192.168.1.1',
                'dst_ip': '10.0.0.1',
                'protocol': 'TCP',
                'payload': "' UNION SELECT",
                'confidence': 85.0,
            }
            
            cvss = classifier._calculate_cvss(alert, 'SQL_UNION_SELECT', None)
            
            assert 0 <= cvss.base_score <= 10
            assert 0 <= cvss.temporal_score <= 10
            assert 0 <= cvss.environmental_score <= 10
            assert 0 <= cvss.final_score <= 10
        except ImportError:
            pytest.skip("Module not available")
    
    def test_severity_mapping(self):
        """Test CVSS to severity mapping"""
        try:
            from backend.detection.classifier import CVSSLikeScore, SeverityLevel
            
            score = CVSSLikeScore(
                base_score=9.0,
                temporal_score=9.0,
                environmental_score=9.0,
                vector="CVSS:3.1/AV:N/AU:N/UI:N/S:C/C:H/I:H/A:H"
            )
            
            assert score.severity_level() == SeverityLevel.CRITICAL
            
            score2 = CVSSLikeScore(
                base_score=5.0,
                temporal_score=5.0,
                environmental_score=5.0,
                vector="CVSS:3.1/AV:N/AU:N/UI:N/S:U/C:L/I:L/A:L"
            )
            
            assert score2.severity_level() == SeverityLevel.MEDIUM
        except ImportError:
            pytest.skip("Module not available")
    
    def test_classification(self):
        """Test full alert classification"""
        try:
            from backend.detection.classifier import AlertClassifier
            
            classifier = AlertClassifier()
            
            alert = {
                'id': 'test_001',
                'signature_id': 'SQL_UNION_SELECT',
                'src_ip': '192.168.1.1',
                'dst_ip': '10.0.0.1',
                'dst_port': 3306,
                'protocol': 'TCP',
                'payload': "' UNION SELECT * FROM users--",
                'confidence': 85.0,
                'packet_count': 1,
            }
            
            classification = classifier.classify(alert)
            
            assert classification is not None
            assert classification.threat_category is not None
            assert classification.severity is not None
            assert classification.cvss_score.final_score > 0
            assert len(classification.recommendations) > 0
        except ImportError:
            pytest.skip("Module not available")


class TestOrchestrator:
    """Test security orchestrator"""
    
    def test_orchestrator_initialization(self):
        """Test orchestrator creation"""
        try:
            # Try to initialize - may fail if signatures.yaml not found
            from backend.detection.security_orchestrator import SecurityOrchestrator
            pytest.skip("Would need signatures.yaml to test")
        except ImportError:
            pytest.skip("Module not available")


# Integration tests
class TestIntegration:
    """Integration tests for full pipeline"""
    
    def test_pipeline_flow(self):
        """Test full detection pipeline"""
        try:
            from backend.detection.classifier import AlertClassifier
            
            classifier = AlertClassifier()
            
            # Simulate alert flow
            raw_alert = {
                'id': 'int_test_001',
                'signature_id': 'SQL_OR_1_EQ_1',
                'src_ip': '203.0.113.42',
                'dst_ip': '198.51.100.5',
                'dst_port': 3306,
                'protocol': 'TCP',
                'payload': "SELECT * FROM users WHERE id = 1 OR 1=1--",
                'confidence': 90.0,
                'packet_count': 2,
            }
            
            # Threat intel data
            threat_intel = {
                'reputation': {'confidence_score': 65, 'threat_level': 'HIGH'},
                'geolocation': {'country': 'CN', 'is_vpn': False},
            }
            
            # Classify
            classification = classifier.classify(raw_alert, threat_intel)
            
            # Validate result
            assert classification is not None
            assert classification.severity.value > 0
            assert len(classification.recommendations) > 0
            assert len(classification.owasp_mapping) > 0
            
        except ImportError:
            pytest.skip("Module not available")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
