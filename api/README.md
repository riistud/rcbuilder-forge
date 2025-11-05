# RcBuilder Backend API

Backend server untuk RcBuilder - AI Code Generator Platform

## Cara Menjalankan

1. Install dependencies:
```bash
cd api
npm install
```

2. Jalankan server:
```bash
npm start
```

Atau untuk development dengan auto-reload:
```bash
npm run dev
```

Server akan berjalan di port 3001

## Struktur Folder

- `server.js` - Main server file
- `acc.json` - User database
- `models.json` - AI models configuration
- `sessions/` - User generated code sessions
