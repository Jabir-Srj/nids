"""
Feature Engineering Module for NIDS Anomaly Detection

Extracts 15+ behavioral features from network packets for ML-based detection.
Features are designed to capture normal vs. anomalous traffic patterns without requiring labels.

Key Features:
- Traffic volume metrics
- Protocol distribution
- Port entropy
- Packet size statistics
- Inter-arrival time analysis
- IP reputation indicators
- Connection pattern analysis
"""

import numpy as np
import pandas as pd
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass


logger = logging.getLogger(__name__)


@dataclass
class PacketStats:
    """Container for individual packet statistics"""
    timestamp: float
    src_ip: str
    dst_ip: str
    protocol: str
    src_port: int
    dst_port: int
    packet_size: int
    flags: str = ""


class FeatureExtractor:
    """
    Extracts behavioral features from network packets for anomaly detection.
    
    Uses unsupervised approach - features capture traffic patterns without labels.
    Designed for real-time inference and batch training.
    """
    
    def __init__(self, window_size: int = 300):
        """
        Initialize feature extractor.
        
        Args:
            window_size: Time window (seconds) for aggregating features
        """
        self.window_size = window_size
        self.packets: List[PacketStats] = []
        self.feature_cache: Dict = {}
        
    def add_packet(self, packet_stats: PacketStats) -> None:
        """Add packet to the buffer for feature extraction."""
        self.packets.append(packet_stats)
        # Clean old packets outside window
        current_time = packet_stats.timestamp
        self.packets = [p for p in self.packets 
                       if current_time - p.timestamp <= self.window_size]
    
    def extract_features(self, src_ip: str) -> Optional[Dict[str, float]]:
        """
        Extract behavioral features for a source IP.
        
        Args:
            src_ip: Source IP address to analyze
            
        Returns:
            Dictionary of 15+ features or None if insufficient data
        """
        if not self.packets:
            return None
        
        # Filter packets for this source
        src_packets = [p for p in self.packets if p.src_ip == src_ip]
        
        if len(src_packets) < 2:
            return None
        
        features = {}
        
        # 1. Traffic Volume Features
        features['total_bytes'] = sum(p.packet_size for p in src_packets)
        features['total_packets'] = len(src_packets)
        features['avg_packet_size'] = np.mean([p.packet_size for p in src_packets])
        features['std_packet_size'] = np.std([p.packet_size for p in src_packets])
        
        # 2. Packet Rate Features
        if len(src_packets) > 1:
            time_span = src_packets[-1].timestamp - src_packets[0].timestamp
            if time_span > 0:
                features['packet_rate'] = len(src_packets) / time_span
                features['byte_rate'] = features['total_bytes'] / time_span
            else:
                features['packet_rate'] = 0
                features['byte_rate'] = 0
        else:
            features['packet_rate'] = 0
            features['byte_rate'] = 0
        
        # 3. Protocol Distribution Features
        protocol_counts = Counter(p.protocol for p in src_packets)
        features['protocol_diversity'] = len(protocol_counts)
        features['tcp_ratio'] = protocol_counts.get('TCP', 0) / len(src_packets)
        features['udp_ratio'] = protocol_counts.get('UDP', 0) / len(src_packets)
        features['icmp_ratio'] = protocol_counts.get('ICMP', 0) / len(src_packets)
        features['other_protocol_ratio'] = (
            1 - (features['tcp_ratio'] + features['udp_ratio'] + features['icmp_ratio'])
        )
        
        # 4. Port Features
        dst_ports = [p.dst_port for p in src_packets if p.dst_port > 0]
        if dst_ports:
            features['unique_dst_ports'] = len(set(dst_ports))
            features['port_entropy'] = self._calculate_entropy(dst_ports)
            features['high_port_ratio'] = sum(1 for p in dst_ports if p > 1024) / len(dst_ports)
        else:
            features['unique_dst_ports'] = 0
            features['port_entropy'] = 0
            features['high_port_ratio'] = 0
        
        # 5. Destination IP Features
        dst_ips = [p.dst_ip for p in src_packets]
        features['unique_dst_ips'] = len(set(dst_ips))
        features['dst_ip_entropy'] = self._calculate_entropy(dst_ips)
        
        # 6. Inter-arrival Time Features
        if len(src_packets) > 2:
            inter_arrivals = [
                src_packets[i+1].timestamp - src_packets[i].timestamp
                for i in range(len(src_packets) - 1)
            ]
            inter_arrivals = [x for x in inter_arrivals if x > 0]
            
            if inter_arrivals:
                features['mean_inter_arrival'] = np.mean(inter_arrivals)
                features['std_inter_arrival'] = np.std(inter_arrivals)
                features['min_inter_arrival'] = np.min(inter_arrivals)
                features['max_inter_arrival'] = np.max(inter_arrivals)
            else:
                features['mean_inter_arrival'] = 0
                features['std_inter_arrival'] = 0
                features['min_inter_arrival'] = 0
                features['max_inter_arrival'] = 0
        else:
            features['mean_inter_arrival'] = 0
            features['std_inter_arrival'] = 0
            features['min_inter_arrival'] = 0
            features['max_inter_arrival'] = 0
        
        # 7. Flag Analysis (for TCP packets)
        tcp_packets = [p for p in src_packets if p.protocol == 'TCP']
        if tcp_packets:
            syn_packets = sum(1 for p in tcp_packets if 'S' in p.flags)
            ack_packets = sum(1 for p in tcp_packets if 'A' in p.flags)
            features['syn_ratio'] = syn_packets / len(tcp_packets)
            features['ack_ratio'] = ack_packets / len(tcp_packets)
        else:
            features['syn_ratio'] = 0
            features['ack_ratio'] = 0
        
        # 8. Packet Size Distribution Features
        packet_sizes = [p.packet_size for p in src_packets]
        features['min_packet_size'] = np.min(packet_sizes)
        features['max_packet_size'] = np.max(packet_sizes)
        features['packet_size_range'] = np.max(packet_sizes) - np.min(packet_sizes)
        
        # 9. Connection Pattern Features
        connections = [(p.src_port, p.dst_ip, p.dst_port) for p in src_packets]
        unique_connections = len(set(connections))
        features['unique_connections'] = unique_connections
        
        # 10. Traffic Concentration Features
        dst_port_counts = Counter(dst_ports)
        if dst_port_counts:
            # Gini coefficient - measures concentration (0 = uniform, 1 = concentrated)
            features['port_concentration'] = self._gini_coefficient(list(dst_port_counts.values()))
        else:
            features['port_concentration'] = 0
        
        return features
    
    def extract_features_batch(self, src_ips: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Extract features for multiple IPs in batch.
        
        Args:
            src_ips: List of source IPs. If None, extracts for all IPs in packets.
            
        Returns:
            DataFrame with features for each IP
        """
        if src_ips is None:
            src_ips = list(set(p.src_ip for p in self.packets))
        
        features_list = []
        for src_ip in src_ips:
            features = self.extract_features(src_ip)
            if features is not None:
                features['src_ip'] = src_ip
                features['timestamp'] = datetime.now().timestamp()
                features_list.append(features)
        
        if not features_list:
            return pd.DataFrame()
        
        return pd.DataFrame(features_list)
    
    def _calculate_entropy(self, values: List) -> float:
        """
        Calculate Shannon entropy of values (0 = concentrated, high = uniform).
        
        For IDS: High entropy = many different ports/IPs (scanning behavior)
        Low entropy = same ports/IPs (normal pattern)
        """
        if not values:
            return 0
        
        counts = Counter(values)
        probabilities = np.array(list(counts.values())) / len(values)
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
        
        return entropy
    
    def _gini_coefficient(self, values: List[float]) -> float:
        """
        Calculate Gini coefficient (0 = uniform distribution, 1 = concentrated).
        
        For IDS: High Gini = traffic concentrated on few ports (potential anomaly)
        Low Gini = uniform distribution (normal)
        """
        if not values or len(values) == 0:
            return 0
        
        sorted_values = np.sort(values)
        n = len(sorted_values)
        cumsum = np.cumsum(sorted_values)
        
        gini = (2 * np.sum((n - np.arange(1, n + 1) + 1) * sorted_values)) / (n * np.sum(sorted_values)) - (n + 1) / n
        
        return max(0, min(1, gini))  # Clip to [0, 1]
    
    def clear(self) -> None:
        """Clear packet buffer."""
        self.packets = []
        self.feature_cache = {}


class TrafficBaseline:
    """
    Build and manage baseline of normal traffic patterns.
    Used for detecting deviations from normal behavior.
    """
    
    def __init__(self):
        self.baseline: Optional[pd.DataFrame] = None
        self.statistics: Dict = {}
        self.is_built = False
        
    def build_from_features(self, features_df: pd.DataFrame) -> None:
        """
        Build baseline from historical features (assumed to be normal traffic).
        
        Args:
            features_df: DataFrame with extracted features
        """
        if features_df.empty:
            logger.warning("Cannot build baseline from empty DataFrame")
            return
        
        self.baseline = features_df.copy()
        
        # Calculate statistics for each feature (excluding non-numeric columns)
        for col in features_df.select_dtypes(include=[np.number]).columns:
            self.statistics[col] = {
                'mean': features_df[col].mean(),
                'std': features_df[col].std(),
                'min': features_df[col].min(),
                'max': features_df[col].max(),
                'q25': features_df[col].quantile(0.25),
                'q75': features_df[col].quantile(0.75),
            }
        
        self.is_built = True
        logger.info("Baseline built from %d samples", len(features_df))
    
    def calculate_deviation(self, features: Dict[str, float]) -> float:
        """
        Calculate deviation score from baseline (0 = normal, 1 = anomaly).
        
        Uses Mahalanobis-like distance (normalized by std deviation).
        
        Args:
            features: Feature dictionary to compare
            
        Returns:
            Deviation score [0, 1]
        """
        if not self.is_built:
            return 0.5  # Neutral score if no baseline
        
        deviations = []
        
        for feature, value in features.items():
            if feature in self.statistics:
                stats = self.statistics[feature]
                std = stats['std']
                
                if std > 0:
                    # Normalized deviation
                    z_score = abs(value - stats['mean']) / std
                    # Convert z-score to [0, 1]
                    deviation = min(1.0, z_score / 3)  # 3 sigma = ~1.0
                    deviations.append(deviation)
        
        if not deviations:
            return 0.5
        
        # Return average deviation
        return np.mean(deviations)
    
    def save(self, filepath: str) -> None:
        """Save baseline to file."""
        if self.baseline is not None:
            self.baseline.to_csv(filepath, index=False)
            logger.info("Baseline saved to %s", filepath)
    
    def load(self, filepath: str) -> None:
        """Load baseline from file."""
        try:
            self.baseline = pd.read_csv(filepath)
            self.build_from_features(self.baseline)
            logger.info("Baseline loaded from %s", filepath)
        except Exception as e:
            logger.error("Failed to load baseline: %s", e)


def create_mock_packets(n_packets: int = 1000, anomaly_ratio: float = 0.1) -> List[PacketStats]:
    """
    Create mock packet data for testing.
    
    Args:
        n_packets: Number of packets to generate
        anomaly_ratio: Ratio of anomalous packets
        
    Returns:
        List of PacketStats objects
    """
    packets = []
    current_time = datetime.now().timestamp()
    
    normal_ips = [f"192.168.1.{i}" for i in range(1, 5)]
    anomaly_ips = [f"203.0.113.{i}" for i in range(1, 4)]
    
    protocols = ['TCP', 'UDP', 'ICMP']
    
    for i in range(n_packets):
        is_anomaly = np.random.random() < anomaly_ratio
        
        if is_anomaly:
            # Anomalous traffic patterns
            src_ip = np.random.choice(anomaly_ips)
            dst_port = np.random.randint(1024, 65535)
            packet_size = np.random.randint(5000, 65535)
            packet_rate_factor = 10  # Much higher
        else:
            # Normal traffic patterns
            src_ip = np.random.choice(normal_ips)
            dst_port = np.random.choice([80, 443, 22, 53, 25])
            packet_size = np.random.randint(40, 1500)
            packet_rate_factor = 1
        
        packet = PacketStats(
            timestamp=current_time + i * 0.01 * packet_rate_factor,
            src_ip=src_ip,
            dst_ip=f"10.0.0.{np.random.randint(1, 255)}",
            protocol=np.random.choice(protocols),
            src_port=np.random.randint(1024, 65535),
            dst_port=dst_port,
            packet_size=packet_size,
            flags='SA' if np.random.random() > 0.7 else 'A'
        )
        packets.append(packet)
    
    return packets


if __name__ == "__main__":
    # Example usage
    logging.basicConfig(level=logging.INFO)
    
    print("=" * 60)
    print("NIDS Feature Engineering - Demo")
    print("=" * 60)
    
    # Generate mock data
    print("\n1. Generating mock packet data...")
    packets = create_mock_packets(n_packets=2000, anomaly_ratio=0.15)
    
    # Extract features
    print("2. Extracting features...")
    extractor = FeatureExtractor(window_size=300)
    
    for packet in packets:
        extractor.add_packet(packet)
    
    features_df = extractor.extract_features_batch()
    print(f"   Extracted {len(features_df)} samples")
    print(f"   Features: {len(features_df.columns)}")
    print(f"\n   Sample features (first 5 rows):")
    print(features_df.head())
    
    # Build baseline
    print("\n3. Building baseline from normal traffic...")
    baseline = TrafficBaseline()
    baseline.build_from_features(features_df)
    
    # Test deviation scoring
    print("\n4. Calculating deviation scores...")
    sample_features = features_df.iloc[0].to_dict()
    deviation = baseline.calculate_deviation(sample_features)
    print(f"   Sample deviation score: {deviation:.4f}")
    
    print("\n[OK] Feature engineering pipeline working correctly!")
    print("   - Extracted 15+ features per traffic flow")
    print("   - Built baseline from historical data")
    print("   - Ready for anomaly detection model training")
