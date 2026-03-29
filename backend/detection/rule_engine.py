"""
NIDS Rule Engine
Signature-based threat detection using pattern matching
"""

import logging
import re
import yaml
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class Alert:
    """Alert data structure"""
    timestamp: datetime
    alert_id: str
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    threat_type: str
    severity: str
    signature_id: str
    signature_name: str
    description: str
    payload_snippet: str
    cve_ids: List[str]
    recommendation: str

    def to_dict(self):
        """Convert to dictionary for JSON"""
        return {
            'timestamp': self.timestamp.isoformat(),
            'alert_id': self.alert_id,
            'src_ip': self.src_ip,
            'dst_ip': self.dst_ip,
            'src_port': self.src_port,
            'dst_port': self.dst_port,
            'protocol': self.protocol,
            'threat_type': self.threat_type,
            'severity': self.severity,
            'signature_id': self.signature_id,
            'signature_name': self.signature_name,
            'description': self.description,
            'payload_snippet': self.payload_snippet,
            'cve_ids': self.cve_ids,
            'recommendation': self.recommendation,
        }


class Rule:
    """Single detection rule"""
    
    def __init__(self, rule_dict: Dict[str, Any]):
        self.rule_id = rule_dict.get('id', 'unknown')
        self.name = rule_dict.get('name', '')
        self.description = rule_dict.get('description', '')
        self.threat_type = rule_dict.get('threat_type', 'Unknown')
        self.severity = rule_dict.get('severity', 'MEDIUM')
        self.protocol = rule_dict.get('protocol', 'TCP')
        
        # Pattern matching
        self.pattern_type = rule_dict.get('pattern_type', 'string')  # string, regex, hex
        self.pattern = rule_dict.get('pattern', '')
        self.payload_match = rule_dict.get('payload_match', True)
        
        # Port matching
        self.src_ports = rule_dict.get('src_ports', [])
        self.dst_ports = rule_dict.get('dst_ports', [])
        
        # Additional info
        self.cve_ids = rule_dict.get('cve_ids', [])
        self.references = rule_dict.get('references', [])
        self.recommendation = rule_dict.get('recommendation', '')
        
        # Compiled pattern for performance
        if self.pattern_type == 'regex':
            try:
                self.compiled_pattern = re.compile(self.pattern, re.IGNORECASE)
            except Exception as e:
                logger.error(f"Failed to compile regex for rule {self.rule_id}: {e}")
                self.compiled_pattern = None
        else:
            self.compiled_pattern = None

    def matches_port(self, src_port: int, dst_port: int) -> bool:
        """Check if ports match rule"""
        if self.src_ports and src_port not in self.src_ports:
            return False
        if self.dst_ports and dst_port not in self.dst_ports:
            return False
        return True

    def matches_payload(self, payload: bytes) -> bool:
        """Check if payload matches pattern"""
        if not payload and self.payload_match:
            return False
        
        if not self.payload_match:
            return True
        
        try:
            # String match
            if self.pattern_type == 'string':
                return self.pattern.lower().encode() in payload.lower()
            
            # Regex match
            elif self.pattern_type == 'regex':
                if self.compiled_pattern:
                    return bool(self.compiled_pattern.search(payload))
                return False
            
            # Hex match
            elif self.pattern_type == 'hex':
                hex_bytes = bytes.fromhex(self.pattern.replace(' ', '').replace('\\x', ''))
                return hex_bytes in payload
            
        except Exception as e:
            logger.warning(f"Pattern match error in rule {self.rule_id}: {e}")
            return False
        
        return False

    def evaluate(self, packet) -> bool:
        """
        Evaluate if packet matches this rule
        
        Args:
            packet: Packet object from packet_capture
            
        Returns:
            True if packet matches rule
        """
        # Protocol check
        if self.protocol and packet.protocol != self.protocol:
            return False
        
        # Port check
        if not self.matches_port(packet.src_port, packet.dst_port):
            return False
        
        # Payload check
        if self.payload_match and not self.matches_payload(packet.payload):
            return False
        
        return True


