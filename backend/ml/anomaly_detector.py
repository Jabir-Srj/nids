"""
NIDS ML Anomaly Detector
Machine learning-based anomaly detection using Isolation Forest
"""

import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import pickle
from pathlib import Path

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

class FeatureExtractor:
    """Extract behavioral features from packets"""
    
    def __init__(self, window_size: int = 60):
        """
        Initialize feature extractor
        
        Args:
            window_size: Time window in seconds for aggregation
        """
        self.window_size = window_size
        self.packet_history = []

    def extract_features(self, packets: List[Any]) -> Dict[str, float]:
        """
        Extract behavioral features from packet list
        
        Args:
            packets: List of Packet objects
            
        Returns:
            Dict of feature_name: feature_value
        """
        if not packets:
            return self._zero_features()
        
        features = {}
        df = pd.DataFrame([{
            'src_ip': p.src_ip,
            'dst_ip': p.dst_ip,
            'src_port': p.src_port,
            'dst_port': p.dst_port,
            'protocol': p.protocol,
            'packet_size': p.packet_size,
            'timestamp': p.timestamp,
        } for p in packets])
        
        # 1. Traffic volume (bytes/sec)
        total_bytes = sum(p.packet_size for p in packets)
        time_span = (packets[-1].timestamp - packets[0].timestamp).total_seconds()
        features['traffic_volume'] = total_bytes / max(time_span, 1)
        
        # 2. Packet rate (packets/sec)
        features['packet_rate'] = len(packets) / max(time_span, 1)
        
        # 3. Unique source IPs
        features['unique_src_ips'] = df['src_ip'].nunique()
        
        # 4. Unique destination IPs
        features['unique_dst_ips'] = df['dst_ip'].nunique()
        
        # 5. Protocol distribution
        protocol_counts = df['protocol'].value_counts()
        features['tcp_ratio'] = protocol_counts.get('TCP', 0) / len(packets)
        features['udp_ratio'] = protocol_counts.get('UDP', 0) / len(packets)
        features['icmp_ratio'] = protocol_counts.get('ICMP', 0) / len(packets)
        
        # 6. Port entropy (indicates scanning)
        dst_ports = df['dst_port'].value_counts()
        port_entropy = -sum((dst_ports / len(packets)) * np.log2(dst_ports / len(packets)))
        features['port_entropy'] = port_entropy if not np.isnan(port_entropy) else 0
        
        # 7. Packet size statistics
        packet_sizes = df['packet_size'].values
        features['mean_packet_size'] = np.mean(packet_sizes)
        features['std_packet_size'] = np.std(packet_sizes)
        features['max_packet_size'] = np.max(packet_sizes)
        features['min_packet_size'] = np.min(packet_sizes)
        
        # 8. Unique source ports
        features['unique_src_ports'] = df['src_port'].nunique()
        
        # 9. Unique destination ports
        features['unique_dst_ports'] = df['dst_port'].nunique()
        
        # 10. Connection density
        connections = len(df.groupby(['src_ip', 'dst_ip']))
        features['connection_density'] = connections / max(len(packets), 1)
        
        # 11-15. Inter-arrival time statistics
        if len(packets) > 1:
            timestamps = sorted([p.timestamp for p in packets])
            inter_arrivals = [
                (timestamps[i+1] - timestamps[i]).total_seconds()
                for i in range(len(timestamps) - 1)
            ]
            if inter_arrivals:
                features['mean_inter_arrival'] = np.mean(inter_arrivals)
                features['std_inter_arrival'] = np.std(inter_arrivals)
                features['min_inter_arrival'] = np.min(inter_arrivals)
                features['max_inter_arrival'] = np.max(inter_arrivals)
            else:
                features.update({
                    'mean_inter_arrival': 0,
                    'std_inter_arrival': 0,
                    'min_inter_arrival': 0,
                    'max_inter_arrival': 0,
                })
        else:
            features.update({
                'mean_inter_arrival': 0,
                'std_inter_arrival': 0,
                'min_inter_arrival': 0,
                'max_inter_arrival': 0,
            })
        
        return features

    def _zero_features(self) -> Dict[str, float]:
        """Return zero feature vector"""
        return {
            'traffic_volume': 0,
            'packet_rate': 0,
            'unique_src_ips': 0,
            'unique_dst_ips': 0,
            'tcp_ratio': 0,
            'udp_ratio': 0,
            'icmp_ratio': 0,
            'port_entropy': 0,
            'mean_packet_size': 0,
            'std_packet_size': 0,
            'max_packet_size': 0,
            'min_packet_size': 0,
            'unique_src_ports': 0,
            'unique_dst_ports': 0,
            'connection_density': 0,
            'mean_inter_arrival': 0,
            'std_inter_arrival': 0,
            'min_inter_arrival': 0,
            'max_inter_arrival': 0,
        }


