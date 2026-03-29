"""
Pytest configuration and fixtures for NIDS backend tests
"""
import os
import pytest
import tempfile
from pathlib import Path
from flask import Flask

# Test environment
os.environ['FLASK_ENV'] = 'testing'
os.environ['TESTING'] = 'true'

@pytest.fixture(scope='session')
def app():
    """Create application for testing"""
    from app import create_app
    app = create_app('testing')
    
    with app.app_context():
        from database.models import db
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Test client fixture"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """CLI runner fixture"""
    return app.test_cli_runner()

@pytest.fixture
def temp_dir():
    """Temporary directory for test files"""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)

@pytest.fixture
def sample_pcap(temp_dir):
    """Sample PCAP file for testing"""
    pcap_path = temp_dir / "sample.pcap"
    # Create a minimal valid PCAP file
    import struct
    
    # PCAP global header
    magic = 0xa1b2c3d4
    version_major = 2
    version_minor = 4
    thiszone = 0
    sigfigs = 0
    snaplen = 65535
    network = 1  # Ethernet
    
    header = struct.pack('<IHHIIII',
        magic, version_major, version_minor, thiszone,
        sigfigs, snaplen, network
    )
    
    with open(pcap_path, 'wb') as f:
        f.write(header)
    
    return pcap_path

@pytest.fixture
def mock_alert():
    """Mock alert for testing"""
    return {
        'src_ip': '192.168.1.1',
        'dst_ip': '192.168.1.2',
        'src_port': 12345,
        'dst_port': 80,
        'protocol': 'TCP',
        'threat_type': 'Port Scan',
        'severity': 'HIGH',
        'signature': 'SYN-FLOOD',
        'payload': 'test payload'
    }

@pytest.fixture
def mock_packet_data():
    """Mock packet data for testing"""
    return {
        'timestamp': '2026-03-29T10:00:00Z',
        'src_ip': '192.168.1.1',
        'dst_ip': '192.168.1.2',
        'src_port': 12345,
        'dst_port': 80,
        'protocol': 'TCP',
        'flags': 'SYN',
        'payload': b'test payload'
    }
