"""
🔗 NIDS Security Integration Module
Orchestrates threat signatures, threat intel, and alert classification
Provides unified API for all security modules
"""

import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import yaml

from threat_intel.threat_intel import ThreatIntelligence
from detection.classifier import AlertClassifier

logger = logging.getLogger(__name__)


class SecurityOrchestrator:
    """Master orchestrator for all security modules"""
    
    def __init__(self, signatures_file: str = "detection/signatures.yaml"):
        self.ti = ThreatIntelligence()
        self.classifier = AlertClassifier()
        self.signatures = self._load_signatures(signatures_file)
        self.signature_index = self._build_index()
        logger.info("Security Orchestrator initialized")
    
    def _load_signatures(self, filepath: str) -> Dict:
        """Load signature rules from YAML"""
        try:
            with open(filepath, 'r') as f:
                data = yaml.safe_load(f)
            logger.info(f"Loaded signatures from {filepath}")
            return data
        except Exception as e:
            logger.error(f"Failed to load signatures: {e}")
            return {}
    
    def _build_index(self) -> Dict:
        """Build searchable index of signatures for quick lookup"""
        index = {
            'by_id': {},
            'by_category': {},
            'by_severity': {},
        }
        
        for category, sigs in self.signatures.items():
            if category == 'metadata':
                continue
            if not isinstance(sigs, list):
                continue
            
            for sig in sigs:
                sig_id = sig.get('id')
                if sig_id:
                    index['by_id'][sig_id] = sig
                
                severity = sig.get('severity')
                if severity:
                    if severity not in index['by_severity']:
                        index['by_severity'][severity] = []
                    index['by_severity'][severity].append(sig_id)
        
        logger.info(f"Built index with {len(index['by_id'])} signatures")
        return index
    
    def process_alert(self, 
                     alert: Dict,
                     enriched: bool = True) -> Dict:
        """
        Process raw alert through full pipeline:
        1. Signature lookup
        2. Threat intelligence enrichment
        3. Classification & scoring
        
        Args:
            alert: Raw alert from detection engine
            enriched: Whether to enrich with threat intel
        
        Returns:
            Fully processed alert with classification and recommendations
        """
        sig_id = alert.get('signature_id')
        logger.info(f"Processing alert: {sig_id}")
        
        # Lookup signature details
        sig_details = self.signature_index['by_id'].get(sig_id, {})
        
        # Enrich with threat intelligence if enabled
        threat_intel = None
        if enriched and alert.get('src_ip'):
            threat_intel = self.ti.analyze_ip(alert['src_ip'])
        
        # Classify alert
        classification = self.classifier.classify(alert, threat_intel)
        
        # Build complete result
        result = {
            'alert_id': alert.get('id'),
            'timestamp': datetime.now().isoformat(),
            'signature': sig_details,
            'threat_intelligence': threat_intel,
            'classification': {
                'category': classification.threat_category.value,
                'severity': classification.severity.name,
                'cvss_score': classification.cvss_score.final_score,
                'confidence': classification.confidence,
                'false_positive_probability': classification.false_positive_probability,
                'owasp_mapping': classification.owasp_mapping,
                'attack_pattern': classification.attack_pattern,
            },
            'recommendations': classification.recommendations,
            'context': classification.context,
        }
        
        logger.info(f"Alert processed: {classification.severity.name}")
        return result
    
    def get_statistics(self) -> Dict:
        """Get statistics about loaded signatures and modules"""
        return {
            'signatures': {
                'total': len(self.signature_index['by_id']),
                'by_severity': {
                    'CRITICAL': len(self.signature_index['by_severity'].get('CRITICAL', [])),
                    'HIGH': len(self.signature_index['by_severity'].get('HIGH', [])),
                    'MEDIUM': len(self.signature_index['by_severity'].get('MEDIUM', [])),
                    'LOW': len(self.signature_index['by_severity'].get('LOW', [])),
                },
            },
            'threat_intel': self.ti.get_stats(),
            'timestamp': datetime.now().isoformat(),
        }


# Export classes
__all__ = ['SecurityOrchestrator', 'ThreatIntelligence', 'AlertClassifier']
