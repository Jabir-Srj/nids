"""
Database Models for NIDS
SQLAlchemy ORM models for alerts, packets, threat intelligence, and ML features.

Tables:
- Alert: Detected threats and attacks
- Packet: Raw packet data (optional storage)
- ThreatIntel: IP reputation and threat data
- MLFeatures: Machine learning feature vectors
- Rule: Detection rule metadata
- Capture: Capture session metadata
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
from typing import Dict, Any

db = SQLAlchemy()


class Alert(db.Model):
    """
    Alert model for detected threats.
    
    Columns:
    - id: Primary key
    - timestamp: When threat was detected
    - src_ip: Source IP address
    - dst_ip: Destination IP address
    - src_port: Source port
    - dst_port: Destination port
    - protocol: Network protocol (TCP, UDP, ICMP, etc.)
    - threat_type: Category of threat (SQL Injection, DDoS, etc.)
    - severity: Alert severity level (CRITICAL, HIGH, MEDIUM, LOW, INFO)
    - rule_name: Name of rule that triggered alert
    - signature: Matched signature/pattern
    - payload_snippet: First 100 bytes of matching payload
    - cve_ids: Comma-separated list of associated CVEs
    - action: Response action taken (logged, blocked, etc.)
    - confidence: Confidence score (0.0-1.0)
    """
    __tablename__ = "alerts"
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    src_ip = db.Column(db.String(45), index=True)  # IPv4 or IPv6
    dst_ip = db.Column(db.String(45), index=True)
    src_port = db.Column(db.Integer)
    dst_port = db.Column(db.Integer)
    protocol = db.Column(db.String(10), index=True)
    threat_type = db.Column(db.String(50), index=True)
    severity = db.Column(db.String(10), index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    rule_name = db.Column(db.String(100), index=True)
    signature = db.Column(db.String(500))
    payload_snippet = db.Column(db.Text)
    cve_ids = db.Column(db.String(500))
    action = db.Column(db.String(50))
    confidence = db.Column(db.Float, default=1.0)
    
    # Relationships
    packets = db.relationship("Packet", back_populates="alert", cascade="delete")
    
    def __repr__(self):
        return f"<Alert {self.id}: {self.threat_type} from {self.src_ip}>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert alert to dictionary"""
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "src_ip": self.src_ip,
            "dst_ip": self.dst_ip,
            "src_port": self.src_port,
            "dst_port": self.dst_port,
            "protocol": self.protocol,
            "threat_type": self.threat_type,
            "severity": self.severity,
            "rule_name": self.rule_name,
            "signature": self.signature,
            "payload_snippet": self.payload_snippet,
            "cve_ids": self.cve_ids.split(",") if self.cve_ids else [],
            "action": self.action,
            "confidence": self.confidence,
        }


class Packet(db.Model):
    """
    Optional raw packet storage for detailed forensics.
    
    Columns:
    - id: Primary key
    - alert_id: Associated alert (if triggered rule)
    - timestamp: Packet capture time
    - src_ip: Source IP
    - dst_ip: Destination IP
    - protocol: Network protocol
    - data: Raw packet bytes (BLOB)
    - packet_size: Packet length in bytes
    """
    __tablename__ = "packets"
    
    id = db.Column(db.Integer, primary_key=True)
    alert_id = db.Column(db.Integer, db.ForeignKey("alerts.id"), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    src_ip = db.Column(db.String(45), index=True)
    dst_ip = db.Column(db.String(45), index=True)
    protocol = db.Column(db.String(10))
    data = db.Column(db.LargeBinary)
    packet_size = db.Column(db.Integer)
    
    # Relationship
    alert = db.relationship("Alert", back_populates="packets")
    
    def __repr__(self):
        return f"<Packet {self.id}: {self.src_ip} -> {self.dst_ip}>"


class ThreatIntel(db.Model):
    """
    Threat intelligence database for IP reputation.
    
    Columns:
    - id: Primary key
    - ip_address: IP address (UNIQUE)
    - threat_level: Threat severity (low, medium, high, critical)
    - last_seen: Last time IP was involved in attack
    - total_reports: Number of reports against this IP
    - country: Geolocation country
    - asn: Autonomous System Number
    - isp: Internet Service Provider name
    - is_vpn: Whether IP is known VPN
    - is_proxy: Whether IP is known proxy
    - abuse_types: Comma-separated abuse types
    - last_updated: Last intelligence update
    """
    __tablename__ = "threat_intel"
    
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), unique=True, index=True)
    threat_level = db.Column(db.String(20), index=True)
    last_seen = db.Column(db.DateTime)
    total_reports = db.Column(db.Integer, default=0)
    country = db.Column(db.String(2))
    asn = db.Column(db.String(20))
    isp = db.Column(db.String(100))
    is_vpn = db.Column(db.Boolean, default=False)
    is_proxy = db.Column(db.Boolean, default=False)
    abuse_types = db.Column(db.String(500))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ThreatIntel {self.ip_address}: {self.threat_level}>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "ip_address": self.ip_address,
            "threat_level": self.threat_level,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "total_reports": self.total_reports,
            "country": self.country,
            "asn": self.asn,
            "isp": self.isp,
            "is_vpn": self.is_vpn,
            "is_proxy": self.is_proxy,
            "abuse_types": self.abuse_types.split(",") if self.abuse_types else [],
        }


