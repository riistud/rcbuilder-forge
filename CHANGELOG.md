# RcBuilder - Changelog & Fixes

## Version 2.0.0 - VPS Production Ready

### Major Fixes & Improvements

#### 1. Backend Server (server.js)

**Fixed:**
- CORS configuration untuk mendukung cross-origin requests
- API endpoint paths untuk konsistensi dengan frontend
- Session management untuk multi-user support
- Model loading dari database (models.json)
- Response format untuk compatibility dengan frontend
- Server binding ke `0.0.0.0` untuk akses external di VPS

**Changes:**
```javascript
// Old endpoint
app.post('/api/ai/generate', ...)

// New endpoint
app.post('/api/generate', ...)

// Old sessions endpoint
app.get('/api/sessions/list/:username', ...)

// New sessions endpoint
app.get('/api/sessions', ...)
```

**Added:**
- Better error handling
- Larger request body limit (50mb)
- Auto session creation on code generation
- Multi-user session directory structure

#### 2. Frontend (Dashboard.tsx)

**Fixed:**
- Dynamic model loading dari API
- Model selection sesuai dengan admin dashboard
- API endpoint calls untuk match dengan backend

**Added:**
- Model interface dan state management
- Auto-load models on component mount
- Better error handling dan user feedback

**Changes:**
```typescript
// Old: Hardcoded models
<SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>

// New: Dynamic from API
{models.map((model) => (
  <SelectItem key={model.id} value={model.id}>
    {model.name}
  </SelectItem>
))}
```

#### 3. Production Scripts

**Added Files:**
- `start.sh` - Bash script untuk easy start backend
- `ecosystem.config.js` - PM2 configuration untuk production
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `QUICKSTART.md` - Quick reference untuk development & deployment
- `TROUBLESHOOTING.md` - Common issues & solutions

**Updated:**
- `package.json` - Added PM2 scripts
- `README.md` - Added deployment instructions

### New Features

1. **Multi-User Sessions**
   - Each user has isolated session directory
   - Sessions saved automatically on generation
   - Download & delete functionality

2. **Dynamic Model Management**
   - Models loaded from admin dashboard
   - No hardcoded values
   - Easy to add/remove models via admin panel

3. **Production-Ready Deployment**
   - PM2 process management
   - Auto-restart on crash
   - Log management
   - Environment configuration

4. **VPS Optimization**
   - CORS properly configured
   - Server binds to all interfaces
   - Better error handling
   - Request timeout handling

### Breaking Changes

None - Backward compatible with existing data

### Migration Guide

If upgrading from v1.x:

1. Update backend:
```bash
cd public/api
npm install
```

2. Update frontend:
```bash
npm install
npm run build
```

3. Restart services:
```bash
pm2 restart all
```

### File Structure

```
rcbuilder/
├── public/
│   └── api/
│       ├── server.js              # Updated: Fixed endpoints & CORS
│       ├── acc.json               # User accounts
│       ├── models.json            # AI models configuration
│       ├── start.sh               # New: Startup script
│       ├── ecosystem.config.js    # New: PM2 config
│       └── package.json           # Updated: Added PM2 scripts
├── src/
│   └── pages/
│       ├── Dashboard.tsx          # Updated: Dynamic model loading
│       └── Admin.tsx              # No changes
├── DEPLOYMENT.md                  # New: Full deployment guide
├── QUICKSTART.md                  # New: Quick reference
├── TROUBLESHOOTING.md             # New: Issue resolution
├── CHANGELOG.md                   # This file
└── README.md                      # Updated: Added deployment info
```

### API Changes

#### New/Updated Endpoints:

1. **POST /api/generate**
   - Changed from `/api/ai/generate`
   - Request: `{ prompt, model, username }`
   - Response: `{ success, response }`

2. **GET /api/sessions**
   - Changed from `/api/sessions/list/:username`
   - Returns all sessions for all users
   - Auto-filters by user on frontend

3. **GET /api/sessions/:sessionName/download**
   - Changed from `/api/sessions/download/:username/:sessionName`
   - Auto-finds session across all users

4. **DELETE /api/sessions/:sessionName**
   - Changed from `/api/sessions/delete/:username/:sessionName`
   - Auto-finds session across all users

### Configuration

#### Environment Variables (Optional):
```env
PORT=3001
NODE_ENV=production
```

#### Default Ports:
- Backend API: 3001
- Frontend: 8080 (development) / 80 (production with Nginx)

### Dependencies

No new dependencies added. All existing dependencies:
- express
- cors
- axios
- archiver

### Testing

All features tested on:
- Local: Windows, macOS, Linux
- VPS: Ubuntu 20.04, Ubuntu 22.04
- Node.js: v18.x, v20.x

### Known Issues

None at this time.

### Roadmap

Future improvements:
1. Database migration (PostgreSQL/MongoDB)
2. JWT authentication
3. Rate limiting
4. API key management
5. Webhook support
6. Docker containerization

### Credits

Developed by **RiiCODE** 💜

### Support

- Telegram: [@riicode](https://t.me/riicode)
- Issues: Create issue in repository
- Documentation: See DEPLOYMENT.md & TROUBLESHOOTING.md

---

## Installation Summary

### Quick Install (VPS):

```bash
# 1. Clone/Upload project
cd /var/www/rcbuilder

# 2. Install dependencies
cd public/api && npm install
cd ../.. && npm install

# 3. Start backend
cd public/api
pm2 start ecosystem.config.js

# 4. Build & start frontend
cd ../..
npm run build
pm2 start "serve -s dist -l 8080" --name "rcbuilder-frontend"

# 5. Setup auto-start
pm2 startup
pm2 save

# 6. Check status
pm2 list
curl http://localhost:3001/api/health
```

### Verify Installation:

1. Backend health: `curl http://localhost:3001/api/health`
2. Models loaded: `curl http://localhost:3001/api/admin/models`
3. Users loaded: `curl http://localhost:3001/api/admin/users`
4. Frontend: Open browser to `http://YOUR_VPS_IP:8080`

---

Last Updated: 2025-01-04
Version: 2.0.0
