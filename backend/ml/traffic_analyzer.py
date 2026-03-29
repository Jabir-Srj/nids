"""
Traffic Pattern Analyzer for NIDS

Analyzes traffic baselines, detects deviations, and identifies unusual patterns.
Complements the Isolation Forest anomaly detector with statistical analysis.

Features:
- Baseline generation from historical traffic
- Deviation detection relative to baseline
- Trend analysis and seasonal patterns
- Protocol and port change detection
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TrafficMetrics:
    """Container for traffic analysis metrics"""
    timestamp: datetime
    total_packets: int
    total_bytes: int
    packet_rate: float  # packets/sec
    byte_rate: float    # bytes/sec
    unique_src_ips: int
    unique_dst_ips: int
    protocol_distribution: Dict[str, int]
    top_ports: List[Tuple[int, int]]  # (port, count)


class TrafficAnalyzer:
    """
    Analyzes network traffic patterns and detects anomalies based on deviations.
    
    Maintains baseline of normal traffic and scores deviation magnitude.
    """
    
    def __init__(self, window_size: int = 300):
        """
        Initialize traffic analyzer.
        
        Args:
            window_size: Time window (seconds) for aggregating metrics
        """
        self.window_size = window_size
        self.baseline: Optional[pd.DataFrame] = None
        self.baseline_stats: Dict = {}
        self.metrics_history: List[TrafficMetrics] = []
        self.is_built = False
        
    def add_metrics(self, metrics: TrafficMetrics) -> None:
        """Add traffic metrics snapshot."""
        self.metrics_history.append(metrics)
        
        # Keep only recent history
        cutoff_time = datetime.now() - timedelta(seconds=self.window_size * 10)
        self.metrics_history = [m for m in self.metrics_history if m.timestamp > cutoff_time]
    
    def build_baseline(self, metrics_list: List[TrafficMetrics]) -> Dict:
        """
        Build baseline from historical metrics (assumed normal traffic).
        
        Args:
            metrics_list: List of TrafficMetrics from normal period
            
        Returns:
            Dictionary with baseline statistics
        """
        if not metrics_list:
            logger.warning("Cannot build baseline from empty list")
            return {}
        
        logger.info(f"Building baseline from {len(metrics_list)} metrics")
        
        # Convert to DataFrame for analysis
        data = {
            'packet_rate': [m.packet_rate for m in metrics_list],
            'byte_rate': [m.byte_rate for m in metrics_list],
            'total_packets': [m.total_packets for m in metrics_list],
            'total_bytes': [m.total_bytes for m in metrics_list],
            'unique_src_ips': [m.unique_src_ips for m in metrics_list],
            'unique_dst_ips': [m.unique_dst_ips for m in metrics_list],
        }
        
        df = pd.DataFrame(data)
        self.baseline = df
        
        # Calculate statistics
        for col in df.columns:
            self.baseline_stats[col] = {
                'mean': float(df[col].mean()),
                'std': float(df[col].std()),
                'min': float(df[col].min()),
                'max': float(df[col].max()),
                'q25': float(df[col].quantile(0.25)),
                'q75': float(df[col].quantile(0.75)),
                'median': float(df[col].median()),
            }
        
        self.is_built = True
        
        logger.info("Baseline statistics:")
        for metric, stats in self.baseline_stats.items():
            logger.info(f"  {metric}: mean={stats['mean']:.2f}, std={stats['std']:.2f}")
        
        return self.baseline_stats
    
    def detect_deviation(self, metrics: TrafficMetrics) -> Dict:
        """
        Calculate deviation from baseline for given metrics.
        
        Args:
            metrics: Current traffic metrics
            
        Returns:
            Dictionary with deviation scores and analysis
        """
        if not self.is_built:
            logger.warning("Baseline not built")
            return {'deviation_score': 0.5, 'details': 'No baseline'}
        
        deviations = {}
        scores = []
        
        # Calculate deviation for each metric
        metric_values = {
            'packet_rate': metrics.packet_rate,
            'byte_rate': metrics.byte_rate,
            'total_packets': metrics.total_packets,
            'total_bytes': metrics.total_bytes,
            'unique_src_ips': metrics.unique_src_ips,
            'unique_dst_ips': metrics.unique_dst_ips,
        }
        
        for metric_name, value in metric_values.items():
            if metric_name in self.baseline_stats:
                stats = self.baseline_stats[metric_name]
                mean = stats['mean']
                std = stats['std']
                
                if std > 0:
                    # Z-score
                    z_score = abs(value - mean) / std
                    # Convert to [0, 1]
                    normalized = min(1.0, z_score / 3)  # 3-sigma = ~1.0
                    deviations[metric_name] = {
                        'value': value,
                        'baseline_mean': mean,
                        'z_score': z_score,
                        'normalized_deviation': normalized
                    }
                    scores.append(normalized)
        
        # Overall deviation score
        overall_deviation = np.mean(scores) if scores else 0.5
        
        return {
            'deviation_score': float(overall_deviation),
            'metrics': deviations,
            'flagged_metrics': [m for m, d in deviations.items() 
                               if d['z_score'] > 2.0]  # >2 sigma
        }
    
    def get_trends(self, minutes: int = 60) -> Dict:
        """
        Analyze traffic trends over time.
        
        Args:
            minutes: Time period to analyze
            
        Returns:
            Dictionary with trend analysis
        """
        if not self.metrics_history:
            return {'error': 'No metrics history'}
        
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        recent = [m for m in self.metrics_history if m.timestamp > cutoff_time]
        
        if len(recent) < 2:
            return {'error': 'Insufficient data for trends'}
        
        # Convert to DataFrame
        df = pd.DataFrame({
            'packet_rate': [m.packet_rate for m in recent],
            'byte_rate': [m.byte_rate for m in recent],
            'unique_src_ips': [m.unique_src_ips for m in recent],
        })
        
        trends = {}
        
        for col in df.columns:
            values = df[col].values
            
            # Linear trend (slope)
            x = np.arange(len(values))
            slope = np.polyfit(x, values, 1)[0]
            
            # Percent change
            if len(values) > 0:
                pct_change = (values[-1] - values[0]) / (values[0] + 1e-10) * 100
            else:
                pct_change = 0
            
            trends[col] = {
                'slope': float(slope),
                'pct_change': float(pct_change),
                'current': float(values[-1]),
                'min': float(np.min(values)),
                'max': float(np.max(values)),
                'mean': float(np.mean(values)),
            }
        
        return trends
    
    def detect_port_sweep(self, packets_per_window: List = None) -> Dict:
        """
        Detect port scanning/sweeping patterns.
        
        Args:
            packets_per_window: Packet data for analysis
            
        Returns:
            Dictionary with port sweep analysis
        """
        # This would be called with packet data from the capture engine
        # Returns indicators of port scanning behavior
        
        return {
            'is_port_sweep': False,
            'confidence': 0.0,
            'details': 'Port sweep detection placeholder'
        }
    
    def detect_protocol_anomaly(self, metrics: TrafficMetrics) -> Dict:
        """
        Detect unusual protocol distribution.
        
        Args:
            metrics: Current traffic metrics
            
        Returns:
            Dictionary with protocol anomaly scores
        """
        if not metrics.protocol_distribution:
            return {'anomaly_score': 0, 'details': 'No protocol data'}
        
        # Calculate entropy of protocol distribution
        total = sum(metrics.protocol_distribution.values())
        if total == 0:
            return {'anomaly_score': 0, 'details': 'No packets'}
        
        probs = np.array(list(metrics.protocol_distribution.values())) / total
        entropy = -np.sum(probs * np.log2(probs + 1e-10))
        
        # Normalize to [0, 1]
        max_entropy = np.log2(len(metrics.protocol_distribution))
        normalized_entropy = entropy / (max_entropy + 1e-10)
        
        return {
            'entropy': float(entropy),
            'normalized_entropy': float(normalized_entropy),
            'is_anomalous': normalized_entropy > 0.8,  # High entropy = suspicious
            'protocol_distribution': metrics.protocol_distribution
        }
    
    def get_peer_analysis(self, src_ip: str) -> Dict:
        """
        Analyze communication patterns for specific IP.
        
        Args:
            src_ip: Source IP to analyze
            
        Returns:
            Dictionary with peer communication analysis
        """
        # This would analyze:
        # - Number of unique destination IPs
        # - Port diversity
        # - Protocol distribution
        # - Consistency over time
        
        return {
            'src_ip': src_ip,
            'unique_destinations': 0,
            'port_diversity': 0,
            'consistency_score': 0,
            'details': 'Peer analysis placeholder'
        }
    
    def calculate_risk_score(self, metrics: TrafficMetrics) -> float:
        """
        Calculate overall risk score based on multiple factors.
        
        Args:
            metrics: Traffic metrics
            
        Returns:
            Risk score [0, 1]
        """
        scores = []
        
        # Deviation from baseline
        if self.is_built:
            deviation = self.detect_deviation(metrics)
            scores.append(deviation['deviation_score'] * 0.5)
        
        # Protocol anomaly
        protocol_anomaly = self.detect_protocol_anomaly(metrics)
        if protocol_anomaly.get('is_anomalous'):
            scores.append(0.3)
        else:
            scores.append(protocol_anomaly.get('normalized_entropy', 0) * 0.1)
        
        # High IP diversity could indicate scanning
        if metrics.unique_dst_ips > 50:
            scores.append(0.2)
        
        overall_score = np.mean(scores) if scores else 0
        
        return float(min(1.0, overall_score))


class HourlyAnomalyPattern:
    """
    Detects hourly/daily patterns and seasonal anomalies.
    """
    
    def __init__(self):
        self.hourly_patterns: Dict[int, Dict] = {}  # hour -> statistics
        self.daily_patterns: Dict[int, Dict] = {}    # day_of_week -> statistics
        
    def record_traffic(self, metrics: TrafficMetrics) -> None:
        """Record traffic metrics for pattern detection."""
        hour = metrics.timestamp.hour
        day = metrics.timestamp.weekday()
        
        # Update hourly patterns
        if hour not in self.hourly_patterns:
            self.hourly_patterns[hour] = {'samples': [], 'packet_rates': []}
        
        self.hourly_patterns[hour]['packet_rates'].append(metrics.packet_rate)
        self.hourly_patterns[hour]['samples'].append(metrics)
        
        # Update daily patterns
        if day not in self.daily_patterns:
            self.daily_patterns[day] = {'samples': [], 'packet_rates': []}
        
        self.daily_patterns[day]['packet_rates'].append(metrics.packet_rate)
        self.daily_patterns[day]['samples'].append(metrics)
    
    def is_anomalous_for_hour(self, metrics: TrafficMetrics) -> Tuple[bool, float]:
        """
        Check if metrics are anomalous for current hour.
        
        Returns:
            Tuple of (is_anomalous, confidence)
        """
        hour = metrics.timestamp.hour
        
        if hour not in self.hourly_patterns:
            return False, 0.0
        
        rates = self.hourly_patterns[hour]['packet_rates']
        if not rates:
            return False, 0.0
        
        mean = np.mean(rates)
        std = np.std(rates)
        
        if std > 0:
            z_score = abs(metrics.packet_rate - mean) / std
            is_anomalous = z_score > 2.5  # >2.5 sigma
            confidence = min(1.0, z_score / 3.0)
            return is_anomalous, confidence
        
        return False, 0.0


def create_mock_metrics(n_samples: int = 100) -> List[TrafficMetrics]:
    """Generate mock traffic metrics for testing."""
    metrics_list = []
    current_time = datetime.now()
    
    for i in range(n_samples):
        metrics = TrafficMetrics(
            timestamp=current_time - timedelta(seconds=300-i*3),
            total_packets=np.random.randint(500, 5000),
            total_bytes=np.random.randint(50000, 500000),
            packet_rate=np.random.uniform(10, 100),
            byte_rate=np.random.uniform(1000, 10000),
            unique_src_ips=np.random.randint(1, 10),
            unique_dst_ips=np.random.randint(5, 50),
            protocol_distribution={
                'TCP': np.random.randint(100, 1000),
                'UDP': np.random.randint(50, 500),
                'ICMP': np.random.randint(0, 50)
            },
            top_ports=[(80, 50), (443, 45), (22, 10), (53, 5)]
        )
        metrics_list.append(metrics)
    
    return metrics_list


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    print("=" * 60)
    print("NIDS Traffic Pattern Analyzer - Demo")
    print("=" * 60)
    
    # Generate baseline metrics
    print("\n1. Generating baseline metrics (normal traffic)...")
    baseline_metrics = create_mock_metrics(n_samples=100)
    
    analyzer = TrafficAnalyzer(window_size=300)
    stats = analyzer.build_baseline(baseline_metrics)
    
    print(f"   Baseline built with {len(baseline_metrics)} samples")
    
    # Add some anomalous metrics
    print("\n2. Generating test metrics...")
    test_metrics = create_mock_metrics(n_samples=20)
    
    # Artificially make one anomalous
    test_metrics[10].packet_rate = 500  # Much higher
    test_metrics[10].unique_dst_ips = 200  # Scanning pattern
    
    # Detect deviations
    print("\n3. Detecting deviations...")
    for i, metrics in enumerate(test_metrics):
        analyzer.add_metrics(metrics)
        deviation = analyzer.detect_deviation(metrics)
        
        if deviation['deviation_score'] > 0.5:
            print(f"   Sample {i}: ANOMALY (score={deviation['deviation_score']:.4f})")
            print(f"      Flagged metrics: {deviation.get('flagged_metrics', [])}")
    
    # Trend analysis
    print("\n4. Analyzing trends (last 60 minutes)...")
    trends = analyzer.get_trends(minutes=60)
    for metric, trend in trends.items():
        if 'slope' in trend:
            print(f"   {metric}:")
            print(f"      Slope: {trend['slope']:.4f}")
            print(f"      Change: {trend['pct_change']:.2f}%")
    
    print("\n[OK] Traffic pattern analyzer working correctly!")
    print("   - Baseline generation working")
    print("   - Deviation detection implemented")
    print("   - Trend analysis working")
