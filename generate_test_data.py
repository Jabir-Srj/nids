#!/usr/bin/env python
"""Generate test data for NIDS backend"""

import requests
import random
import json
from datetime import datetime, timedelta
from typing import List

BASE_URL = "http://localhost:5000/api"

THREAT_TYPES = [
    "SQL Injection", "XSS", "Port Scanning", "DDoS",
    "Brute Force", "Malware", "XXE", "Buffer Overflow",
    "DNS Abuse", "Data Exfiltration"
]

SEVERITIES = ["critical", "high", "medium", "low"]

def generate_alerts(count: int = 20) -> None:
    """Generate test alerts"""
    print(f"Generating {count} test alerts...")
    
    for i in range(count):
        timestamp = datetime.now() - timedelta(minutes=random.randint(0, 120))
        
        alert = {
            "type": random.choice(THREAT_TYPES),
            "severity": random.choice(SEVERITIES),
            "timestamp": timestamp.isoformat(),
            "source_ip": f"192.168.1.{random.randint(1, 254)}",
            "dest_ip": f"10.0.0.{random.randint(1, 254)}",
            "message": f"Threat detected: {random.choice(THREAT_TYPES)}",
            "confidence": round(random.uniform(0.7, 1.0), 2),
            "packet_count": random.randint(10, 1000),
        }
        
        try:
            response = requests.post(f"{BASE_URL}/alerts", json=alert)
            if response.status_code == 201 or response.status_code == 200:
                print(f"  OK Alert {i+1}/{count} created")
            else:
                print(f"  FAIL Alert {i+1} failed: {response.status_code}")
        except Exception as e:
            print(f"  ERROR creating alert: {e}")
    
    print("DONE Alert generation complete!")

def get_alerts() -> None:
    """Fetch and display alerts"""
    try:
        response = requests.get(f"{BASE_URL}/alerts?limit=10")
        if response.status_code == 200:
            data = response.json()
            alerts = data.get("alerts", []) or data
            print(f"\nSTATS Found {len(alerts)} alerts:")
            for alert in alerts[:5]:
                print(f"  * {alert.get('type', 'Unknown')} - {alert.get('severity', 'N/A')} - {alert.get('source_ip', 'N/A')}")
        else:
            print(f"Failed to fetch alerts: {response.status_code}")
    except Exception as e:
        print(f"Error fetching alerts: {e}")

def get_stats() -> None:
    """Fetch and display stats"""
    try:
        response = requests.get(f"{BASE_URL}/stats/overview")
        if response.status_code == 200:
            data = response.json()
            print(f"\nBACKEND Statistics:")
            print(f"  * Total Packets: {data.get('total_packets', 0)}")
            print(f"  * Total Alerts: {data.get('total_alerts', 0)}")
            print(f"  * Severity Distribution: {data.get('severity_distribution', {})}")
            print(f"  * Capture Status: {data.get('capture_status', 'unknown')}")
        else:
            print(f"Failed to fetch stats: {response.status_code}")
    except Exception as e:
        print(f"Error fetching stats: {e}")

def main():
    print("NIDS Test Data Generator\n")
    
    # Generate alerts
    generate_alerts(30)
    
    # Wait a moment
    import time
    time.sleep(1)
    
    # Get results
    get_alerts()
    get_stats()
    
    print("\nDONE Test data generation complete!")
    print("Visit http://localhost:5173 to see the data in the UI")

if __name__ == "__main__":
    main()