class MLFeatures(db.Model):
    """
    Machine learning feature vectors for anomaly detection.
    
    Columns:
    - id: Primary key
    - timestamp: Feature vector timestamp
    - src_ip: Source IP
    - traffic_volume: Bytes transferred (volume)
    - packet_rate: Packets per second
    - protocol_distribution: JSON of protocol breakdown
    - port_entropy: Entropy of destination ports
    - is_anomaly: Whether detected as anomaly
    - confidence: Anomaly confidence score (0.0-1.0)
    """
    __tablename__ = "ml_features"
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    src_ip = db.Column(db.String(45), index=True)
    traffic_volume = db.Column(db.Integer)
    packet_rate = db.Column(db.Float)
    protocol_distribution = db.Column(db.Text)  # JSON
    port_entropy = db.Column(db.Float)
    is_anomaly = db.Column(db.Boolean, default=False, index=True)
    confidence = db.Column(db.Float)
    
    def __repr__(self):
        return f"<MLFeatures {self.src_ip}: anomaly={self.is_anomaly}>"
    
    def get_protocol_dist(self) -> Dict[str, int]:
        """Parse protocol distribution JSON"""
        try:
            return json.loads(self.protocol_distribution) if self.protocol_distribution else {}
        except json.JSONDecodeError:
            return {}
    
    def set_protocol_dist(self, dist: Dict[str, int]):
        """Set protocol distribution as JSON"""
        self.protocol_distribution = json.dumps(dist)


class Rule(db.Model):
    """
    Detection rule metadata and status.
    
    Columns:
    - id: Primary key
    - name: Rule name (UNIQUE)
    - description: Rule description
    - severity: Rule severity level
    - threat_type: Type of threat rule detects
    - pattern: Detection pattern/signature
    - enabled: Whether rule is active
    - times_triggered: Number of times rule has triggered
    - false_positives: Count of false positive alerts
    - created_at: When rule was created
    - last_updated: Last modification time
    """
    __tablename__ = "rules"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, index=True)
    description = db.Column(db.Text)
    severity = db.Column(db.String(20))
    threat_type = db.Column(db.String(50), index=True)
    pattern = db.Column(db.Text)
    enabled = db.Column(db.Boolean, default=True, index=True)
    times_triggered = db.Column(db.Integer, default=0)
    false_positives = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Rule {self.name}: {self.threat_type}>"


class Capture(db.Model):
    """
    Capture session metadata.
    
    Columns:
    - id: Primary key
    - mode: Capture mode (live, pcap_file)
    - interface: Network interface name
    - bpf_filter: Packet filter expression
    - start_time: When capture started
    - end_time: When capture ended
    - packet_count: Total packets captured
    - bytes_captured: Total bytes captured
    - packets_dropped: Dropped packets (buffer full)
    - status: Capture status (running, completed, error)
    """
    __tablename__ = "captures"
    
    id = db.Column(db.Integer, primary_key=True)
    mode = db.Column(db.String(20))  # live, pcap_file
    interface = db.Column(db.String(50))
    bpf_filter = db.Column(db.String(200))
    start_time = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    end_time = db.Column(db.DateTime)
    packet_count = db.Column(db.Integer, default=0)
    bytes_captured = db.Column(db.Integer, default=0)
    packets_dropped = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20))  # running, completed, error
    
    def __repr__(self):
        return f"<Capture {self.id}: {self.mode} ({self.status})>"
    
    def get_duration(self) -> float:
        """Get capture duration in seconds"""
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return (datetime.utcnow() - self.start_time).total_seconds()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "mode": self.mode,
            "interface": self.interface,
            "bpf_filter": self.bpf_filter,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration_seconds": self.get_duration(),
            "packet_count": self.packet_count,
            "bytes_captured": self.bytes_captured,
            "packets_dropped": self.packets_dropped,
            "status": self.status,
        }


class AlertStats(db.Model):
    """
    Pre-computed alert statistics for dashboard (time-series data).
    
    Columns:
    - id: Primary key
    - timestamp: Hour/day bucket
    - critical_count: CRITICAL severity alerts
    - high_count: HIGH severity alerts
    - medium_count: MEDIUM severity alerts
    - low_count: LOW severity alerts
    - total_count: Total alerts
    - top_threat_type: Most common threat type in period
    """
    __tablename__ = "alert_stats"
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, unique=True, index=True)
    critical_count = db.Column(db.Integer, default=0)
    high_count = db.Column(db.Integer, default=0)
    medium_count = db.Column(db.Integer, default=0)
    low_count = db.Column(db.Integer, default=0)
    total_count = db.Column(db.Integer, default=0)
    top_threat_type = db.Column(db.String(50))
    
    def __repr__(self):
        return f"<AlertStats {self.timestamp}: {self.total_count} alerts>"


class IPReputation(db.Model):
    """
    Cached IP reputation scores from threat intelligence.
    
    Columns:
    - id: Primary key
    - ip_address: IP address
    - reputation_score: Score (0-100, 0=benign, 100=malicious)
    - last_checked: Last time checked with threat intel APIs
    - cached_until: Cache expiration time
    """
    __tablename__ = "ip_reputation"
    
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), unique=True, index=True)
    reputation_score = db.Column(db.Integer)  # 0-100
    last_checked = db.Column(db.DateTime, default=datetime.utcnow)
    cached_until = db.Column(db.DateTime)
    
    def __repr__(self):
        return f"<IPReputation {self.ip_address}: {self.reputation_score}>"
    
    def is_cached_valid(self) -> bool:
        """Check if cache is still valid"""
        return self.cached_until and datetime.utcnow() < self.cached_until


def init_db(app):
    """Initialize database with all tables"""
    with app.app_context():
        db.create_all()
        # Create indexes for frequently queried columns
        create_indexes()


def create_indexes():
    """Create database indexes for performance"""
    # Indexes are created via model definitions, but this can be used
    # for additional manual index creation if needed
    pass


if __name__ == "__main__":
    # Example: Create database schema
    from flask import Flask
    
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///nids.db"
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        print("✅ Database initialized successfully")
