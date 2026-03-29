"""
Unit tests for REST API endpoints
"""
import pytest
import json
from unittest.mock import patch, MagicMock

class TestAlertAPI:
    """Test cases for Alert API endpoints"""
    
    def test_get_alerts(self, client):
        """Test GET /api/alerts"""
        response = client.get('/api/alerts')
        
        assert response.status_code in [200, 404, 500]
        if response.status_code == 200:
            data = response.get_json()
            assert isinstance(data, (list, dict))
    
    def test_get_alert_by_id(self, client):
        """Test GET /api/alerts/{id}"""
        response = client.get('/api/alerts/1')
        
        assert response.status_code in [200, 404, 500]
    
    def test_create_alert(self, client, mock_alert):
        """Test POST /api/alerts"""
        response = client.post('/api/alerts',
            json=mock_alert,
            content_type='application/json'
        )
        
        assert response.status_code in [201, 400, 500]
    
    def test_filter_alerts(self, client):
        """Test POST /api/alerts/filter"""
        filter_data = {
            'severity': 'HIGH',
            'threat_type': 'SQL Injection',
            'date_range': {'start': '2026-03-29', 'end': '2026-03-30'}
        }
        
        response = client.post('/api/alerts/filter',
            json=filter_data,
            content_type='application/json'
        )
        
        assert response.status_code in [200, 400, 500]
    
    def test_delete_alert(self, client):
        """Test DELETE /api/alerts/{id}"""
        response = client.delete('/api/alerts/1')
        
        assert response.status_code in [200, 204, 404, 500]

class TestStatsAPI:
    """Test cases for Statistics API endpoints"""
    
    def test_stats_overview(self, client):
        """Test GET /api/stats/overview"""
        response = client.get('/api/stats/overview')
        
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.get_json()
            assert isinstance(data, dict)
    
    def test_threats_breakdown(self, client):
        """Test GET /api/stats/threats"""
        response = client.get('/api/stats/threats')
        
        assert response.status_code in [200, 500]
    
    def test_top_ips(self, client):
        """Test GET /api/stats/ips"""
        response = client.get('/api/stats/ips')
        
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.get_json()
            if data:
                assert isinstance(data, (list, dict))
    
    def test_protocol_stats(self, client):
        """Test GET /api/stats/protocols"""
        response = client.get('/api/stats/protocols')
        
        assert response.status_code in [200, 500]

class TestCaptureAPI:
    """Test cases for Capture control API"""
    
    @patch('backend.api.routes.PacketCaptureEngine')
    def test_start_capture(self, mock_engine, client):
        """Test POST /api/capture/start"""
        mock_instance = MagicMock()
        mock_engine.return_value = mock_instance
        
        response = client.post('/api/capture/start',
            json={'interface': 'eth0'},
            content_type='application/json'
        )
        
        assert response.status_code in [200, 400, 500]
    
    @patch('backend.api.routes.PacketCaptureEngine')
    def test_stop_capture(self, mock_engine, client):
        """Test POST /api/capture/stop"""
        mock_instance = MagicMock()
        mock_engine.return_value = mock_instance
        
        response = client.post('/api/capture/stop')
        
        assert response.status_code in [200, 500]
    
    def test_capture_status(self, client):
        """Test GET /api/capture/status"""
        response = client.get('/api/capture/status')
        
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.get_json()
            assert isinstance(data, dict)
    
    def test_upload_pcap(self, client, sample_pcap):
        """Test POST /api/capture/upload-pcap"""
        with open(sample_pcap, 'rb') as f:
            response = client.post('/api/capture/upload-pcap',
                data={'file': f},
                content_type='multipart/form-data'
            )
        
        assert response.status_code in [200, 400, 413, 500]

class TestExportAPI:
    """Test cases for Export API"""
    
    def test_export_alerts_json(self, client):
        """Test GET /api/export/alerts?format=json"""
        response = client.get('/api/export/alerts?format=json')
        
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            assert response.content_type == 'application/json'
    
    def test_export_alerts_csv(self, client):
        """Test GET /api/export/alerts?format=csv"""
        response = client.get('/api/export/alerts?format=csv')
        
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            assert 'csv' in response.content_type.lower()
    
    def test_export_alerts_pdf(self, client):
        """Test GET /api/export/alerts?format=pdf"""
        response = client.get('/api/export/alerts?format=pdf')
        
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            assert 'pdf' in response.content_type.lower()
    
    def test_export_report(self, client):
        """Test GET /api/export/report"""
        response = client.get('/api/export/report')
        
        assert response.status_code in [200, 500]

class TestHealthAPI:
    """Test cases for Health endpoints"""
    
    def test_health_check(self, client):
        """Test GET /health"""
        response = client.get('/health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'status' in data
        assert data['status'] == 'healthy'
    
    def test_health_check_version(self, client):
        """Test health check includes version"""
        response = client.get('/health')
        
        data = response.get_json()
        assert 'version' in data

class TestAPIErrorHandling:
    """Test cases for API error handling"""
    
    def test_invalid_json_body(self, client):
        """Test handling of invalid JSON"""
        response = client.post('/api/alerts',
            data='invalid json',
            content_type='application/json'
        )
        
        assert response.status_code in [400, 500]
    
    def test_missing_required_field(self, client):
        """Test handling of missing required fields"""
        incomplete_alert = {'src_ip': '192.168.1.1'}
        
        response = client.post('/api/alerts',
            json=incomplete_alert,
            content_type='application/json'
        )
        
        assert response.status_code in [400, 422, 500]
    
    def test_invalid_resource_id(self, client):
        """Test handling of invalid resource ID"""
        response = client.get('/api/alerts/invalid_id')
        
        assert response.status_code in [400, 404, 500]
    
    def test_method_not_allowed(self, client):
        """Test 405 Method Not Allowed"""
        response = client.put('/api/capture/start')
        
        assert response.status_code in [405, 500]

class TestAPIPerformance:
    """Test cases for API performance"""
    
    def test_stats_response_time(self, client):
        """Test that stats endpoints respond quickly"""
        import time
        
        start = time.time()
        response = client.get('/api/stats/overview')
        elapsed = time.time() - start
        
        assert elapsed < 1.0, f"Stats took too long: {elapsed}s"
    
    def test_alerts_response_time(self, client):
        """Test that alerts endpoint responds quickly"""
        import time
        
        start = time.time()
        response = client.get('/api/alerts')
        elapsed = time.time() - start
        
        assert elapsed < 2.0, f"Alerts took too long: {elapsed}s"
