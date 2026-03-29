"""
🎯 Alert Classifier & Severity Scoring System
Classifies alerts, scores severity (CVSS-like), provides contextual analysis and recommendations

Features:
- CVSS-like severity scoring
- Threat categorization
- Contextual analysis
- Actionable recommendations
- Attack pattern recognition
- Risk aggregation
"""

import json
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ThreatCategory(Enum):
    """Threat classification categories"""
    SQL_INJECTION = "sql_injection"
    XSS = "xss"
    BUFFER_OVERFLOW = "buffer_overflow"
    DDoS = "ddos"
    PORT_SCANNING = "port_scanning"
    BRUTE_FORCE = "brute_force"
    MALWARE = "malware"
    RECONNAISSANCE = "reconnaissance"
    DATA_EXFILTRATION = "data_exfiltration"
    COMMAND_INJECTION = "command_injection"
    XXE = "xxe"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    UNKNOWN = "unknown"


class SeverityLevel(Enum):
    """Severity levels (CVSS-inspired)"""
    CRITICAL = 5  # 9.0-10.0 CVSS
    HIGH = 4      # 7.0-8.9 CVSS
    MEDIUM = 3    # 4.0-6.9 CVSS
    LOW = 2       # 0.1-3.9 CVSS
    INFO = 1      # Informational


@dataclass
class CVSSLikeScore:
    """CVSS-inspired scoring model"""
    base_score: float  # 0-10
    temporal_score: float  # 0-10 with threat intel
    environmental_score: float  # 0-10 with network context
    vector: str  # CVSS vector representation
    
    @property
    def final_score(self) -> float:
        """Calculate final score (weighted average)"""
        return (self.base_score * 0.6 + 
                self.temporal_score * 0.2 + 
                self.environmental_score * 0.2)
    
    def severity_level(self) -> SeverityLevel:
        """Map score to severity level"""
        score = self.final_score
        if score >= 9.0:
            return SeverityLevel.CRITICAL
        elif score >= 7.0:
            return SeverityLevel.HIGH
        elif score >= 4.0:
            return SeverityLevel.MEDIUM
        elif score >= 0.1:
            return SeverityLevel.LOW
        else:
            return SeverityLevel.INFO


@dataclass
class AlertClassification:
    """Complete alert classification"""
    alert_id: str
    timestamp: str
    threat_category: ThreatCategory
    severity: SeverityLevel
    cvss_score: CVSSLikeScore
    confidence: float  # 0-100%
    affected_asset: str
    attack_pattern: str
    owasp_mapping: List[str]
    threat_intel_enrichment: Dict
    recommendations: List[str]
    false_positive_probability: float  # 0-100%
    context: Dict


