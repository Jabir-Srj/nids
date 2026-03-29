# NIDS Deployment Guide

## Quick Start

### Prerequisites
- Docker & Docker Compose 2.0+
- Git
- 2GB+ RAM, 10GB+ disk space
- Network interface for packet capture (for live monitoring)

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/nids.git
cd nids

# Copy environment file
cp .env.example .env

# Start services with docker-compose
docker-compose up -d

# Wait for services to become healthy
docker-compose ps

# Access dashboard
# Frontend: http://localhost:5173 (dev) or http://localhost:80 (prod)
# API: http://localhost:5000
# Health: http://localhost:5000/health
```

### Production Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Clone and Configure

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/yourusername/nids.git
cd nids

# Create environment file
sudo cp .env.example .env
sudo vim .env  # Edit with your settings

# Create data directories
sudo mkdir -p /var/nids/{logs,data,pcap}
sudo chown -R $(whoami):$(whoami) /var/nids
```

#### 3. Configure PostgreSQL

```bash
# Update .env with PostgreSQL credentials
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://nids:your-secure-password@postgres:5432/nids
```

#### 4. SSL/TLS Setup (Optional)

```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx -y

sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf with cert paths
# SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
# SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### 5. Start Services

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Check health
curl http://localhost:5000/health
```

#### 6. Initialize Database

```bash
# Run migrations
docker-compose exec backend flask db upgrade

# Load initial signatures
docker-compose exec backend python -m detection.load_signatures
```

### Systemd Service (Optional)

Create `/etc/systemd/system/nids.service`:

```ini
[Unit]
Description=NIDS - Network Intrusion Detection System
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
User=nids
WorkingDirectory=/opt/nids
ExecStart=/usr/local/bin/docker-compose up
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable nids
sudo systemctl start nids
sudo systemctl status nids
```

## Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Compose Network            │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Backend  │  │ Frontend │  │ Nginx    │ │
│  │ (Flask)  │  │ (React)  │  │ (Proxy)  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│       ↓              ↓              ↑      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │PostgreSQL│  │  Redis   │  │Prometheus│ │
│  │(Database)│  │ (Cache)  │  │(Metrics) │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

## Configuration

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| FLASK_ENV | production | Flask environment |
| DATABASE_URL | postgresql://... | Database connection string |
| API_PORT | 5000 | Backend API port |
| LOG_LEVEL | INFO | Logging level |
| ABUSEIPDB_API_KEY | - | Threat Intel API key |

### Frontend

Frontend environment variables are set in `frontend/.env`:

```
VITE_API_URL=http://localhost:5000
VITE_ENV=production
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Full system status
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```

### Prometheus Metrics

Access Prometheus at `http://localhost:9090`

Configure Grafana dashboards for:
- Packet capture rate
- Alert generation rate
- API response times
- Database query performance
- Memory/CPU usage

## Maintenance

### Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U nids nids > nids_backup.sql

# Backup volumes
tar -czf nids_data_backup.tar.gz \
  /var/nids/data \
  /var/nids/logs
```

### Update

```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker-compose build

# Restart services
docker-compose down
docker-compose up -d
```

### Logs

```bash
# View real-time logs
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail 100

# Save logs to file
docker-compose logs > nids_logs.txt
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Inspect container
docker inspect nids-backend

# Check resource usage
docker stats
```

### Database Connection Issues

```bash
# Test connection
docker-compose exec backend python -c "from database import db; print('OK')"

# Check PostgreSQL status
docker-compose exec postgres pg_isready
```

### API Not Responding

```bash
# Check if service is running
docker-compose ps

# Restart service
docker-compose restart backend

# Check port binding
docker-compose port backend 5000
```

### High Memory Usage

```bash
# Increase container limits in docker-compose.yml:
backend:
  # ...
  mem_limit: 2g
  memswap_limit: 2g
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **API Keys**: Use strong, random keys
3. **Database**: Use strong passwords, enable SSL
4. **Firewall**: Restrict access to ports 5000, 5173, 80, 443
5. **Regular Updates**: Keep images and dependencies updated
6. **Network**: Use Docker networks, not host network
7. **Secrets**: Consider using Docker Secrets for production
8. **HTTPS**: Always enable SSL/TLS in production

## Performance Tuning

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_src_ip ON alerts(src_ip);
```

### Gunicorn Workers

```bash
# In docker-compose.yml or backend service:
--workers 4  # Use 2-4 × CPU cores
--worker-class gevent  # Async worker
```

### Cache Configuration

```env
CACHE_TTL=3600  # 1 hour
REDIS_MAX_CONNECTIONS=10
```

## Scaling

### Horizontal Scaling

For multiple NIDS instances:

1. Deploy separate backend instances
2. Use load balancer (HAProxy, Nginx)
3. Use shared PostgreSQL database
4. Use shared Redis cache

```yaml
# Example: HAProxy config
backend nids_api
    balance roundrobin
    server backend1 localhost:5000 check
    server backend2 localhost:5001 check
    server backend3 localhost:5002 check
```

### Vertical Scaling

Increase resources:

```yaml
# In docker-compose.yml
backend:
  # ...
  cpus: 2
  mem_limit: 4g
```

## Support & Documentation

- **Issues**: https://github.com/yourusername/nids/issues
- **Docs**: See [README.md](../README.md)
- **API Docs**: http://localhost:5000/api/docs

## License

NIDS is licensed under MIT License. See LICENSE file for details.
