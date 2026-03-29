"""
🔍 Threat Intelligence Module
Integrates multiple threat intel sources: AbuseIPDB, NVD, MaxMind, IP reputation

Features:
- AbuseIPDB IP reputation checking
- NVD CVE database lookup
- MaxMind geolocation (free tier)
- IP reputation aggregation
- Caching with TTL
- Graceful API degradation
- Rate limiting handling
"""

import os
import json
import sqlite3
import requests
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from functools import lru_cache
from collections import defaultdict
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ThreatIntelligenceCache:
    """Efficient caching layer with TTL and SQLite backend"""
    
    def __init__(self, cache_dir: str = "./cache", ttl_hours: int = 24):
        self.cache_dir = cache_dir
        self.ttl_hours = ttl_hours
        self.ttl_seconds = ttl_hours * 3600
        self._ensure_cache_dir()
        self._init_cache_db()
    
    def _ensure_cache_dir(self):
        """Create cache directory if not exists"""
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def _init_cache_db(self):
        """Initialize SQLite cache database"""
        self.db_path = os.path.join(self.cache_dir, "threat_intel_cache.db")
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cache (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ttl_seconds INTEGER
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp ON cache(timestamp)
            """)
            conn.commit()
            conn.close()
            logger.info(f"Cache database initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to initialize cache DB: {e}")
    
    def set(self, key: str, value: Dict, ttl_override: Optional[int] = None):
        """Cache a value with TTL"""
        try:
            ttl = ttl_override or self.ttl_seconds
            conn = sqlite3.connect(self.db_path)
            conn.execute("""
                INSERT OR REPLACE INTO cache (key, value, timestamp, ttl_seconds)
                VALUES (?, ?, CURRENT_TIMESTAMP, ?)
            """, (key, json.dumps(value), ttl))
            conn.commit()
            conn.close()
            logger.debug(f"Cached: {key}")
        except Exception as e:
            logger.error(f"Cache set failed for {key}: {e}")
    
    def get(self, key: str) -> Optional[Dict]:
        """Retrieve cached value if not expired"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.execute("""
                SELECT value, timestamp, ttl_seconds FROM cache WHERE key = ?
            """, (key,))
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                return None
            
            value, timestamp, ttl = row
            cached_time = datetime.fromisoformat(timestamp)
            now = datetime.now()
            
            # Check if expired
            if (now - cached_time).total_seconds() > ttl:
                self._delete(key)
                return None
            
            logger.debug(f"Cache hit: {key}")
            return json.loads(value)
        except Exception as e:
            logger.error(f"Cache get failed for {key}: {e}")
            return None
    
    def _delete(self, key: str):
        """Delete cached entry"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("DELETE FROM cache WHERE key = ?", (key,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Cache delete failed: {e}")
    
    def cleanup_expired(self):
        """Remove all expired entries"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("""
                DELETE FROM cache WHERE 
                (julianday('now') - julianday(timestamp)) * 86400 > ttl_seconds
            """)
            conn.commit()
            conn.close()
            logger.info("Cleaned up expired cache entries")
        except Exception as e:
            logger.error(f"Cache cleanup failed: {e}")


class AbuseIPDBClient:
    """AbuseIPDB API integration (free tier: 1000 requests/day)"""
    
    def __init__(self, api_key: str = "", cache: ThreatIntelligenceCache = None):
        self.api_key = api_key or os.getenv('ABUSEIPDB_API_KEY', '')
        self.base_url = "https://api.abuseipdb.com/api/v2"
        self.cache = cache
        self.rate_limit_remaining = 1000
        self.rate_limit_reset = None
    
    def check_ip(self, ip: str, days: int = 90) -> Dict:
        """
        Check IP reputation on AbuseIPDB
        Returns: {status, abuseConfidenceScore, totalReports, lastReportedAt, reports}
        """
        cache_key = f"abuseipdb_{ip}"
        
        # Check cache first
        if self.cache:
            cached = self.cache.get(cache_key)
            if cached:
                return cached
        
        # Rate limit check
        if not self.api_key:
            logger.warning("AbuseIPDB API key not configured")
            return {
                'status': 'degraded',
                'error': 'API key not configured',
                'confidence_score': 0
            }
        
        try:
            headers = {'Key': self.api_key, 'Accept': 'application/json'}
            params = {'ipAddress': ip, 'maxAgeInDays': days}
            
            response = requests.get(
                f"{self.base_url}/check",
                headers=headers,
                params=params,
                timeout=5
            )
            
            # Handle rate limiting
            if response.status_code == 429:
                reset_time = response.headers.get('X-RateLimit-Reset')
                logger.warning(f"AbuseIPDB rate limited. Reset: {reset_time}")
                return {'status': 'rate_limited', 'confidence_score': 0}
            
            if response.status_code != 200:
                logger.error(f"AbuseIPDB error {response.status_code}: {response.text}")
                return {'status': 'error', 'confidence_score': 0}
            
            data = response.json()
            result = {
                'status': 'success',
                'ip': data['data']['ipAddress'],
                'confidence_score': data['data']['abuseConfidenceScore'],
                'total_reports': data['data']['totalReports'],
                'last_reported': data['data']['lastReportedAt'],
                'is_whitelisted': data['data']['isWhitelisted'],
                'threat_level': self._calculate_threat_level(data['data']['abuseConfidenceScore']),
                'reports': data['data']['reports'][:5] if data['data']['reports'] else []  # Top 5
            }
            
            if self.cache:
                self.cache.set(cache_key, result, ttl_override=86400)  # 24h TTL
            
            return result
        
        except requests.Timeout:
            logger.error(f"AbuseIPDB timeout for {ip}")
            return {'status': 'timeout', 'confidence_score': 0}
        except Exception as e:
            logger.error(f"AbuseIPDB check failed for {ip}: {e}")
            return {'status': 'error', 'confidence_score': 0}
    
    def _calculate_threat_level(self, confidence_score: int) -> str:
        """Convert confidence score to threat level"""
        if confidence_score >= 75:
            return "CRITICAL"
        elif confidence_score >= 50:
            return "HIGH"
        elif confidence_score >= 25:
            return "MEDIUM"
        else:
            return "LOW"


class NVDClient:
    """NVD CVE Database API (free tier: no API key needed)"""
    
    def __init__(self, cache: ThreatIntelligenceCache = None):
        self.base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
        self.cache = cache
    
    def search_cve(self, keyword: str) -> List[Dict]:
        """
        Search CVE database by keyword
        Returns: List of CVE entries with CVSS scores
        """
        cache_key = f"nvd_cve_{hashlib.md5(keyword.encode()).hexdigest()}"
        
        if self.cache:
            cached = self.cache.get(cache_key)
            if cached:
                return cached
        
        try:
            params = {'keywordSearch': keyword, 'resultsPerPage': 10}
            response = requests.get(
                self.base_url,
                params=params,
                timeout=10,
                headers={'User-Agent': 'NIDS/2.0'}
            )
            
            if response.status_code != 200:
                logger.error(f"NVD API error {response.status_code}")
                return []
            
            data = response.json()
            results = []
            
            for vuln in data.get('vulnerabilities', [])[:10]:  # Top 10
                cve_id = vuln['cve']['id']
                cvss_data = vuln['cve'].get('metrics', {})
                cvss_v3 = cvss_data.get('cvssMetricV31', [{}])[0].get('cvssData', {})
                
                results.append({
                    'cve_id': cve_id,
                    'description': vuln['cve'].get('descriptions', [{}])[0].get('value', ''),
                    'published': vuln['cve'].get('published', ''),
                    'base_score': cvss_v3.get('baseScore', 0),
                    'severity': cvss_v3.get('baseSeverity', 'UNKNOWN'),
                    'attack_vector': cvss_v3.get('attackVector', ''),
                })
            
            if self.cache:
                self.cache.set(cache_key, results, ttl_override=604800)  # 7 days TTL
            
            return results
        
        except Exception as e:
            logger.error(f"NVD search failed for {keyword}: {e}")
            return []
    
    def get_cve_details(self, cve_id: str) -> Dict:
        """Fetch detailed CVE information"""
        cache_key = f"nvd_detail_{cve_id}"
        
        if self.cache:
            cached = self.cache.get(cache_key)
            if cached:
                return cached
        
        try:
            params = {'cveId': cve_id}
            response = requests.get(
                self.base_url,
                params=params,
                timeout=10,
                headers={'User-Agent': 'NIDS/2.0'}
            )
            
            if response.status_code != 200:
                return {'status': 'error', 'cve_id': cve_id}
            
            vuln = response.json()['vulnerabilities'][0]['cve']
            
            result = {
                'cve_id': vuln['id'],
                'description': vuln.get('descriptions', [{}])[0].get('value', ''),
                'published': vuln.get('published', ''),
                'modified': vuln.get('lastModified', ''),
                'references': [ref['url'] for ref in vuln.get('references', [])],
                'status': 'found'
            }
            
            if self.cache:
                self.cache.set(cache_key, result, ttl_override=604800)
            
            return result
        
        except Exception as e:
            logger.error(f"NVD detail fetch failed for {cve_id}: {e}")
            return {'status': 'error', 'cve_id': cve_id}


class MaxMindClient:
    """MaxMind GeoIP2 Lite API (free tier)"""
    
    def __init__(self, cache: ThreatIntelligenceCache = None):
        self.cache = cache
        # Uses free GeoIP2-lite database (can be self-hosted)
        self.db_path = os.getenv('MAXMIND_DB_PATH', '')
    
    def get_geolocation(self, ip: str) -> Dict:
        """Get geolocation for IP"""
        cache_key = f"maxmind_geo_{ip}"
        
        if self.cache:
            cached = self.cache.get(cache_key)
            if cached:
                return cached
        
        try:
            # For free tier, use public GeoIP API
            response = requests.get(
                f"https://ipapi.co/{ip}/json/",
                timeout=5,
                headers={'User-Agent': 'NIDS/2.0'}
            )
            
            if response.status_code != 200:
                logger.warning(f"GeoIP lookup failed for {ip}")
                return {'status': 'error', 'ip': ip}
            
            data = response.json()
            result = {
                'status': 'success',
                'ip': ip,
                'country': data.get('country_name', 'Unknown'),
                'country_code': data.get('country_code', ''),
                'city': data.get('city', 'Unknown'),
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'isp': data.get('org', 'Unknown'),
                'timezone': data.get('timezone', ''),
                'is_vpn': data.get('is_vpn', False),
                'is_proxy': data.get('is_proxy', False)
            }
            
            if self.cache:
                self.cache.set(cache_key, result, ttl_override=2592000)  # 30 days TTL
            
            return result
        
        except Exception as e:
            logger.error(f"Geolocation lookup failed for {ip}: {e}")
            return {'status': 'error', 'ip': ip}


class ThreatIntelligence:
    """Main Threat Intelligence orchestrator"""
    
    def __init__(self, cache_dir: str = "./cache"):
        self.cache = ThreatIntelligenceCache(cache_dir=cache_dir)
        self.abuseipdb = AbuseIPDBClient(cache=self.cache)
        self.nvd = NVDClient(cache=self.cache)
        self.maxmind = MaxMindClient(cache=self.cache)
        self.request_count = 0
        self.start_time = datetime.now()
    
    def analyze_ip(self, ip: str) -> Dict:
        """
        Comprehensive IP analysis
        <1 second total with caching
        """
        logger.info(f"Analyzing IP: {ip}")
        
        result = {
            'ip': ip,
            'timestamp': datetime.now().isoformat(),
            'reputation': {},
            'geolocation': {},
            'threat_level': 'LOW',
            'recommendations': []
        }
        
        # Parallel checks (in production, use asyncio)
        result['reputation'] = self.abuseipdb.check_ip(ip)
        result['geolocation'] = self.maxmind.get_geolocation(ip)
        
        # Calculate overall threat level
        result['threat_level'] = self._aggregate_threat_level(result)
        result['recommendations'] = self._generate_recommendations(result)
        
        self.request_count += 1
        return result
    
    def check_cve(self, cve_id: str) -> Dict:
        """Check CVE details"""
        logger.info(f"Checking CVE: {cve_id}")
        return self.nvd.get_cve_details(cve_id)
    
    def search_exploits(self, keyword: str) -> List[Dict]:
        """Search for CVE exploits"""
        logger.info(f"Searching exploits for: {keyword}")
        return self.nvd.search_cve(keyword)
    
    def _aggregate_threat_level(self, analysis: Dict) -> str:
        """Aggregate threat level from multiple sources"""
        reputation = analysis['reputation']
        confidence = reputation.get('confidence_score', 0)
        
        if confidence >= 75:
            return "CRITICAL"
        elif confidence >= 50:
            return "HIGH"
        elif confidence >= 25:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_recommendations(self, analysis: Dict) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        threat_level = analysis['threat_level']
        reputation = analysis['reputation']
        geo = analysis['geolocation']
        
        if threat_level == "CRITICAL":
            recommendations.append("🚨 BLOCK IP IMMEDIATELY - High confidence malicious activity")
            recommendations.append("Review all connections from this IP in last 24 hours")
            recommendations.append("Check for data exfiltration")
        elif threat_level == "HIGH":
            recommendations.append("⚠️ INVESTIGATE URGENTLY - Multiple abuse reports")
            recommendations.append("Consider blocking at firewall")
        elif threat_level == "MEDIUM":
            recommendations.append("⚡ Monitor closely - Suspicious but not conclusive")
            recommendations.append("Increase logging verbosity for this IP")
        
        # Geographic anomaly
        if geo.get('status') == 'success':
            geo_country = geo.get('country_code', '')
            if geo_country and geo.get('is_vpn'):
                recommendations.append(f"🌍 VPN/Proxy detected from {geo.get('country')}")
        
        # Report history
        if reputation.get('total_reports', 0) > 10:
            recommendations.append(f"⚠️ {reputation['total_reports']} abuse reports on file")
        
        return recommendations
    
    def get_stats(self) -> Dict:
        """Get TI module statistics"""
        runtime = (datetime.now() - self.start_time).total_seconds()
        return {
            'requests_processed': self.request_count,
            'runtime_seconds': runtime,
            'avg_request_time': runtime / max(self.request_count, 1),
            'cache_enabled': True,
            'cache_db': self.cache.db_path
        }


# Example usage / integration test
if __name__ == "__main__":
    ti = ThreatIntelligence()
    
    # Test IP analysis
    print("\n" + "="*60)
    print("THREAT INTELLIGENCE SYSTEM TEST")
    print("="*60)
    
    test_ips = [
        "8.8.8.8",  # Google DNS
        "1.1.1.1",  # Cloudflare DNS
        "192.168.1.1",  # Private
    ]
    
    for ip in test_ips:
        print(f"\n🔍 Analyzing {ip}...")
        analysis = ti.analyze_ip(ip)
        print(json.dumps(analysis, indent=2))
    
    # Test CVE lookup
    print("\n" + "="*60)
    print("CVE LOOKUP TEST")
    print("="*60)
    cve_details = ti.check_cve("CVE-2017-0144")
    print(json.dumps(cve_details, indent=2))
    
    # Stats
    print("\n" + "="*60)
    print("STATISTICS")
    print("="*60)
    print(json.dumps(ti.get_stats(), indent=2))
