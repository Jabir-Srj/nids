"""
PCAP File Processing & Analysis
"""

import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib

class PCAPAnalyzer:
    """Analyze PCAP files for threats"""
    
    def __init__(self, rule_engine, anomaly_detector):
        self.rule_engine = rule_engine
        self.anomaly_detector = anomaly_detector
        self.upload_dir = 'uploads/pcap'
        os.makedirs(self.upload_dir, exist_ok=True)
    
    def process_pcap(self, file_path: str) -> Dict[str, Any]:
        """Process PCAP file and detect threats"""
        try:
            import scapy.all as scapy
            
            file_hash = self._compute_file_hash(file_path)
            
            packets = scapy.rdpcap(file_path)
            
            threats = []
            packets_analyzed = 0
            
            for packet in packets:
                packets_analyzed += 1
                threat = self._analyze_packet(packet)
                if threat:
                    threats.append(threat)
            
            result = {
                'status': 'success',
                'file_name': os.path.basename(file_path),
                'file_hash': file_hash,
                'file_size': os.path.getsize(file_path),
                'packets_analyzed': packets_analyzed,
                'threats_detected': len(threats),
                'threats': threats,
                'analyzed_at': datetime.utcnow().isoformat(),
            }
            
            return result
        
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
            }
    
    def _analyze_packet(self, packet) -> Optional[Dict[str, Any]]:
        """Analyze individual packet"""
        try:
            from scapy.layers.inet import IP, TCP, UDP, ICMP
            
            if not packet.haslayer(IP):
                return None
            
            ip_layer = packet[IP]
            
            payload = str(packet.payload)
            
            # Check detection rules
            threat_type = self.rule_engine.check_patterns(payload)
            if threat_type:
                return {
                    'timestamp': datetime.utcnow().isoformat(),
                    'source_ip': ip_layer.src,
                    'dest_ip': ip_layer.dst,
                    'protocol': ip_layer.proto,
                    'threat_type': threat_type,
                    'severity': 'medium',
                    'confidence': 0.85,
                    'payload': payload[:200],
                }
            
            # Check anomaly detection
            if self.anomaly_detector.is_anomaly(payload):
                return {
                    'timestamp': datetime.utcnow().isoformat(),
                    'source_ip': ip_layer.src,
                    'dest_ip': ip_layer.dst,
                    'protocol': ip_layer.proto,
                    'threat_type': 'Anomaly Detected',
                    'severity': 'low',
                    'confidence': 0.70,
                    'payload': payload[:200],
                }
            
            return None
        
        except Exception as e:
            print(f"Packet analysis error: {e}")
            return None
    
    def _compute_file_hash(self, file_path: str) -> str:
        """Compute SHA256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for byte_block in iter(lambda: f.read(4096), b''):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def export_threats_to_pcap(self, threats: List[Dict[str, Any]], output_path: str) -> bool:
        """Export detected threats as PCAP file"""
        try:
            import scapy.all as scapy
            
            packets = []
            for threat in threats:
                packet = scapy.IP(
                    src=threat.get('source_ip'),
                    dst=threat.get('dest_ip'),
                )
                packets.append(packet)
            
            scapy.wrpcap(output_path, packets)
            return True
        except Exception as e:
            print(f"PCAP export error: {e}")
            return False
    
    def batch_process(self, file_paths: List[str]) -> Dict[str, Any]:
        """Process multiple PCAP files"""
        results = {
            'total_files': len(file_paths),
            'processed_files': 0,
            'failed_files': 0,
            'total_threats': 0,
            'files': [],
        }
        
        for file_path in file_paths:
            result = self.process_pcap(file_path)
            
            if result.get('status') == 'success':
                results['processed_files'] += 1
                results['total_threats'] += result.get('threats_detected', 0)
                results['files'].append(result)
            else:
                results['failed_files'] += 1
        
        return results