class RuleEngine:
    """
    Rule engine for signature-based threat detection
    Evaluates packets against loaded rules
    """
    
    def __init__(self):
        self.rules: Dict[str, Rule] = {}
        self.rule_count = 0
        self.matches_count = 0
        logger.info("✅ RuleEngine initialized")

    def load_rules(self, yaml_file: str) -> int:
        """
        Load detection rules from YAML file
        
        Args:
            yaml_file: Path to YAML file with rules
            
        Returns:
            Number of rules loaded
        """
        try:
            with open(yaml_file, 'r') as f:
                rules_data = yaml.safe_load(f)
            
            if not rules_data or 'rules' not in rules_data:
                logger.warning(f"No rules found in {yaml_file}")
                return 0
            
            for rule_dict in rules_data['rules']:
                rule = Rule(rule_dict)
                self.rules[rule.rule_id] = rule
            
            self.rule_count = len(self.rules)
            logger.info(f"✅ Loaded {self.rule_count} rules from {yaml_file}")
            return self.rule_count
            
        except Exception as e:
            logger.error(f"Failed to load rules: {e}")
            return 0

    def add_rule(self, rule_dict: Dict[str, Any]) -> bool:
        """Add a single rule"""
        try:
            rule = Rule(rule_dict)
            self.rules[rule.rule_id] = rule
            self.rule_count = len(self.rules)
            logger.info(f"✅ Added rule: {rule.name}")
            return True
        except Exception as e:
            logger.error(f"Failed to add rule: {e}")
            return False

    def evaluate_packet(self, packet) -> List[Alert]:
        """
        Evaluate packet against all loaded rules
        
        Args:
            packet: Packet object from packet_capture
            
        Returns:
            List of Alert objects if matches found
        """
        alerts = []
        
        for rule_id, rule in self.rules.items():
            try:
                if rule.evaluate(packet):
                    alert = Alert(
                        timestamp=datetime.now(),
                        alert_id=f"{packet.src_ip}_{packet.timestamp.timestamp()}_{rule_id}",
                        src_ip=packet.src_ip,
                        dst_ip=packet.dst_ip,
                        src_port=packet.src_port,
                        dst_port=packet.dst_port,
                        protocol=packet.protocol,
                        threat_type=rule.threat_type,
                        severity=rule.severity,
                        signature_id=rule_id,
                        signature_name=rule.name,
                        description=rule.description,
                        payload_snippet=str(packet.payload[:100]),
                        cve_ids=rule.cve_ids,
                        recommendation=rule.recommendation,
                    )
                    alerts.append(alert)
                    self.matches_count += 1
                    logger.warning(f"🚨 ALERT: {rule.name} from {packet.src_ip}")
            
            except Exception as e:
                logger.error(f"Error evaluating rule {rule_id}: {e}")
        
        return alerts

    def get_stats(self) -> Dict[str, Any]:
        """Get rule engine statistics"""
        return {
            'rule_count': self.rule_count,
            'matches_count': self.matches_count,
            'rules_by_severity': self._count_by_severity(),
            'rules_by_threat_type': self._count_by_threat_type(),
        }

    def _count_by_severity(self) -> Dict[str, int]:
        """Count rules by severity"""
        counts = {}
        for rule in self.rules.values():
            counts[rule.severity] = counts.get(rule.severity, 0) + 1
        return counts

    def _count_by_threat_type(self) -> Dict[str, int]:
        """Count rules by threat type"""
        counts = {}
        for rule in self.rules.values():
            counts[rule.threat_type] = counts.get(rule.threat_type, 0) + 1
        return counts

    def enable_rule(self, rule_id: str) -> bool:
        """Enable a rule (placeholder for future flag-based enabling)"""
        if rule_id in self.rules:
            logger.info(f"Enabled rule: {rule_id}")
            return True
        return False

    def disable_rule(self, rule_id: str) -> bool:
        """Disable a rule (placeholder for future flag-based disabling)"""
        if rule_id in self.rules:
            logger.info(f"Disabled rule: {rule_id}")
            return True
        return False


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    engine = RuleEngine()
    print("✅ RuleEngine ready!")
