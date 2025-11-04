# RcBuilder Deployment Guide - VPS Production

## Prerequisites

1. VPS dengan minimal:
   - 1GB RAM
   - 1 CPU Core
   - Ubuntu 20.04/22.04 atau CentOS 7/8
   - Port 3001 (backend) dan 8080 (frontend) terbuka

2. Software yang diperlukan:
   - Node.js v18 atau lebih tinggi
   - npm v9 atau lebih tinggi
   - PM2 (untuk production)

## Step 1: Install Node.js di VPS

### Ubuntu/Debian:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### CentOS/RHEL:
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

Verifikasi instalasi:
```bash
node -v  # Should show v18.x.x or higher
npm -v   # Should show v9.x.x or higher
```

## Step 2: Install PM2

```bash
sudo npm install -g pm2
```

## Step 3: Upload Project ke VPS

### Cara 1: Clone dari Git
```bash
git clone <YOUR_REPO_URL>
cd <YOUR_PROJECT_NAME>
```

### Cara 2: Upload via SCP
```bash
# Dari komputer lokal
scp -r ./project root@YOUR_VPS_IP:/var/www/rcbuilder
```

## Step 4: Setup Backend

```bash
cd /var/www/rcbuilder/public/api

# Install dependencies
npm install

# Pastikan file konfigurasi ada
ls -la acc.json models.json

# Test run backend
node server.js
```

Jika berhasil, Anda akan melihat:
```
╔═══════════════════════════════════════════════════╗
║        🚀 RcBuilder API Server                   ║
║        ✅ Server running on port 3001            ║
╚═══════════════════════════════════════════════════╝
```

Tekan `Ctrl+C` untuk stop test.

## Step 5: Run Backend dengan PM2

```bash
cd /var/www/rcbuilder/public/api

# Start dengan PM2
pm2 start ecosystem.config.js

# Atau manual start
pm2 start server.js --name "rcbuilder-api"

# Check status
pm2 status

# View logs
pm2 logs rcbuilder-api

# Auto-restart on reboot
pm2 startup
pm2 save
```

## Step 6: Setup Frontend

```bash
cd /var/www/rcbuilder

# Install dependencies
npm install

# Build production
npm run build

# Preview build (optional)
npm run preview
```

## Step 7: Serve Frontend dengan PM2

### Cara 1: Menggunakan serve package

```bash
# Install serve globally
npm install -g serve

# Start frontend dengan PM2
pm2 start "serve -s dist -l 8080" --name "rcbuilder-frontend"
```

### Cara 2: Menggunakan http-server

```bash
# Install http-server
npm install -g http-server

# Start dengan PM2
pm2 start "http-server dist -p 8080" --name "rcbuilder-frontend"
```

## Step 8: Setup Nginx Reverse Proxy (Recommended)

Install Nginx:
```bash
sudo apt install nginx -y  # Ubuntu
# atau
sudo yum install nginx -y  # CentOS
```

Buat konfigurasi Nginx:
```bash
sudo nano /etc/nginx/sites-available/rcbuilder
```

Tambahkan:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/rcbuilder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 9: Setup Firewall

```bash
# Allow required ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Step 10: Monitoring

```bash
# View all PM2 processes
pm2 list

# View logs
pm2 logs

# Monitor real-time
pm2 monit

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Delete services
pm2 delete all
```

## Troubleshooting

### Backend tidak bisa start

1. Check port 3001 tidak digunakan:
```bash
sudo lsof -i :3001
```

2. Check logs:
```bash
pm2 logs rcbuilder-api --lines 100
```

3. Check file permissions:
```bash
cd /var/www/rcbuilder/public/api
ls -la
chmod 755 sessions/
```

### Connection Error dari Frontend

1. Check backend sudah running:
```bash
pm2 list
curl http://localhost:3001/api/health
```

2. Check CORS settings di server.js
3. Check proxy settings di vite.config.ts atau nginx

### Models tidak muncul di Dashboard

1. Check models.json ada dan valid:
```bash
cd /var/www/rcbuilder/public/api
cat models.json
```

2. Test API endpoint:
```bash
curl http://localhost:3001/api/admin/models
```

## Environment Variables

Untuk production, buat file `.env`:

```bash
cd /var/www/rcbuilder/public/api
nano .env
```

Isi:
```env
PORT=3001
NODE_ENV=production
```

## Security Hardening

1. Change default passwords di acc.json
2. Setup SSL/HTTPS dengan Let's Encrypt
3. Enable firewall
4. Regular updates
5. Backup sessions directory

## Backup Script

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/rcbuilder"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup databases
cp /var/www/rcbuilder/public/api/acc.json $BACKUP_DIR/acc_$DATE.json
cp /var/www/rcbuilder/public/api/models.json $BACKUP_DIR/models_$DATE.json

# Backup sessions
tar -czf $BACKUP_DIR/sessions_$DATE.tar.gz /var/www/rcbuilder/public/api/sessions/

echo "Backup completed: $BACKUP_DIR"
```

## Quick Commands Reference

```bash
# Backend
cd /var/www/rcbuilder/public/api
pm2 start ecosystem.config.js
pm2 logs rcbuilder-api
pm2 restart rcbuilder-api

# Frontend
cd /var/www/rcbuilder
npm run build
pm2 restart rcbuilder-frontend

# Nginx
sudo nginx -t
sudo systemctl restart nginx

# Monitoring
pm2 monit
pm2 list
curl http://localhost:3001/api/health
```

## Support

Untuk bantuan deployment atau troubleshooting:
- Telegram: @riicode
- Email: support@riicode.com

Created by RiiCODE with 💜
