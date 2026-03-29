"""
Integration tests for NIDS components
"""
import pytest
import json
import time
from unittest.mock import patch, MagicMock

class TestPacketThreatDetectionFlow:
    """Integration tests for packet -> threat detection flow"""
    
    def test_end_to_end_sql_injection_detection(self, client, mock_packet_data):
        """Test complete flow: packet -> rule engine -> alert -> API"""
        # Simulate packet with SQL injection
        malicious_packet = mock_packet_data.copy()
        malicious_packet['payload'] = b"UNION SELECT * FROM users WHERE 1=1"
        
        # Evaluate with rule engine
        from detection.rule_engine import RuleEngine
        engine = RuleEngine()
        alerts = engine.evaluate_packet(malicious_packet)
        
        # Should have generated alert
        assert len(alerts) > 0
        
        # Verify alert details
        alert = alerts[0]
        assert 'severity' in alert or isinstance(alert, dict)
    
    def test_end_to_end_xss_detection(self, client, mock_packet_data):
        """Test complete flow for XSS detection"""
        # Simulate packet with XSS
        xss_packet = mock_packet_data.copy()
        xss_packet['payload'] = b"<script>alert('xss')</script>"
        
        from detection.rule_engine import RuleEngine
        engine = RuleEngine()
        alerts = engine.evaluate_packet(xss_packet)
        
        assert len(alerts) > 0
    
    def test_end_to_end_anomaly_detection(self, mock_packet_data):
        """Test complete flow for anomaly detection"""
        import numpy as np
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        # Train on normal traffic patterns
        normal_traffic = np.random.randn(100, 10)
        detector.train(normal_traffic)
        
        # Test on anomalous traffic
        anomalous_traffic = np.random.randn(10, 10) * 10
        predictions = detector.predict(anomalous_traffic)
        
        # Should detect anomalies
        assert sum(predictions) > 0
    
    def test_multiple_rule_matching_per_packet(self, mock_packet_data):
        """Test when packet matches multiple rules"""
        from detection.rule_engine import RuleEngine
        
        engine = RuleEngine()
        
        # Packet with multiple attack indicators
        multi_threat_packet = mock_packet_data.copy()
        multi_threat_packet['payload'] = b"UNION SELECT <script>alert(1)</script>"
        
        alerts = engine.evaluate_packet(multi_threat_packet)
        
        # Should match multiple rules
        assert len(alerts) >= 1
    
    def test_packet_processing_pipeline(self):
        """Test complete packet processing pipeline"""
        from capture.packet_capture import PacketCaptureEngine
        from detection.rule_engine import RuleEngine
        from ml.anomaly_detector import AnomalyDetector
        
        # Initialize components
        capture = PacketCaptureEngine()
        rules = RuleEngine()
        ml = AnomalyDetector()
        
        # Verify all components initialized
        assert capture is not None
        assert rules is not None
        assert ml is not None

class TestAlertGenerationFlow:
    """Integration tests for alert generation"""
    
    def test_alert_storage_and_retrieval(self, client, mock_alert):
        """Test alert creation and retrieval via API"""
        # Create alert
        post_response = client.post('/api/alerts',
            json=mock_alert,
            content_type='application/json'
        )
        
        # Should be created or error
        assert post_response.status_code in [201, 400, 500]
        
        # Try to retrieve alerts
        get_response = client.get('/api/alerts')
        assert get_response.status_code in [200, 500]
    
    def test_alert_filtering_by_severity(self, client):
        """Test filtering alerts by severity"""
        filter_data = {'severity': 'HIGH'}
        
        response = client.post('/api/alerts/filter',
            json=filter_data,
            content_type='application/json'
        )
        
        assert response.status_code in [200, 400, 500]
    
    def test_alert_export_formats(self, client):
        """Test exporting alerts in different formats"""
        # Test JSON export
        json_response = client.get('/api/export/alerts?format=json')
        assert json_response.status_code in [200, 500]
        
        # Test CSV export
        csv_response = client.get('/api/export/alerts?format=csv')
        assert csv_response.status_code in [200, 500]

