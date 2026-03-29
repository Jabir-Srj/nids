"""
Unit tests for ML anomaly detection module
"""
import pytest
import numpy as np
import pandas as pd
from unittest.mock import patch, MagicMock
import time

class TestAnomalyDetector:
    """Test cases for AnomalyDetector"""
    
    def test_anomaly_detector_initialization(self):
        """Test AnomalyDetector initialization"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        assert detector is not None
        assert hasattr(detector, 'train')
        assert hasattr(detector, 'predict')
        assert hasattr(detector, 'save_model')
        assert hasattr(detector, 'load_model')
    
    def test_train_model(self):
        """Test model training"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        # Create training data
        X_train = np.random.randn(100, 10)  # 100 samples, 10 features
        
        # Train model
        detector.train(X_train)
        
        assert detector.model is not None
    
    def test_predict_normal_traffic(self):
        """Test prediction on normal traffic"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        # Train with normal data
        X_train = np.random.randn(100, 10)
        detector.train(X_train)
        
        # Predict on similar normal data
        X_test = np.random.randn(10, 10)
        predictions = detector.predict(X_test)
        
        assert len(predictions) == 10
        # Most should be normal (not anomalies)
        anomaly_rate = sum(predictions) / len(predictions)
        assert anomaly_rate < 0.3  # Less than 30% anomalies
    
    def test_predict_anomalous_traffic(self):
        """Test prediction on anomalous traffic"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        # Train with normal data
        X_train = np.random.randn(100, 10)
        detector.train(X_train)
        
        # Test with anomalous data (extreme values)
        X_test_anomaly = np.random.randn(10, 10) * 10  # Much larger values
        predictions = detector.predict(X_test_anomaly)
        
        assert len(predictions) == 10
        # Many should be anomalies
        anomaly_rate = sum(predictions) / len(predictions)
        assert anomaly_rate > 0.5  # More than 50% anomalies
    
    def test_model_persistence(self, temp_dir):
        """Test saving and loading model"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector1 = AnomalyDetector()
        X_train = np.random.randn(100, 10)
        detector1.train(X_train)
        
        model_path = str(temp_dir / 'model.pkl')
        detector1.save_model(model_path)
        
        # Load in new detector
        detector2 = AnomalyDetector()
        detector2.load_model(model_path)
        
        # Should make same predictions
        X_test = np.random.randn(10, 10)
        pred1 = detector1.predict(X_test)
        pred2 = detector2.predict(X_test)
        
        np.testing.assert_array_equal(pred1, pred2)
    
    def test_confidence_scoring(self):
        """Test confidence scores for predictions"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        X_train = np.random.randn(100, 10)
        detector.train(X_train)
        
        X_test = np.random.randn(10, 10)
        predictions, confidences = detector.predict_with_confidence(X_test)
        
        assert len(predictions) == len(confidences)
        assert all(0 <= c <= 1 for c in confidences)  # Confidence in [0, 1]
    
    def test_inference_performance(self):
        """Test inference performance"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        X_train = np.random.randn(100, 10)
        detector.train(X_train)
        
        X_test = np.random.randn(1000, 10)
        
        start = time.time()
        predictions = detector.predict(X_test)
        elapsed = time.time() - start
        
        # Should process 1000 samples in <100ms
        assert elapsed < 0.1, f"Inference too slow: {elapsed}s for 1000 samples"
    
    def test_handle_edge_cases(self):
        """Test handling of edge cases"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        # Test with single sample
        X_single = np.random.randn(1, 10)
        predictions = detector.predict(X_single)
        assert len(predictions) == 1
        
        # Test with NaN values
        X_nan = np.random.randn(10, 10)
        X_nan[0, 0] = np.nan
        
        # Should handle gracefully or raise appropriate error
        try:
            predictions = detector.predict(X_nan)
        except (ValueError, TypeError):
            pass  # Expected behavior

class TestFeatureEngineering:
    """Test cases for feature extraction"""
    
    def test_extract_traffic_features(self):
        """Test traffic feature extraction"""
        from ml.features import extract_traffic_features
        
        traffic_data = {
            'timestamp': '2026-03-29T10:00:00Z',
            'src_ip': '192.168.1.1',
            'packet_count': 100,
            'byte_count': 50000,
            'packets': [
                {'size': 100, 'protocol': 'TCP'},
                {'size': 200, 'protocol': 'TCP'},
                {'size': 150, 'protocol': 'UDP'},
            ]
        }
        
        features = extract_traffic_features(traffic_data)
        
        assert 'packet_rate' in features or 'traffic_volume' in features
        assert all(isinstance(v, (int, float)) for v in features.values())
    
    def test_extract_packet_features(self):
        """Test packet-level feature extraction"""
        from ml.features import extract_packet_features
        
        packet = {
            'src_ip': '192.168.1.1',
            'dst_ip': '192.168.1.2',
            'src_port': 12345,
            'dst_port': 80,
            'protocol': 'TCP',
            'flags': 'SYN',
            'payload_size': 1024,
            'payload': b'HTTP GET request'
        }
        
        features = extract_packet_features(packet)
        
        assert isinstance(features, dict)
        assert len(features) > 0
    
    def test_normalize_features(self):
        """Test feature normalization"""
        from ml.features import normalize_features
        
        features_raw = np.array([
            [1000, 50, 100],
            [2000, 100, 200],
            [500, 25, 50]
        ])
        
        features_normalized = normalize_features(features_raw)
        
        # Normalized features should be in [0, 1] or [-1, 1] range
        assert np.all(features_normalized >= -2)
        assert np.all(features_normalized <= 2)
    
    def test_protocol_distribution(self):
        """Test protocol distribution calculation"""
        from ml.features import calculate_protocol_distribution
        
        packets = [
            {'protocol': 'TCP'},
            {'protocol': 'TCP'},
            {'protocol': 'UDP'},
            {'protocol': 'ICMP'},
            {'protocol': 'TCP'},
        ]
        
        distribution = calculate_protocol_distribution(packets)
        
        assert distribution['TCP'] == 0.6
        assert distribution['UDP'] == 0.2
        assert distribution['ICMP'] == 0.2
    
    def test_port_entropy(self):
        """Test port entropy calculation"""
        from ml.features import calculate_port_entropy
        
        # Uniform distribution (high entropy)
        ports_high = list(range(80, 90))  # 10 different ports
        entropy_high = calculate_port_entropy(ports_high)
        
        # Low entropy (many same ports)
        ports_low = [80] * 10
        entropy_low = calculate_port_entropy(ports_low)
        
        assert entropy_high > entropy_low

