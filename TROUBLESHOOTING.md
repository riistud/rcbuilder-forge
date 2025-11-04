# RcBuilder Troubleshooting Guide

## Common Issues & Solutions

### 1. Backend tidak bisa start di VPS

**Error: "Cannot find module 'express'"**

**Solusi:**
```bash
cd /var/www/rcbuilder/public/api
npm install
```

**Error: "Port 3001 already in use"**

**Solusi:**
```bash
# Cek process yang menggunakan port 3001
sudo lsof -i :3001

# Kill process tersebut
sudo kill -9 <PID>

# Atau gunakan port lain
PORT=3002 npm start
```

**Error: "EACCES: permission denied"**

**Solusi:**
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/rcbuilder

# Fix permissions
chmod -R 755 /var/www/rcbuilder
chmod 755 /var/www/rcbuilder/public/api/sessions
```

---

### 2. Connection Error dari Frontend

**Error: "Failed to fetch" atau "Connection refused"**

**Solusi:**

1. Check backend is running:
```bash
pm2 list
curl http://localhost:3001/api/health
```

2. Check CORS settings di `server.js`:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

3. Check proxy settings di `vite.config.ts`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

4. Jika menggunakan Nginx, check config:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

### 3. Models tidak muncul di Dashboard

**Gejala:** Dropdown model kosong atau tidak ada pilihan

**Solusi:**

1. Check `models.json` exists dan valid:
```bash
cd /var/www/rcbuilder/public/api
cat models.json
```

2. Verify struktur JSON:
```json
[
  {
    "name": "Model Name",
    "id": "provider/model-id"
  }
]
```

3. Test API endpoint:
```bash
curl http://localhost:3001/api/admin/models
```

4. Check frontend console untuk error:
```
Press F12 > Console tab
```

5. Pastikan model ID sesuai dengan yang ada di models.json

---

### 4. AI Generation Error

**Error: "AI generation failed" atau "Request timeout"**

**Solusi:**

1. Check DeepInfra API status:
```bash
curl https://api.deepinfra.com/v1/openai/chat/completions
```

2. Verify model ID benar:
```bash
# Check models.json
cd public/api
cat models.json

# Model ID harus format: "provider/model-name"
# Contoh: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
```

3. Increase timeout di `server.js`:
```javascript
const MAX_TIMEOUT_MS = 600000; // 10 minutes
```

4. Check server logs:
```bash
pm2 logs rcbuilder-api
```

---

### 5. Session/File tidak tersimpan

**Gejala:** Generated code tidak muncul di "My Sessions"

**Solusi:**

1. Check sessions directory exists:
```bash
ls -la /var/www/rcbuilder/public/api/sessions
```

2. Check permissions:
```bash
chmod 755 /var/www/rcbuilder/public/api/sessions
```

3. Check disk space:
```bash
df -h
```

4. Verify backend logs:
```bash
pm2 logs rcbuilder-api --lines 50
```

---

### 6. Login Failed

**Error: "Invalid credentials" meskipun password benar**

**Solusi:**

1. Check `acc.json` format:
```bash
cd /var/www/rcbuilder/public/api
cat acc.json
```

2. Verify struktur:
```json
[
  {
    "username": "admin",
    "password": "admin123",
    "role": "admin",
    "exp": "Lifetime"
  }
]
```

3. Check tidak ada whitespace/typo:
```bash
# Reformat JSON
cat acc.json | jq '.' > acc_temp.json
mv acc_temp.json acc.json
```

4. Test login API:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

### 7. Admin Panel tidak bisa diakses

**Gejala:** Redirect ke dashboard saat login sebagai admin

**Solusi:**

1. Check localStorage:
```javascript
// Browser console (F12)
localStorage.getItem('user')
```

2. Clear cache & localStorage:
```javascript
// Browser console
localStorage.clear()
location.reload()
```

3. Verify role di `acc.json`:
```json
{
  "username": "admin",
  "role": "admin"  // Harus "admin" bukan "user"
}
```

---

### 8. Nginx Error

**Error: "502 Bad Gateway"**

**Solusi:**

1. Check backend is running:
```bash
pm2 list
```

2. Check Nginx config:
```bash
sudo nginx -t
```

3. Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

4. Restart services:
```bash
pm2 restart all
sudo systemctl restart nginx
```

**Error: "404 Not Found" untuk semua routes**

**Solusi:**

Add di Nginx config:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### 9. PM2 Process keeps restarting

**Gejala:** `pm2 list` menunjukkan "restart" count tinggi

**Solusi:**

1. Check logs untuk error:
```bash
pm2 logs rcbuilder-api --lines 100
```

2. Check file dependencies:
```bash
cd /var/www/rcbuilder/public/api
ls -la acc.json models.json
```

3. Test manual start:
```bash
node server.js
```

4. Check memory usage:
```bash
pm2 monit
```

---

### 10. Build Error di Frontend

**Error: Module not found atau TypeScript error**

**Solusi:**

1. Clear cache:
```bash
rm -rf node_modules
rm -rf dist
npm cache clean --force
```

2. Reinstall dependencies:
```bash
npm install
```

3. Check Node version:
```bash
node -v  # Should be v18 or higher
```

4. Update dependencies:
```bash
npm update
```

---

## Diagnostic Commands

### Backend Health Check
```bash
# Check if server is running
curl http://localhost:3001/api/health

# Check all endpoints
curl http://localhost:3001/api/admin/models
curl http://localhost:3001/api/admin/users
curl http://localhost:3001/api/sessions
```

### PM2 Diagnostics
```bash
pm2 list                    # List all processes
pm2 logs rcbuilder-api      # View logs
pm2 monit                   # Real-time monitoring
pm2 describe rcbuilder-api  # Detailed process info
```

### System Check
```bash
# Check ports
sudo lsof -i :3001
sudo lsof -i :8080

# Check disk space
df -h

# Check memory
free -h

# Check process
ps aux | grep node
```

### Network Check
```bash
# Check if port is accessible
telnet localhost 3001

# Check from external
curl http://YOUR_VPS_IP:3001/api/health

# Check firewall
sudo ufw status
```

---

## Still Having Issues?

1. Check all logs:
```bash
pm2 logs rcbuilder-api --lines 200
sudo tail -f /var/log/nginx/error.log
journalctl -u nginx -n 100
```

2. Restart everything:
```bash
pm2 restart all
sudo systemctl restart nginx
```

3. Reinstall from scratch:
```bash
cd /var/www/rcbuilder
pm2 delete all
rm -rf node_modules public/api/node_modules
npm install
cd public/api && npm install
npm run build
pm2 start public/api/ecosystem.config.js
pm2 start "serve -s dist -l 8080" --name "rcbuilder-frontend"
```

---

## Contact Support

If issues persist:
- Telegram: [@riicode](https://t.me/riicode)
- Sertakan informasi:
  - OS dan versi (Ubuntu 20.04, etc)
  - Node.js version (`node -v`)
  - Error logs dari `pm2 logs`
  - Screenshot jika ada error di browser

Created by RiiCODE 💜
