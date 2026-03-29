# 🚀 NIDS Deployment & Setup Guide

## Local Development

### Quick Start (5 minutes)

**1. Backend Setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python app.py
```

Backend runs at: `http://localhost:5000`

**2. Frontend Setup (new terminal)**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

**3. Access Dashboard**
- Open: `http://localhost:5173`
- API: `http://localhost:5000/api`

---

## Docker Deployment

### Using Docker Compose (Recommended)

**Build & Run**
```bash
docker-compose up --build
```

**Access**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

**Stop**
```bash
docker-compose down
```

**View Logs**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Production Deployment

### Railway.app (Recommended for Hobby Projects)

**Backend Deployment**
```bash
railway login
railway init
railway add
railway up
```

**Frontend on Vercel**
```bash
npm install -g vercel
vercel --prod
```

### AWS EC2

**1. Launch Ubuntu Instance**
- t3.medium (2GB RAM, 2 vCPU)
- Allow ports 80, 443, 5000

**2. Setup Backend**
```bash
sudo apt update
sudo apt install python3.11 python3-pip libpcap-dev git
git clone https://github.com/Jabir-Srj/nids.git
cd nids/backend
pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
```

**3. Setup Frontend**
```bash
sudo apt install nodejs npm
cd ../frontend
npm install
npm run build
npx serve -s dist -l 3000
```

---

## Performance Tuning

### Backend Optimization

**Increase Worker Processes**
```bash
gunicorn -w 8 -b 0.0.0.0:5000 app:create_app()
```

**Enable Caching**
Set environment: `CACHE_ENABLED=true`

**Increase Buffer**
Set environment: `PACKET_BUFFER_SIZE=50000`

### Frontend Optimization

**Production Build**
```bash
npm run build
```

**Enable Compression**
nginx: `gzip on;`

---

## Monitoring

### Backend Health
```bash
curl http://localhost:5000/health
```

### View Stats
```bash
curl http://localhost:5000/api/stats/overview
```

### Check Alerts
```bash
curl http://localhost:5000/api/alerts
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Packet Capture Permission Denied

**Linux**
```bash
sudo setcap cap_net_raw=ep $(which python)
```

**Mac**
```bash
sudo chmod +r /dev/bpf*
```

### CORS Errors

Check backend config: `config.py`
```python
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]
```

---

## API Testing

### Using curl

**Get Recent Alerts**
```bash
curl -X GET http://localhost:5000/api/alerts?limit=10
```

**Get Statistics**
```bash
curl -X GET http://localhost:5000/api/stats/overview
```

**Start Capture**
```bash
curl -X POST http://localhost:5000/api/capture/start \
  -H "Content-Type: application/json" \
  -d '{"interface":"eth0"}'
```

**Stop Capture**
```bash
curl -X POST http://localhost:5000/api/capture/stop
```

### Using Python

```python
import requests

BASE_URL = "http://localhost:5000/api"

# Get alerts
response = requests.get(f"{BASE_URL}/alerts")
print(response.json())

# Get stats
response = requests.get(f"{BASE_URL}/stats/overview")
print(response.json())
```

---

## Environment Variables

### Backend (.env)
```
FLASK_ENV=development
DEBUG=True
API_HOST=0.0.0.0
API_PORT=5000
CAPTURE_INTERFACE=eth0
ABUSEIPDB_API_KEY=your_key
MAXMIND_API_KEY=your_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## Database Management

### SQLite (Default)

**Location:** `instance/nids.db`

**Backup**
```bash
cp instance/nids.db backups/nids_$(date +%Y%m%d).db
```

**Reset**
```bash
rm instance/nids.db
python app.py  # Creates new DB
```

---

## Performance Benchmarks

| Metric | Target | Status |
|--------|--------|--------|
| Packet Capture | >10,000 pps | ✅ |
| Rule Evaluation | <100ms | ✅ |
| API Response | <500ms | ✅ |
| Dashboard Load | <2s | ✅ |
| Memory Usage | <2GB | ✅ |
| CPU Usage | <80% | ✅ |

---

## Support & Resources

- **Documentation:** See `PRD.md` and `README.md`
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

---

**Last Updated:** March 29, 2026
