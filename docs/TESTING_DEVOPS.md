# NIDS - DevOps & Testing Setup

This document outlines the DevOps infrastructure, testing strategy, and Docker containerization for the Network Intrusion Detection System (NIDS).

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Docker Setup](#docker-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Deployment](#deployment)
5. [Monitoring](#monitoring)

---

## Testing Strategy

### Test Coverage Goals

- **Overall Coverage**: >85% code coverage
- **Backend**: Unit tests, integration tests, performance benchmarks
- **Frontend**: Component tests, integration tests, e2e tests
- **Critical Paths**: 100% coverage for threat detection logic

### Backend Testing

#### Unit Tests

```bash
# Run all unit tests
cd backend
pytest tests/test_*.py -v

# Run specific test module
pytest tests/test_packet_capture.py -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html

# Run with performance markers
pytest -m performance tests/
```

**Test Modules:**

1. **test_packet_capture.py** - Packet capture engine
   - Live capture simulation
   - PCAP file loading
   - Packet filtering
   - Performance benchmarks

2. **test_rule_engine.py** - Signature-based detection
   - SQL injection detection
   - XSS detection
   - Port scanning detection
   - Multi-rule matching
   - Rule performance

3. **test_api.py** - REST API endpoints
   - Alert CRUD operations
   - Statistics endpoints
   - Capture control
   - Export functionality
   - Error handling

4. **test_ml_detector.py** - Anomaly detection
   - Model training
   - Inference performance
   - Accuracy metrics
   - Edge case handling

#### Integration Tests

```bash
# Run integration tests
pytest tests/integration.py -v

# Run with coverage
pytest tests/integration.py --cov=. --cov-report=html
```

**Coverage:**
- End-to-end packet processing
- Database operations
- API + ML integration
- High-throughput scenarios

#### Performance Benchmarks

```bash
# Run performance benchmarks
pytest tests/ -m performance

# Generate benchmark report
pytest tests/benchmarks/ --benchmark-only
```

**Benchmarks:**
- Packet processing: >10,000 packets/sec
- Rule evaluation: <100ms per packet
- API response: <500ms
- Anomaly detection: <100ms per sample

### Frontend Testing

```bash
# Install dependencies
cd frontend
npm install

# Run component tests
npm test

# Run with coverage
npm test -- --coverage

# Run e2e tests (if available)
npm run test:e2e
```

**Test Coverage:**
- Component rendering
- User interactions
- API integration
- WebSocket real-time updates
- Responsive design
- Accessibility (WCAG AA)

---

## Docker Setup

### Multi-Stage Build

The Dockerfile uses multi-stage builds for optimal image size:

```dockerfile
# Stage 1: Builder
FROM python:3.11-slim as builder
# Install dependencies

# Stage 2: Runtime
FROM python:3.11-slim
# Copy only necessary files
```

Benefits:
- Smaller final image (~400MB vs 1.5GB)
- Faster deployment
- Better security (no build tools in production)

### Docker Compose Services

```yaml
services:
  backend:      # Flask API server
  frontend:     # React development/production
  postgres:     # PostgreSQL database
  redis:        # Cache & sessions
  nginx:        # Reverse proxy & static files
  prometheus:   # Metrics collection
```

### Building & Running

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:5000/health
curl http://localhost:5173  # Frontend
```

### Environment Configuration

```bash
# Copy example .env
cp .env.example .env

# Edit for your environment
vim .env

# Key variables:
POSTGRES_PASSWORD=secure_password
API_PORT=5000
DEBUG=false
LOG_LEVEL=INFO
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Test Workflow (test.yml)

Runs on every push and pull request:

```yaml
jobs:
  backend-tests:
    - Unit tests (Python 3.11, 3.12)
    - Code coverage (>85%)
    - Linting (pylint)
    - Code formatting (black)

  frontend-tests:
    - Component tests (Node 18, 20)
    - Code coverage
    - ESLint linting
    - Build verification

  integration-tests:
    - End-to-end tests
    - Database operations
    - API + ML pipeline

  security-scan:
    - Bandit (Python security)
    - Safety (dependency vulnerabilities)

  performance-benchmarks:
    - Packet processing throughput
    - Rule evaluation speed
    - API response times
```

**Trigger:** Push to main/develop, Pull requests

**Duration:** ~15-20 minutes

#### 2. Docker Workflow (docker.yml)

Builds and pushes Docker images:

```yaml
jobs:
  build:
    - Build backend image (multi-platform)
    - Build frontend image
    - Push to ghcr.io

  security-scan:
    - Trivy vulnerability scanning
    - SARIF report to GitHub Security

  docker-compose-test:
    - Start services with docker-compose
    - Verify health checks
    - Test API endpoints

  publish-release:
    - Create GitHub release
    - Tag images with version
```

**Trigger:** Push to main/develop, Git tags (v*)

**Platforms:** linux/amd64, linux/arm64

### View Workflow Runs

```bash
# List workflow runs
gh workflow list

# View run details
gh run view <run-id>

# Watch workflow
gh run watch

# View logs
gh run view <run-id> --log
```

---

## Deployment

### Quick Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/nids.git
cd nids

# Configure environment
cp .env.example .env
vim .env  # Edit settings

# Build and start
docker-compose build
docker-compose up -d

# Wait for services
sleep 10
curl http://localhost:5000/health
```

### Production Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- SSL/TLS configuration
- Systemd service setup
- Load balancing
- Scaling strategies
- Backup procedures

### Database Migrations

```bash
# Initialize database
docker-compose exec backend flask db upgrade

# Load signatures
docker-compose exec backend python -m detection.load_signatures
```

---

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health
# Response: {"status": "healthy", "version": "1.0.0"}

# Database
docker-compose exec postgres pg_isready

# Redis
docker-compose exec redis redis-cli ping

# Nginx
curl -I http://localhost/health
```

### Logs

```bash
# Real-time logs
docker-compose logs -f backend

# View specific service
docker-compose logs postgres

# Last N lines
docker-compose logs --tail 100

# Export logs
docker-compose logs > nids.log
```

### Metrics

Access Prometheus at `http://localhost:9090`:

```promql
# CPU usage
process_cpu_seconds_total

# Memory usage
process_resident_memory_bytes

# API requests
http_requests_total

# Error rate
rate(http_requests_total{status=~"5.."}[5m])
```

### Performance Monitoring

```bash
# Docker container stats
docker stats nids-backend

# Database performance
docker-compose exec postgres psql -U nids -d nids -c "\d+"

# Check slow queries
docker-compose logs backend | grep "slow"
```

---

## Troubleshooting

### Container Issues

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs backend

# Inspect container
docker inspect nids-backend

# Restart container
docker-compose restart backend
```

### Database Issues

```bash
# Check database connection
docker-compose exec backend python -c "from database import db; print('OK')"

# Access database
docker-compose exec postgres psql -U nids -d nids

# Backup database
docker-compose exec postgres pg_dump -U nids nids > backup.sql
```

### Network Issues

```bash
# Check network
docker network inspect nids_nids-network

# Test DNS resolution
docker-compose exec backend nslookup postgres

# Test connectivity
docker-compose exec backend curl http://postgres:5432
```

---

## Best Practices

### Testing
- ✅ Run tests locally before pushing
- ✅ Aim for >85% code coverage
- ✅ Include edge case testing
- ✅ Performance test critical paths

### Docker
- ✅ Use multi-stage builds
- ✅ Include health checks
- ✅ Set resource limits
- ✅ Use specific image tags

### CI/CD
- ✅ Keep workflows fast (<20 min)
- ✅ Fail fast on errors
- ✅ Cache dependencies
- ✅ Run security scans

### Deployment
- ✅ Use environment variables
- ✅ Enable SSL/TLS
- ✅ Implement logging
- ✅ Monitor performance
- ✅ Plan backups

---

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [pytest Documentation](https://docs.pytest.org/)
- [Jest Documentation](https://jestjs.io/)
- [GitHub Actions](https://github.com/features/actions)

---

For more information, see:
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Detailed deployment guide
- [README.md](./README.md) - Project overview
- [PRD.md](./PRD.md) - Product requirements
