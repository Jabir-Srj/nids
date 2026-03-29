"""
Advanced Threat Intelligence Integration
VirusTotal, IPQualityScore, URLhaus, CVSS, etc.
"""

import os
from typing import Dict, Any, Optional, List
import requests
from datetime import datetime, timedelta

class ThreatIntelligence:
    """Integrate multiple threat intelligence sources"""
    
    def __init__(self):
        self.vt_api_key = os.getenv('VIRUSTOTAL_API_KEY')
        self.iqscore_api_key = os.getenv('IPQUALITYSCORE_API_KEY')
        self.abuse_api_key = os.getenv('ABUSEIPDB_API_KEY')
        self.cache = {}
        self.cache_ttl = timedelta(hours=24)
    
    def analyze_threat(self, threat_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive threat analysis"""
        results = {
            'threat_data': threat_data,
            'intelligence': {},
            'cvss_score': 0,
            'risk_level': 'unknown',
        }
        
        # IP Reputation
        if threat_data.get('source_ip'):
            results['intelligence']['ip_reputation'] = self.check_ip_reputation(threat_data['source_ip'])
        
        # URL Analysis
        if threat_data.get('payload'):
            results['intelligence']['url_analysis'] = self.check_urls(threat_data['payload'])
        
        # CVSS Score
        results['cvss_score'] = self.calculate_cvss_score(threat_data)
        results['risk_level'] = self._determine_risk_level(results['cvss_score'])
        
        return results
    
    def check_ip_reputation(self, ip_address: str) -> Dict[str, Any]:
        """Check IP reputation from multiple sources"""
        cache_key = f"ip_rep_{ip_address}"
        
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_ttl:
                return cached_data
        
        result = {
            'ip': ip_address,
            'abuseipdb': self._check_abuseipdb(ip_address),
            'ipqualityscore': self._check_ipqualityscore(ip_address),
            'checked_at': datetime.now().isoformat(),
        }
        
        self.cache[cache_key] = (result, datetime.now())
        return result
    
    def _check_abuseipdb(self, ip_address: str) -> Dict[str, Any]:
        """Check AbuseIPDB"""
        try:
            if not self.abuse_api_key:
                return {'status': 'unconfigured'}
            
            headers = {
                'Key': self.abuse_api_key,
                'Accept': 'application/json',
            }
            
            params = {
                'ipAddress': ip_address,
                'maxAgeInDays': 90,
                'verbose': True,
            }
            
            response = requests.get(
                'https://api.abuseipdb.com/api/v2/check',
                headers=headers,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()['data']
                return {
                    'status': 'found',
                    'abuse_score': data.get('abuseConfidenceScore', 0),
                    'total_reports': data.get('totalReports', 0),
                    'last_reported': data.get('lastReportedAt'),
                }
            
            return {'status': 'error', 'message': f"Status {response.status_code}"}
        
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def _check_ipqualityscore(self, ip_address: str) -> Dict[str, Any]:
        """Check IPQualityScore"""
        try:
            if not self.iqscore_api_key:
                return {'status': 'unconfigured'}
            
            url = f"https://ipqualityscore.com/api/json/ip/{self.iqscore_api_key}/{ip_address}"
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'status': 'found',
                    'fraud_score': data.get('fraud_score', 0),
                    'is_crawler': data.get('is_crawler', False),
                    'is_vpn': data.get('is_vpn', False),
                    'is_proxy': data.get('is_proxy', False),
                    'is_bot': data.get('is_bot', False),
                    'country': data.get('country_code'),
                }
            
            return {'status': 'error', 'message': f"Status {response.status_code}"}
        
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def check_urls(self, payload: str, max_urls: int = 5) -> List[Dict[str, Any]]:
        """Extract and check URLs in payload"""
        import re
        
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, payload)
        
        results = []
        for url in urls[:max_urls]:
            result = self._check_urlhaus(url)
            if result:
                results.append(result)
        
        return results
    
    def _check_urlhaus(self, url: str) -> Optional[Dict[str, Any]]:
        """Check URLhaus for malicious URLs"""
        try:
            data = {'url': url}
            
            response = requests.post(
                'https://urlhaus-api.abuse.ch/v1/url/',
                data=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('query_status') == 'ok':
                    return {
                        'url': url,
                        'status': result.get('query_status'),
                        'threat': result.get('threat'),
                        'malware_family': result.get('malware'),
                        'last_analysis': result.get('date_indexed'),
                    }
            
            return None
        
        except Exception as e:
            print(f"URLhaus check error: {e}")
            return None
    
    def calculate_cvss_score(self, threat_data: Dict[str, Any]) -> float:
        """Calculate CVSS 3.1 score"""
        score = 0.0
        
        # Attack Vector (Network = 0.85, Adjacent = 0.62, Local = 0.55, Physical = 0.2)
        if threat_data.get('protocol') in ['TCP', 'UDP', 'ICMP']:
            score += 0.85
        else:
            score += 0.55
        
        # Attack Complexity (Low = 0.77, High = 0.44)
        if threat_data.get('threat_type') in ['DDoS', 'Brute Force']:
            score += 0.44
        else:
            score += 0.77
        
        # Privileges Required (None = 0.85, Low = 0.62, High = 0.27)
        if threat_data.get('threat_type') in ['SQL Injection', 'XSS']:
            score += 0.85
        else:
            score += 0.62
        
        # User Interaction (None = 0.85, Required = 0.62)
        if threat_data.get('threat_type') in ['Malware', 'Phishing']:
            score += 0.62
        else:
            score += 0.85
        
        # Severity modifiers
        if threat_data.get('severity') == 'critical':
            score *= 1.2
        elif threat_data.get('severity') == 'high':
            score *= 1.1
        elif threat_data.get('severity') == 'low':
            score *= 0.9
        
        # Cap at 10.0
        return min(score, 10.0)
    
    def _determine_risk_level(self, cvss_score: float) -> str:
        """Determine risk level from CVSS score"""
        if cvss_score >= 9.0:
            return 'critical'
        elif cvss_score >= 7.0:
            return 'high'
        elif cvss_score >= 4.0:
            return 'medium'
        else:
            return 'low'
    
    def get_threat_feeds(self) -> Dict[str, Any]:
        """Fetch latest threat feeds"""
        return {
            'urlhaus_feeds': self._fetch_urlhaus_feeds(),
            'abuseipdb_feeds': self._fetch_abuseipdb_feeds(),
            'malware_families': self._fetch_malware_families(),
        }
    
    def _fetch_urlhaus_feeds(self) -> List[Dict[str, Any]]:
        """Fetch URLhaus recent malware"""
        try:
            response = requests.get(
                'https://urlhaus-api.abuse.ch/v1/urls/recent/',
                params={'limit': 10},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get('urls', [])
        
        except Exception as e:
            print(f"URLhaus feeds error: {e}")
        
        return []
    
    def _fetch_abuseipdb_feeds(self) -> List[Dict[str, Any]]:
        """Fetch AbuseIPDB recent reports"""
        try:
            if not self.abuse_api_key:
                return []
            
            headers = {'Key': self.abuse_api_key}
            
            response = requests.get(
                'https://api.abuseipdb.com/api/v2/blacklist/',
                headers=headers,
                params={'plaintext': True, 'limit': 10},
                timeout=10
            )
            
            if response.status_code == 200:
                ips = response.text.strip().split('\n')
                return [{'ip': ip} for ip in ips if ip]
        
        except Exception as e:
            print(f"AbuseIPDB feeds error: {e}")
        
        return []
    
    def _fetch_malware_families(self) -> List[str]:
        """Get common malware families"""
        return [
            'Trojan',
            'Ransomware',
            'Worm',
            'Rootkit',
            'Botnet',
            'Spyware',
            'Adware',
            'PUP (Potentially Unwanted Program)',
        ]