class AnomalyDetector:
    """
    ML-based anomaly detection using Isolation Forest
    Unsupervised learning - no training labels needed
    """
    
    FEATURE_NAMES = [
        'traffic_volume', 'packet_rate', 'unique_src_ips', 'unique_dst_ips',
        'tcp_ratio', 'udp_ratio', 'icmp_ratio', 'port_entropy',
        'mean_packet_size', 'std_packet_size', 'max_packet_size', 'min_packet_size',
        'unique_src_ports', 'unique_dst_ports', 'connection_density',
        'mean_inter_arrival', 'std_inter_arrival', 'min_inter_arrival', 'max_inter_arrival'
    ]
    
    def __init__(self, contamination: float = 0.1, random_state: int = 42):
        """
        Initialize anomaly detector
        
        Args:
            contamination: Expected proportion of anomalies (0.0-1.0)
            random_state: Random seed for reproducibility
        """
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_extractor = FeatureExtractor()
        logger.info(f"✅ AnomalyDetector initialized (contamination={contamination})")

    def train(self, training_data: pd.DataFrame) -> bool:
        """
        Train anomaly detection model
        
        Args:
            training_data: DataFrame with feature columns
            
        Returns:
            True if training successful
        """
        try:
            if len(training_data) < 10:
                logger.warning("Insufficient training data (min 10 samples)")
                return False
            
            # Extract features
            X = training_data[self.FEATURE_NAMES].values
            
            # Remove infinite/NaN values
            X = np.nan_to_num(X, nan=0, posinf=0, neginf=0)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled)
            self.is_trained = True
            
            logger.info(f"✅ Model trained on {len(training_data)} samples")
            return True
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return False

    def predict(self, features: Dict[str, float]) -> Tuple[bool, float]:
        """
        Predict if sample is anomalous
        
        Args:
            features: Feature dictionary from feature_extractor
            
        Returns:
            (is_anomaly, confidence) - confidence in range [0, 1]
        """
        if not self.is_trained:
            logger.warning("Model not trained yet")
            return False, 0.0
        
        try:
            # Convert to array
            X = np.array([[features.get(f, 0) for f in self.FEATURE_NAMES]])
            
            # Remove infinite/NaN values
            X = np.nan_to_num(X, nan=0, posinf=0, neginf=0)
            
            # Scale
            X_scaled = self.scaler.transform(X)
            
            # Predict
            prediction = self.model.predict(X_scaled)[0]
            score = self.model.score_samples(X_scaled)[0]
            
            # Normalize score to [0, 1] confidence
            # score ranges from -1 (anomaly) to 0 (normal)
            confidence = max(0, min(1, (score + 1) / 2))
            
            is_anomaly = prediction == -1
            
            return is_anomaly, confidence
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return False, 0.0

    def save_model(self, model_path: str, scaler_path: str) -> bool:
        """Save trained model and scaler"""
        try:
            Path(model_path).parent.mkdir(parents=True, exist_ok=True)
            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)
            with open(scaler_path, 'wb') as f:
                pickle.dump(self.scaler, f)
            logger.info(f"✅ Model saved to {model_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
            return False

    def load_model(self, model_path: str, scaler_path: str) -> bool:
        """Load pre-trained model and scaler"""
        try:
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            self.is_trained = True
            logger.info(f"✅ Model loaded from {model_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False

    def get_stats(self) -> Dict[str, Any]:
        """Get model statistics"""
        return {
            'is_trained': self.is_trained,
            'contamination': self.contamination,
            'n_features': len(self.FEATURE_NAMES),
            'feature_names': self.FEATURE_NAMES,
        }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Example usage
    extractor = FeatureExtractor()
    detector = AnomalyDetector()
    
    # Dummy features for testing
    dummy_features = extractor._zero_features()
    is_anomaly, confidence = detector.predict(dummy_features)
    
    print(f"Anomaly: {is_anomaly}, Confidence: {confidence:.2f}")
    print("✅ AnomalyDetector ready!")