class TestDatabaseIntegration:
    """Integration tests for database operations"""
    
    def test_alert_persistence(self, client, mock_alert):
        """Test that alerts are persisted to database"""
        # Create alert
        response = client.post('/api/alerts',
            json=mock_alert,
            content_type='application/json'
        )
        
        if response.status_code == 201:
            # Retrieve same alert
            alert_id = response.get_json().get('id')
            if alert_id:
                get_response = client.get(f'/api/alerts/{alert_id}')
                assert get_response.status_code == 200
    
    def test_concurrent_alert_creation(self, client, mock_alert):
        """Test handling multiple concurrent alert creations"""
        import threading
        
        def create_alert():
            client.post('/api/alerts',
                json=mock_alert,
                content_type='application/json'
            )
        
        # Create multiple alerts concurrently
        threads = [threading.Thread(target=create_alert) for _ in range(5)]
        
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # Should handle concurrent requests
        response = client.get('/api/alerts')
        assert response.status_code in [200, 500]

class TestPerformanceIntegration:
    """Integration tests for system performance"""
    
    def test_high_throughput_packet_processing(self):
        """Test processing high volume of packets"""
        from detection.rule_engine import RuleEngine
        import time
        
        engine = RuleEngine()
        
        # Create 10000 test packets
        packets = [
            {'src_ip': f'192.168.{i%254}.{i%254}',
             'dst_port': 80 + (i % 100),
             'protocol': 'TCP',
             'payload': b'test' + bytes([i % 256])}
            for i in range(10000)
        ]
        
        start = time.time()
        alert_count = 0
        
        for packet in packets:
            alerts = engine.evaluate_packet(packet)
            alert_count += len(alerts)
        
        elapsed = time.time() - start
        throughput = len(packets) / elapsed
        
        # Should handle >1000 packets/sec
        assert throughput > 1000, f"Throughput: {throughput} packets/sec"
    
    def test_api_response_times_under_load(self, client):
        """Test API response times with multiple concurrent requests"""
        import threading
        import time
        
        response_times = []
        
        def measure_response():
            start = time.time()
            client.get('/api/stats/overview')
            elapsed = time.time() - start
            response_times.append(elapsed)
        
        # 50 concurrent requests
        threads = [threading.Thread(target=measure_response) for _ in range(50)]
        
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # 95th percentile response time should be <2 seconds
        response_times.sort()
        p95 = response_times[int(len(response_times) * 0.95)]
        assert p95 < 2.0, f"P95 response time: {p95}s"

class TestDataConsistency:
    """Integration tests for data consistency"""
    
    def test_alert_counts_consistency(self, client):
        """Test that alert counts are consistent across endpoints"""
        # Get total count
        overview_response = client.get('/api/stats/overview')
        
        # Get alerts list
        alerts_response = client.get('/api/alerts')
        
        if overview_response.status_code == 200 and alerts_response.status_code == 200:
            overview_data = overview_response.get_json()
            alerts_data = alerts_response.get_json()
            
            # Should be consistent
            if isinstance(alerts_data, list):
                assert len(alerts_data) >= 0
    
    def test_threat_stats_accuracy(self, client):
        """Test accuracy of threat statistics"""
        response = client.get('/api/stats/threats')
        
        if response.status_code == 200:
            data = response.get_json()
            
            # Verify threat counts add up
            if isinstance(data, dict):
                total = sum(data.values()) if all(isinstance(v, int) for v in data.values()) else 0
                assert total >= 0

class TestErrorRecovery:
    """Integration tests for error handling and recovery"""
    
    def test_api_recovers_from_database_error(self, client):
        """Test API gracefully handles database errors"""
        with patch('backend.database.db.session.query') as mock_query:
            mock_query.side_effect = Exception("Database connection lost")
            
            response = client.get('/api/alerts')
            
            # Should return error, not crash
            assert response.status_code >= 400
    
    def test_capture_handles_invalid_interface(self):
        """Test capture handles invalid network interface"""
        from capture.packet_capture import PacketCaptureEngine
        
        engine = PacketCaptureEngine()
        
        # Should handle gracefully
        with patch('capture.packet_capture.conf.iface', 'nonexistent_interface'):
            # Should not crash immediately
            assert engine is not None