class AlertClassifier:
    """Main classifier engine"""
    
    def __init__(self):
        self.threat_signatures = self._load_threat_signatures()
        self.owasp_mapping = self._create_owasp_mapping()
        self.attack_patterns = self._load_attack_patterns()
    
    def _load_threat_signatures(self) -> Dict:
        """Load threat signatures and their properties"""
        return {
            # SQL Injection signatures
            "SQL_UNION_SELECT": {
                "category": ThreatCategory.SQL_INJECTION,
                "base_score": 8.5,
                "impact": "HIGH",
                "exploitability": 0.95,
                "scope": "Changed",
            },
            "SQL_DROP_TABLE": {
                "category": ThreatCategory.SQL_INJECTION,
                "base_score": 9.0,
                "impact": "CRITICAL",
                "exploitability": 0.95,
                "scope": "Changed",
            },
            "SQL_OR_1_EQ_1": {
                "category": ThreatCategory.SQL_INJECTION,
                "base_score": 8.0,
                "impact": "HIGH",
                "exploitability": 0.95,
                "scope": "Changed",
            },
            
            # XSS signatures
            "XSS_SCRIPT_TAG": {
                "category": ThreatCategory.XSS,
                "base_score": 6.5,
                "impact": "MEDIUM",
                "exploitability": 0.85,
                "scope": "Changed",
            },
            "XSS_ONERROR_ATTR": {
                "category": ThreatCategory.XSS,
                "base_score": 6.5,
                "impact": "MEDIUM",
                "exploitability": 0.85,
                "scope": "Changed",
            },
            
            # DDoS signatures
            "DDoS_SYN_FLOOD": {
                "category": ThreatCategory.DDoS,
                "base_score": 8.5,
                "impact": "HIGH",
                "exploitability": 0.90,
                "scope": "Changed",
            },
            "DDoS_UDP_FLOOD": {
                "category": ThreatCategory.DDoS,
                "base_score": 8.0,
                "impact": "HIGH",
                "exploitability": 0.90,
                "scope": "Changed",
            },
            
            # Buffer Overflow
            "BO_NOP_SLED": {
                "category": ThreatCategory.BUFFER_OVERFLOW,
                "base_score": 9.0,
                "impact": "CRITICAL",
                "exploitability": 0.99,
                "scope": "Changed",
            },
            
            # Port Scanning
            "PS_SEQUENTIAL_PORTS": {
                "category": ThreatCategory.PORT_SCANNING,
                "base_score": 3.5,
                "impact": "LOW",
                "exploitability": 0.70,
                "scope": "Unchanged",
            },
            
            # Brute Force
            "BF_FAILED_LOGINS": {
                "category": ThreatCategory.BRUTE_FORCE,
                "base_score": 5.5,
                "impact": "MEDIUM",
                "exploitability": 0.80,
                "scope": "Changed",
            },
            
            # Malware
            "MW_MIMIKATZ_PATTERN": {
                "category": ThreatCategory.MALWARE,
                "base_score": 9.0,
                "impact": "CRITICAL",
                "exploitability": 0.95,
                "scope": "Changed",
            },
            
            # Command Injection
            "CMD_UNIX_INJECTION": {
                "category": ThreatCategory.COMMAND_INJECTION,
                "base_score": 8.8,
                "impact": "CRITICAL",
                "exploitability": 0.95,
                "scope": "Changed",
            },
            
            # XXE
            "XXE_DOCTYPE": {
                "category": ThreatCategory.XXE,
                "base_score": 8.5,
                "impact": "HIGH",
                "exploitability": 0.95,
                "scope": "Changed",
            },
        }
    
    def _create_owasp_mapping(self) -> Dict[ThreatCategory, List[str]]:
        """Map threats to OWASP Top 10"""
        return {
            ThreatCategory.SQL_INJECTION: ["A03:2021 - Injection"],
            ThreatCategory.XSS: ["A03:2021 - Injection"],
            ThreatCategory.BUFFER_OVERFLOW: ["A06:2021 - Vulnerable and Outdated Components"],
            ThreatCategory.DDoS: ["N/A (Infrastructure)"],
            ThreatCategory.PORT_SCANNING: ["A01:2021 - Broken Access Control"],
            ThreatCategory.BRUTE_FORCE: ["A07:2021 - Cross-Site Request Forgery (CSRF)"],
            ThreatCategory.MALWARE: ["A08:2021 - Software and Data Integrity Failures"],
            ThreatCategory.COMMAND_INJECTION: ["A03:2021 - Injection"],
            ThreatCategory.XXE: ["A05:2021 - Security Misconfiguration"],
            ThreatCategory.RECONNAISSANCE: ["A01:2021 - Broken Access Control"],
            ThreatCategory.DATA_EXFILTRATION: ["A01:2021 - Broken Access Control"],
            ThreatCategory.UNAUTHORIZED_ACCESS: ["A01:2021 - Broken Access Control"],
            ThreatCategory.PRIVILEGE_ESCALATION: ["A04:2021 - Insecure Deserialization"],
            ThreatCategory.UNKNOWN: [],
        }
    
    def _load_attack_patterns(self) -> Dict:
        """Load known attack patterns for context"""
        return {
            "multi_injection": {
                "signatures": ["SQL_UNION_SELECT", "XSS_SCRIPT_TAG"],
                "pattern": "Multi-vector injection attack",
                "severity_boost": 1.1,
            },
            "reconnaissance_scanning": {
                "signatures": ["PS_SEQUENTIAL_PORTS", "RECON_SNMP_SCAN"],
                "pattern": "Reconnaissance and enumeration phase",
                "severity_boost": 1.05,
            },
            "brute_force_chain": {
                "signatures": ["BF_FAILED_LOGINS", "BF_SSH_ATTACK"],
                "pattern": "Coordinated brute force attack",
                "severity_boost": 1.15,
            },
            "exploitation_chain": {
                "signatures": ["BO_NOP_SLED", "CMD_UNIX_INJECTION"],
                "pattern": "Exploit deployment sequence",
                "severity_boost": 1.25,
            },
            "data_exfil": {
                "signatures": ["EXFIL_LARGE_VOLUME", "DNS_TUNNEL_DETECTION"],
                "pattern": "Data exfiltration via side channel",
                "severity_boost": 1.20,
            },
        }
    
    def classify(self, 
                 alert: Dict,
                 threat_intel: Optional[Dict] = None) -> AlertClassification:
        """
        Classify an alert and generate CVSS-like score
        
        Args:
            alert: Raw alert from rule engine
            threat_intel: Threat intelligence enrichment data
        
        Returns:
            Complete classification with recommendations
        """
        signature_id = alert.get('signature_id', 'UNKNOWN')
        threat_cat = self._determine_category(signature_id)
        confidence = self._calculate_confidence(alert)
        
        # Base CVSS calculation
        cvss = self._calculate_cvss(alert, signature_id, threat_intel)
        
        # Context analysis
        context = self._analyze_context(alert, threat_intel)
        
        # Recommendations
        recommendations = self._generate_recommendations(threat_cat, cvss, context)
        
        # False positive probability
        fp_prob = self._calculate_fp_probability(alert, threat_cat)
        
        classification = AlertClassification(
            alert_id=alert.get('id', 'unknown'),
            timestamp=datetime.now().isoformat(),
            threat_category=threat_cat,
            severity=cvss.severity_level(),
            cvss_score=cvss,
            confidence=confidence,
            affected_asset=alert.get('dst_ip', 'unknown'),
            attack_pattern=self._identify_pattern(signature_id),
            owasp_mapping=self.owasp_mapping.get(threat_cat, []),
            threat_intel_enrichment=threat_intel or {},
            recommendations=recommendations,
            false_positive_probability=fp_prob,
            context=context
        )
        
        logger.info(f"Alert {alert['id']} classified: {threat_cat.value} - {cvss.severity_level().name}")
        return classification
    
    def _determine_category(self, signature_id: str) -> ThreatCategory:
        """Map signature to threat category"""
        sig_map = {
            'SQL': ThreatCategory.SQL_INJECTION,
            'XSS': ThreatCategory.XSS,
            'BO': ThreatCategory.BUFFER_OVERFLOW,
            'DDoS': ThreatCategory.DDoS,
            'PS': ThreatCategory.PORT_SCANNING,
            'BF': ThreatCategory.BRUTE_FORCE,
            'MW': ThreatCategory.MALWARE,
            'CMD': ThreatCategory.COMMAND_INJECTION,
            'XXE': ThreatCategory.XXE,
            'DNS': ThreatCategory.RECONNAISSANCE,
            'EXFIL': ThreatCategory.DATA_EXFILTRATION,
        }
        
        for prefix, cat in sig_map.items():
            if signature_id.startswith(prefix):
                return cat
        return ThreatCategory.UNKNOWN
    
    def _calculate_confidence(self, alert: Dict) -> float:
        """Calculate confidence percentage"""
        confidence = alert.get('confidence', 75.0)
        
        # Boost confidence if multiple factors present
        factors = sum([
            bool(alert.get('payload')),
            bool(alert.get('threat_intel')),
            bool(alert.get('signature_match')),
            alert.get('packet_count', 0) > 1,
        ])
        
        confidence = min(100.0, confidence + factors * 5)
        return confidence
    
    def _calculate_cvss(self, 
                        alert: Dict, 
                        signature_id: str,
                        threat_intel: Optional[Dict]) -> CVSSLikeScore:
        """
        Calculate CVSS-like score
        Components: Base (signature), Temporal (threat intel), Environmental (network)
        """
        sig_props = self.threat_signatures.get(signature_id, {})
        base_score = sig_props.get('base_score', 5.0)
        
        # Temporal factors (threat intelligence)
        temporal_score = base_score
        if threat_intel:
            if threat_intel.get('threat_level') == 'CRITICAL':
                temporal_score += 2.0
            elif threat_intel.get('threat_level') == 'HIGH':
                temporal_score += 1.0
        
        # Environmental factors (network context)
        environmental_score = base_score
        if alert.get('protocol') == 'TCP':
            environmental_score -= 0.5
        if alert.get('dst_port') in [22, 3389, 443]:  # Common services
            environmental_score += 0.5
        
        # Cap scores at 10
        base_score = min(10.0, base_score)
        temporal_score = min(10.0, temporal_score)
        environmental_score = min(10.0, environmental_score)
        
        vector = self._create_cvss_vector(sig_props)
        
        return CVSSLikeScore(
            base_score=base_score,
            temporal_score=temporal_score,
            environmental_score=environmental_score,
            vector=vector
        )
    
    def _create_cvss_vector(self, sig_props: Dict) -> str:
        """Create CVSS vector string"""
        av = "N"  # Network (always network-based for NIDS)
        au = "N"  # No authentication required
        ui = "N"  # No user interaction
        scope = sig_props.get('scope', 'Changed')
        scope_abbr = "C" if scope == "Changed" else "U"
        impact = sig_props.get('impact', 'MEDIUM')
        impact_abbr = "H" if impact == "CRITICAL" else "M"
        
        return f"CVSS:3.1/AV:{av}/AU:{au}/UI:{ui}/S:{scope_abbr}/C:{impact_abbr}/I:{impact_abbr}/A:{impact_abbr}"
    
    def _analyze_context(self, alert: Dict, threat_intel: Optional[Dict]) -> Dict:
        """Analyze attack context"""
        context = {
            'source_ip': alert.get('src_ip'),
            'destination_ip': alert.get('dst_ip'),
            'protocol': alert.get('protocol'),
            'port': alert.get('dst_port'),
            'payload_size': len(alert.get('payload', '')),
            'repeated_attack': alert.get('packet_count', 0) > 1,
        }
        
        if threat_intel:
            context['threat_intel'] = {
                'ip_reputation': threat_intel.get('reputation', {}).get('confidence_score', 0),
                'is_vpn': threat_intel.get('geolocation', {}).get('is_vpn', False),
                'country': threat_intel.get('geolocation', {}).get('country_code', 'XX'),
            }
        
        return context
    
    def _identify_pattern(self, signature_id: str) -> str:
        """Identify attack pattern type"""
        for pattern_name, pattern_info in self.attack_patterns.items():
            if any(sig in signature_id for sig in pattern_info['signatures']):
                return pattern_info['pattern']
        return "Single vector attack"
    
    def _generate_recommendations(self, 
                                 threat_cat: ThreatCategory,
                                 cvss: CVSSLikeScore,
                                 context: Dict) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        severity = cvss.severity_level()
        
        # Severity-based actions
        if severity == SeverityLevel.CRITICAL:
            recommendations.append("🚨 IMMEDIATE ACTION: Block source IP at firewall")
            recommendations.append("Isolate affected system from network")
            recommendations.append("Initiate incident response procedures")
            recommendations.append("Preserve evidence for forensic analysis")
        
        elif severity == SeverityLevel.HIGH:
            recommendations.append("⚠️ URGENT: Review recent activity from source")
            recommendations.append("Implement temporary firewall rule if possible")
            recommendations.append("Monitor for similar patterns")
        
        elif severity == SeverityLevel.MEDIUM:
            recommendations.append("⚡ INVESTIGATE: Analyze traffic pattern")
            recommendations.append("Check system logs for unauthorized access")
        
        # Category-specific actions
        if threat_cat == ThreatCategory.SQL_INJECTION:
            recommendations.append("Review database access logs")
            recommendations.append("Check for data modifications")
            recommendations.append("Apply SQL parameterization to vulnerable code")
        
        elif threat_cat == ThreatCategory.XSS:
            recommendations.append("Review web server logs")
            recommendations.append("Implement input validation")
            recommendations.append("Apply output encoding")
        
        elif threat_cat == ThreatCategory.DDoS:
            recommendations.append("Activate DDoS mitigation")
            recommendations.append("Contact ISP if needed")
            recommendations.append("Scale infrastructure temporarily")
        
        elif threat_cat == ThreatCategory.BRUTE_FORCE:
            recommendations.append("Enable account lockout")
            recommendations.append("Reset potentially compromised passwords")
            recommendations.append("Enable MFA")
        
        elif threat_cat == ThreatCategory.MALWARE:
            recommendations.append("Initiate endpoint isolation")
            recommendations.append("Run full system scan")
            recommendations.append("Check for lateral movement")
        
        # Context-based
        if context.get('repeated_attack'):
            recommendations.append("Pattern indicates coordinated attack - escalate alert")
        
        if context.get('threat_intel', {}).get('is_vpn'):
            recommendations.append("Source using VPN - may indicate advanced attacker")
        
        return recommendations
    
    def _calculate_fp_probability(self, alert: Dict, threat_cat: ThreatCategory) -> float:
        """
        Calculate false positive probability (0-100%)
        Lower is better
        """
        fp_prob = 0.0
        
        # Category-specific baseline
        category_fp_rates = {
            ThreatCategory.PORT_SCANNING: 35.0,  # High FP rate
            ThreatCategory.DATA_EXFILTRATION: 20.0,
            ThreatCategory.RECONNAISSANCE: 25.0,
            ThreatCategory.SQL_INJECTION: 5.0,  # Low FP rate
            ThreatCategory.MALWARE: 2.0,  # Very low
            ThreatCategory.BUFFER_OVERFLOW: 3.0,
            ThreatCategory.COMMAND_INJECTION: 4.0,
        }
        
        fp_prob = category_fp_rates.get(threat_cat, 15.0)
        
        # Reduce FP if we have threat intel confirmation
        if alert.get('threat_intel'):
            fp_prob *= 0.5
        
        # Increase FP if payload is ambiguous
        if len(alert.get('payload', '')) < 10:
            fp_prob += 5.0
        
        return min(95.0, max(0.0, fp_prob))
    
    def classify_batch(self, 
                      alerts: List[Dict],
                      threat_intel_map: Optional[Dict[str, Dict]] = None) -> List[AlertClassification]:
        """Classify multiple alerts efficiently"""
        threat_intel_map = threat_intel_map or {}
        classified = []
        
        for alert in alerts:
            threat_intel = threat_intel_map.get(alert.get('src_ip'))
            classified.append(self.classify(alert, threat_intel))
        
        return classified


