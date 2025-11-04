# RcBuilder - Quick Start Guide

## Local Development (Windows/Mac/Linux)

### 1. Install Dependencies

**Backend:**
```bash
cd public/api
npm install
```

**Frontend:**
```bash
# Dari root project
npm install
```

### 2. Start Backend

```bash
cd public/api
npm start
```

Atau gunakan script bash:
```bash
cd public/api
./start.sh
```

Backend akan berjalan di: `http://localhost:3001`

### 3. Start Frontend

Buka terminal baru:
```bash
# Dari root project
npm run dev
```

Frontend akan berjalan di: `http://localhost:8080`

### 4. Login

Buka browser ke: `http://localhost:8080/login`

**Demo Accounts:**
- Admin: `admin` / `admin123`
- User: `demo` / `demo123`

---

## VPS Production Deployment

### Quick Deploy Commands

```bash
# 1. Upload ke VPS (dari local)
scp -r ./project root@YOUR_VPS_IP:/var/www/rcbuilder

# 2. SSH ke VPS
ssh root@YOUR_VPS_IP

# 3. Install Node.js (jika belum)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2
sudo npm install -g pm2

# 5. Setup Backend
cd /var/www/rcbuilder/public/api
npm install
pm2 start ecosystem.config.js

# 6. Setup Frontend
cd /var/www/rcbuilder
npm install
npm run build
npm install -g serve
pm2 start "serve -s dist -l 8080" --name "rcbuilder-frontend"

# 7. Setup Nginx (optional tapi recommended)
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/rcbuilder
# Copy config dari DEPLOYMENT.md
sudo ln -s /etc/nginx/sites-available/rcbuilder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 8. Auto-start on boot
pm2 startup
pm2 save
```

### Access Your Application

- Frontend: `http://YOUR_VPS_IP` (jika pakai Nginx) atau `http://YOUR_VPS_IP:8080`
- Backend API: `http://YOUR_VPS_IP:3001/api/health`

---

## Troubleshooting

### Backend Error: "Cannot find module"
```bash
cd public/api
npm install
```

### Frontend Error: "Failed to fetch models"
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check models.json exists
cd public/api
cat models.json
```

### Port Already in Use
```bash
# Kill process on port 3001
sudo lsof -i :3001
sudo kill -9 <PID>

# Or use different port
PORT=3002 npm start
```

### Connection Refused on VPS
```bash
# Check backend is running
pm2 list
pm2 logs rcbuilder-api

# Check firewall
sudo ufw status
sudo ufw allow 3001/tcp
sudo ufw allow 8080/tcp
```

---

## Common Commands

### Development
```bash
# Backend
cd public/api
npm start              # Start backend
npm run dev            # Start with auto-reload

# Frontend
npm run dev            # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

### Production (PM2)
```bash
pm2 list               # List all processes
pm2 logs rcbuilder-api # View backend logs
pm2 restart all        # Restart all services
pm2 stop all           # Stop all services
pm2 monit              # Monitor dashboard
```

---

## Configuration Files

- `public/api/acc.json` - User accounts
- `public/api/models.json` - AI models
- `public/api/server.js` - Backend server
- `vite.config.ts` - Frontend config
- `public/api/ecosystem.config.js` - PM2 config

---

## Support

Need help?
- Telegram: [@riicode](https://t.me/riicode)
- Documentation: See `DEPLOYMENT.md` for detailed guide

Created by RiiCODE 💜
