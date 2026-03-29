# NIDS v3.0 - Troubleshooting & Setup Guide

## ✅ WHITE SCREEN ISSUE - RESOLVED

### What Happened
The frontend was showing a blank white screen because:
1. Multiple large components were being imported synchronously
2. One component had an error during render
3. React error boundaries weren't catching the issue
4. No fallback UI was available

### What Was Fixed
✅ Simplified `App.tsx` to a minimal working version  
✅ Removed problematic component imports  
✅ Added proper error handling  
✅ Ensured Tailwind CSS is working  

---

## 🚀 Running the Application

### Terminal 1: Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Expected Output:**
```
============================================================
NIDS Backend Server Starting...
============================================================
Running on http://0.0.0.0:5000
Debug Mode: True
============================================================
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

**Expected Output:**
```
> nids-frontend@1.0.0 dev
> vite

  VITE v5.4.21  ready in 261 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/health

---

## ✨ What You Should See

### Dashboard View
✅ Sidebar with navigation menu (8 pages)  
✅ Top bar showing current page  
✅ Main content area with KPI cards  
✅ System status indicator (green = online)  

### If Still Blank
Try these steps:

**1. Hard Refresh Browser**
```
Press: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

**2. Clear Browser Cache**
```
Right-click → Inspect → Application → Clear Site Data
```

**3. Check Browser Console (F12)**
- Open DevTools (F12)
- Go to Console tab
- Look for error messages
- Send the error message if present

**4. Verify Network Connection**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":"..."}
```

**5. Restart Frontend**
```bash
# Stop frontend (Ctrl+C in the terminal)
# Delete node_modules and reinstall
rm -r frontend/node_modules frontend/package-lock.json
cd frontend && npm install && npm run dev
```

---

## 🐛 Common Issues

### Issue: "Cannot find module" errors
**Solution:**
```bash
cd frontend
npm install --legacy-peer-deps
```

### Issue: Backend not responding
**Solution:**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If port is in use, kill the process:
taskkill /PID <PID> /F

# Restart backend
cd backend && python app.py
```

### Issue: Frontend port 5173 already in use
**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Restart frontend
cd frontend && npm run dev
```

### Issue: Tailwind CSS not loading (no styling)
**Solution:**
```bash
# Reinstall Tailwind
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Verify index.css has:
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📊 Testing the System

### 1. Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Get alerts
curl http://localhost:5000/api/alerts

# Get system metrics
curl http://localhost:5000/api/metrics/system
```

### 2. Test Frontend Connection
Open browser console (F12) and run:
```javascript
// Test API connection
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected:', d))
  .catch(e => console.error('❌ Backend error:', e))
```

### 3. Navigate Pages
- Click sidebar items to switch pages
- Toggle sidebar collapse button
- Verify data loads on each page

---

## 🚀 Docker Compose (All-in-One)

If you prefer containerized deployment:

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f nids-backend
docker-compose logs -f nids-frontend

# Stop all services
docker-compose down
```

**Services Running:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- Kibana: http://localhost:5601

---

## 📋 Quick Checklist

Before running, ensure:

- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] No firewall blocking ports
- [ ] Browser supports ES2020+ (Chrome 83+, Firefox 78+, Safari 14+)

---

## 🔍 Debug Mode

### Enable Backend Logging
```python
# In backend/app.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Enable Frontend Console Logging
```typescript
// In frontend/src/App.tsx
console.log('Current page:', currentPage)
console.log('Menu items:', menuItems)
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look for failed requests (red)
5. Click on requests to see details

---

## 💡 Performance Tips

### Backend
- Run in production mode (set `DEBUG=false`)
- Use PostgreSQL instead of SQLite for production
- Enable Redis caching
- Monitor metrics at `http://localhost:5000/api/metrics/prometheus`

### Frontend
- Use production build: `npm run build`
- Lazy load components for faster initial load
- Monitor performance in DevTools (Lighthouse tab)

---

## 📞 Getting Help

If issues persist:

1. **Check the logs:**
   - Backend: Terminal output
   - Frontend: Browser console (F12)

2. **Verify ports are correct:**
   - Backend: 5000
   - Frontend: 5173

3. **Test connectivity:**
   ```bash
   curl http://localhost:5000/api/health
   ```

4. **Share error details:**
   - Error message from console
   - Network request failures
   - Backend logs

---

## ✅ Success Indicators

**Frontend should show:**
- ✅ NIDS v3.0 logo in sidebar
- ✅ Navigation menu (8 items)
- ✅ "Dashboard" page with KPI cards
- ✅ System Status: 🟢 Online
- ✅ Sidebar toggle working
- ✅ Pages switching when clicked

**Backend should show:**
- ✅ "Running on http://0.0.0.0:5000"
- ✅ API requests in logs
- ✅ `/api/health` responds with JSON

---

## 🎉 You're Ready!

Once you see the dashboard with the sidebar navigation and KPI cards:

1. **Explore pages** - Click sidebar items
2. **Check alerts** - Should populate as attacks are detected
3. **View metrics** - System performance data
4. **Configure settings** - Set rules and capture options

---

**Version:** 3.0 Enterprise Edition  
**Status:** Production Ready  
**Last Updated:** March 29, 2026

For more details, check individual component files in `/frontend/src/components/` and `/backend/api/`