# Example usage
if __name__ == "__main__":
    classifier = AlertClassifier()
    
    # Test alert
    test_alert = {
        'id': 'alert_001',
        'signature_id': 'SQL_UNION_SELECT',
        'src_ip': '192.168.1.100',
        'dst_ip': '10.0.0.1',
        'dst_port': 3306,
        'protocol': 'TCP',
        'payload': "' UNION SELECT * FROM users--",
        'confidence': 85.0,
        'packet_count': 2,
    }
    
    # Test threat intel
    test_threat_intel = {
        'reputation': {'confidence_score': 65},
        'threat_level': 'HIGH',
        'geolocation': {
            'country_code': 'RU',
            'is_vpn': True,
        }
    }
    
    print("="*60)
    print("ALERT CLASSIFIER TEST")
    print("="*60)
    
    classification = classifier.classify(test_alert, test_threat_intel)
    
    print(f"\n🎯 Classification Result:")
    print(f"Category: {classification.threat_category.value}")
    print(f"Severity: {classification.severity.name}")
    print(f"CVSS Score: {classification.cvss_score.final_score:.1f}")
    print(f"Confidence: {classification.confidence:.1f}%")
    print(f"False Positive Probability: {classification.false_positive_probability:.1f}%")
    print(f"\nOWASP Mapping: {', '.join(classification.owasp_mapping)}")
    print(f"\nAttack Pattern: {classification.attack_pattern}")
    print(f"\nRecommendations:")
    for rec in classification.recommendations:
        print(f"  • {rec}")
