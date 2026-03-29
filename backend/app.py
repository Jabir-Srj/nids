"""
NIDS Backend Main Application
Flask server with API endpoints for network intrusion detection
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from capture.packet_capture import PacketCaptureEngine
from detection.rule_engine import RuleEngine
from ml.anomaly_detector import AnomalyDetector
from api.routes import api_bp, init_api
from api.ai import ai_bp

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_name="development"):
    """Application factory"""
    app = Flask(__name__)
    
    # Load config
    try:
        if config_name == "development":
            app.config['DEBUG'] = True
            app.config['API_HOST'] = '0.0.0.0'
            app.config['API_PORT'] = 5000
    except Exception as e:
        logger.warning(f"Config not found: {e}")
    
    # CORS setup
    CORS(app, origins=["*"], methods=["GET", "POST", "PUT", "DELETE"])
    
    # Initialize detection engines
    try:
        capture_engine = PacketCaptureEngine(buffer_size=10000)
        rule_engine = RuleEngine()
        anomaly_detector = AnomalyDetector(contamination=0.1)
        
        # Load detection rules
        rules_file = os.path.join(os.path.dirname(__file__), "detection", "signatures.yaml")
        if os.path.exists(rules_file):
            rule_engine.load_rules(rules_file)
            logger.info(f"✅ Loaded {rule_engine.rule_count} detection rules")
        else:
            logger.warning(f"Signatures file not found: {rules_file}")
        
        # Initialize API with engines
        init_api(capture_engine, rule_engine, anomaly_detector)
        
    except Exception as e:
        logger.error(f"Failed to initialize engines: {e}")
        raise
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(ai_bp)
    
    # Health check endpoint
    @app.route("/health")
    def health():
        return jsonify({
            "status": "healthy",
            "version": "1.0.0",
            "components": {
                "capture": "ready",
                "detection": "ready",
                "ml": "ready",
                "api": "ready"
            }
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"status": "error", "message": "Endpoint not found"}), 404
    
    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    
    logger.info("✅ NIDS Backend Initialized Successfully")
    return app

if __name__ == "__main__":
    try:
        app = create_app()
        
        # Get config
        host = os.getenv("API_HOST", "0.0.0.0")
        port = int(os.getenv("API_PORT", 5000))
        debug = os.getenv("DEBUG", "True").lower() == "true"
        
        print("\n" + "="*60)
        print("NIDS Backend Server Starting...")
        print("="*60)
        print(f"Running on http://{host}:{port}")
        print(f"Debug Mode: {debug}")
        print("="*60 + "\n")
        
        app.run(host=host, port=port, debug=debug, threaded=True)
        
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