class TestTrafficAnalyzer:
    """Test cases for traffic analysis"""
    
    def test_baseline_generation(self):
        """Test baseline traffic generation"""
        from ml.traffic_analyzer import TrafficAnalyzer
        
        analyzer = TrafficAnalyzer()
        
        # Create historical data
        historical_data = pd.DataFrame({
            'timestamp': pd.date_range('2026-03-28', periods=100, freq='H'),
            'packet_rate': np.random.normal(1000, 100, 100),
            'byte_rate': np.random.normal(500000, 50000, 100),
            'protocol_tcp': np.random.normal(0.7, 0.1, 100)
        })
        
        baseline = analyzer.build_baseline(historical_data)
        
        assert baseline is not None
        assert 'packet_rate' in baseline
    
    def test_deviation_detection(self):
        """Test traffic deviation detection"""
        from ml.traffic_analyzer import TrafficAnalyzer
        
        analyzer = TrafficAnalyzer()
        
        # Set baseline
        baseline = {
            'packet_rate': {'mean': 1000, 'std': 100},
            'byte_rate': {'mean': 500000, 'std': 50000}
        }
        analyzer.baseline = baseline
        
        # Normal traffic (within bounds)
        normal_traffic = {
            'packet_rate': 1050,
            'byte_rate': 510000
        }
        
        # Anomalous traffic (far from baseline)
        anomalous_traffic = {
            'packet_rate': 5000,
            'byte_rate': 2000000
        }
        
        score_normal = analyzer.detect_deviation(normal_traffic)
        score_anomalous = analyzer.detect_deviation(anomalous_traffic)
        
        assert score_anomalous > score_normal
    
    def test_trend_analysis(self):
        """Test traffic trend analysis"""
        from ml.traffic_analyzer import TrafficAnalyzer
        
        analyzer = TrafficAnalyzer()
        
        # Create time series data
        time_series = pd.DataFrame({
            'timestamp': pd.date_range('2026-03-20', periods=30, freq='D'),
            'alerts': [5, 6, 4, 7, 8, 10, 12, 15, 18, 20,
                      22, 25, 28, 30, 32, 35, 38, 40, 42, 45,
                      48, 50, 52, 55, 58, 60, 62, 65, 68, 70]
        })
        
        trends = analyzer.get_trends(time_series)
        
        assert 'direction' in trends  # Uptrend/downtrend
        assert 'strength' in trends  # Trend strength

class TestMLAccuracy:
    """Test cases for ML model accuracy"""
    
    def test_model_accuracy_on_normal_data(self):
        """Test model accuracy on normal data"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        # Train on normal data
        X_train = np.random.randn(200, 10)
        detector.train(X_train)
        
        # Test on more normal data
        X_test_normal = np.random.randn(50, 10)
        predictions = detector.predict(X_test_normal)
        
        # Should correctly identify as normal
        false_positive_rate = sum(predictions) / len(predictions)
        assert false_positive_rate < 0.05  # <5% false positives
    
    def test_model_accuracy_on_anomalies(self):
        """Test model accuracy on anomalous data"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        # Train on normal data
        X_train = np.random.randn(200, 10)
        detector.train(X_train)
        
        # Create anomalies (extreme values)
        X_test_anomaly = np.random.randn(50, 10) + np.array([10] * 10)
        predictions = detector.predict(X_test_anomaly)
        
        # Should correctly identify as anomalies
        detection_rate = sum(predictions) / len(predictions)
        assert detection_rate > 0.8  # >80% detection rate
    
    def test_model_robustness(self):
        """Test model robustness to noisy data"""
        from ml.anomaly_detector import AnomalyDetector
        
        detector = AnomalyDetector()
        
        X_train = np.random.randn(200, 10)
        detector.train(X_train)
        
        # Add noise to test data
        X_test = np.random.randn(50, 10)
        X_test += np.random.normal(0, 0.1, X_test.shape)  # Add small noise
        
        predictions = detector.predict(X_test)
        
        # Model should still work despite noise
        assert len(predictions) == 50
        assert all(p in [0, 1] for p in predictions)
