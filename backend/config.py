"""
NIDS Backend Configuration
"""

import os
from pathlib import Path

# Project Paths
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "instance" / "nids.db"
UPLOADS_PATH = BASE_DIR / "uploads"

# Flask Configuration
FLASK_ENV = os.getenv("FLASK_ENV", "development")
DEBUG = FLASK_ENV == "development"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-key-change-in-production")

# Database
SQLALCHEMY_DATABASE_URI = f"sqlite:///{DATABASE_PATH}"
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Packet Capture
CAPTURE_INTERFACE = os.getenv("CAPTURE_INTERFACE", "eth0")  # Change for your interface
PACKET_BUFFER_SIZE = 10000
CAPTURE_FILTER = ""  # Leave empty for all traffic

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 5000))
API_WORKERS = int(os.getenv("API_WORKERS", 4))

# CORS
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]

# Threat Intelligence APIs
ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY", "")
MAXMIND_API_KEY = os.getenv("MAXMIND_API_KEY", "")
NVD_API_KEY = os.getenv("NVD_API_KEY", "")

# ML Models
ML_MODEL_PATH = BASE_DIR / "models" / "anomaly_detector.pkl"
ML_SCALER_PATH = BASE_DIR / "models" / "scaler.pkl"
ML_ANOMALY_THRESHOLD = 0.7  # Confidence threshold (0-1)

# Detection Rules
SIGNATURES_FILE = BASE_DIR / "detection" / "signatures.yaml"

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = BASE_DIR / "logs" / "nids.log"

# Performance
MAX_ALERTS_PER_HOUR = 100000
ALERT_RETENTION_DAYS = 30
DATABASE_CLEANUP_INTERVAL = 86400  # 24 hours

# Features
ENABLE_THREAT_INTEL = True
ENABLE_ML_DETECTION = True
ENABLE_EXPORT = True
MAX_EXPORT_SIZE = 50 * 1024 * 1024  # 50MB

print("✅ NIDS Configuration Loaded")
