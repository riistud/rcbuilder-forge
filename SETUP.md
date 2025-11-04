# RcBuilder Setup Guide

## Overview

RcBuilder is a full-stack AI code generation platform with:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express (needs to be set up separately)
- **Database**: JSON files (acc.json for users, models.json for AI models)

## Quick Start

### 1. Frontend Setup (Current Project)

This Lovable project contains the complete frontend. It's ready to run in development mode.

**Demo Credentials:**
- Admin: `admin` / `admin123`
- User: `demo` / `demo123`

### 2. Backend Setup (Required)

You need to set up a Node.js Express backend separately. See `/public/api/README.md` for complete backend implementation guide.

**Quick Backend Setup:**

```bash
# Create backend directory
mkdir rcbuilder-backend
cd rcbuilder-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express cors body-parser axios archiver

# Create required files
touch server.js acc.json models.json

# Copy the server code from /public/api/README.md
# Start the server
node server.js
```

## Features

### For Users
- ✨ **AI Code Generation** - Generate production-ready code with multiple AI models
- 📁 **Session Management** - Organize projects and files
- 💾 **Download Sessions** - Export your generated code as ZIP files
- 🎨 **Beautiful UI** - Modern glassmorphism design with smooth animations

### For Admins
- 👥 **User Management** - Create, view, and delete users
- 🤖 **Model Management** - Add, edit, and remove AI models
- 📊 **Dashboard Analytics** - Monitor system usage

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Landing Page                                          │
│  - Login System                                          │
│  - User Dashboard (Code Generation)                      │
│  - Admin Panel (User & Model Management)                 │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ REST API
                  │
┌─────────────────▼───────────────────────────────────────┐
│              Backend (Express)                           │
│  - Authentication                                        │
│  - AI API Integration (DeepInfra)                        │
│  - Session Management                                    │
│  - File Operations                                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │
┌─────────────────▼───────────────────────────────────────┐
│            Database (JSON Files)                         │
│  - acc.json (User Accounts)                              │
│  - models.json (AI Models)                               │
│  - sessions/ (Generated Code)                            │
└──────────────────────────────────────────────────────────┘
```

## API Integration

The application uses DeepInfra API for AI code generation. You can configure different models:
- Google Gemini 2.5 Flash (Default, fastest)
- Google Gemini 2.5 Pro (Best quality)
- OpenAI GPT-5
- DeepSeek V3.1

## Development

### Frontend Development
```bash
npm run dev
```
Access at: `http://localhost:8080`

### Backend Development
```bash
cd backend
node server.js
```
API runs at: `http://localhost:3001`

## Production Deployment

### Frontend
This Lovable project can be deployed directly:
1. Click "Share" → "Publish" in Lovable
2. Or deploy to Vercel/Netlify/any static hosting

### Backend
Deploy the Express server to:
- Heroku
- Railway
- DigitalOcean
- AWS EC2
- Any Node.js hosting

**Environment Variables for Production:**
```
PORT=3001
API_URL=https://api.deepinfra.com/v1/openai/chat/completions
SESSIONS_DIR=./sessions
ACCOUNTS_FILE=./acc.json
MODELS_FILE=./models.json
```

## Security Considerations

⚠️ **Current Implementation is for Demo/Development**

For production, implement:
1. **Password Hashing**: Use bcrypt for passwords
2. **JWT Authentication**: Replace basic auth with tokens
3. **Database**: Use PostgreSQL/MongoDB instead of JSON files
4. **Input Validation**: Add zod/joi validation
5. **Rate Limiting**: Prevent API abuse
6. **HTTPS Only**: Secure all communications
7. **CORS Configuration**: Restrict origins
8. **Environment Variables**: Secure API keys

## Customization

### Change AI Provider
Edit backend `server.js`:
```javascript
const API_URL = "https://your-ai-api.com/endpoint";
```

### Add New Features
1. Frontend: Add components in `src/components/`
2. Backend: Add routes in `backend/routes/`
3. Update API contracts in both

### Modify Design
All design tokens are in:
- `src/index.css` - Colors, gradients, animations
- `tailwind.config.ts` - Tailwind extensions

## Troubleshooting

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS configuration in server.js
- Verify API URLs in frontend components

### Login fails
- Check acc.json exists and has valid users
- Verify password matches exactly
- Check browser console for errors

### Code generation fails
- Verify DeepInfra API is accessible
- Check API request format
- Ensure model ID is correct

## Support

Created by **RiiCODE**

For access to the platform:
- Telegram: [@riicode](https://t.me/riicode)

## License

This is a proprietary application. Contact RiiCODE for licensing information.
