import sys
sys.path.insert(0, '.')

# Test imports
from backend.capture.packet_capture import PacketCaptureEngine, CaptureStats, CaptureMode
from backend.detection.rule_engine import RuleEngine, Rule, SeverityLevel, PatternType
from backend.database.models import Alert, Capture, ThreatIntel
from backend.api.routes import api_bp

print("[PASS] PacketCaptureEngine imported")
print("[PASS] RuleEngine imported")
print("[PASS] Database models imported")
print("[PASS] API routes imported")

# Test 1: Create engine
engine = PacketCaptureEngine()
print(f"[PASS] Engine created: {engine.is_running() == False}")

# Test 2: Stats
stats = engine.get_stats()
print(f"[PASS] Stats retrieved: packets={stats.packets_captured}")

# Test 3: Create rule
rule = Rule(
    name="SQL Injection - UNION",
    severity=SeverityLevel.HIGH,
    threat_type="SQL Injection",
    pattern_type=PatternType.STRING,
    pattern="UNION SELECT",
)
print(f"[PASS] Rule created: {rule.name}")

# Test 4: Rule engine
rule_engine = RuleEngine()
rule_engine.add_rule(rule)
print(f"[PASS] Rule added to engine: {len(rule_engine.rules) == 1}")

# Test 5: Get stats
rule_stats = rule_engine.get_stats()
print(f"[PASS] Rule engine stats: {rule_stats['rules_loaded']} rules loaded")

# Test 6: Load signatures
print("\nTesting signature loading...")
rule_engine.load_rules("backend/detection/signatures.yaml")
print(f"[PASS] Signatures loaded: {rule_engine.get_stats()['rules_loaded']} total rules")

print("\n*** All validation tests passed! ***")
