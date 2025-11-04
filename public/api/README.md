# RcBuilder Backend Setup

## Backend Architecture

This application requires a Node.js/Express backend server. The frontend is built with React and communicates with the backend via REST API.

## Required Backend Structure

```
backend/
├── server.js              # Main Express server
├── acc.json              # User accounts database
├── models.json           # AI models configuration
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── admin.js         # Admin panel routes
│   ├── sessions.js      # Session management
│   └── generate.js      # AI code generation
└── middleware/
    └── auth.js          # Authentication middleware
```

## Backend Implementation Guide

### 1. Install Dependencies

```bash
npm install express cors body-parser axios archiver
```

### 2. acc.json Structure

```json
[
  {
    "username": "admin",
    "password": "admin123",
    "role": "admin",
    "expired": "2026-12-31"
  },
  {
    "username": "demo",
    "password": "demo123",
    "role": "user",
    "expired": "2025-12-31"
  }
]
```

### 3. models.json Structure

```json
[
  { "name": "Gemini 2.5 Flash", "id": "google/gemini-2.5-flash" },
  { "name": "Gemini 2.5 Pro", "id": "google/gemini-2.5-pro" },
  { "name": "GPT-5", "id": "openai/gpt-5" },
  { "name": "DeepSeek V3.1", "id": "deepseek-ai/DeepSeek-V3.1" }
]
```

### 4. API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with username/password
- Response: `{ user: { username, role, expired } }`

#### User Dashboard
- `POST /api/generate` - Generate code with AI
  - Body: `{ prompt, model, username }`
- `GET /api/sessions` - Get user sessions
- `GET /api/sessions/:name/download` - Download session as ZIP
- `DELETE /api/sessions/:name` - Delete session

#### Admin Panel
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
  - Body: `{ username, password, expired }`
- `DELETE /api/admin/users/:username` - Delete user
- `GET /api/admin/models` - Get all models
- `POST /api/admin/models` - Add new model
  - Body: `{ name, id }`
- `DELETE /api/admin/models/:id` - Delete model

### 5. Express Server Example (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const archiver = require('archiver');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const ACCOUNTS_FILE = path.join(__dirname, 'acc.json');
const MODELS_FILE = path.join(__dirname, 'models.json');
const SESSIONS_DIR = path.join(__dirname, 'sessions');
const API_URL = "https://api.deepinfra.com/v1/openai/chat/completions";

// Ensure directories exist
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
  
  const user = accounts.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ user: { username: user.username, role: user.role, expired: user.expired } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Generate code endpoint
app.post('/api/generate', async (req, res) => {
  const { prompt, model, username } = req.body;
  
  try {
    const response = await axios.post(API_URL, {
      model: model,
      messages: [
        { role: "system", content: "You are a professional code generator." },
        { role: "user", content: prompt }
      ],
      stream: false
    }, {
      headers: {
        "Content-Type": "application/json",
        "X-Deepinfra-Source": "web-page"
      }
    });
    
    const generatedCode = response.data.choices[0].message.content;
    
    // Save to session
    const sessionDir = path.join(SESSIONS_DIR, username);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const fileName = \`code_\${timestamp}.txt\`;
    fs.writeFileSync(path.join(sessionDir, fileName), generatedCode);
    
    res.json({ response: generatedCode });
  } catch (error) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

// Get sessions
app.get('/api/sessions', (req, res) => {
  const sessions = [];
  
  if (fs.existsSync(SESSIONS_DIR)) {
    const dirs = fs.readdirSync(SESSIONS_DIR);
    dirs.forEach(dir => {
      const dirPath = path.join(SESSIONS_DIR, dir);
      const files = fs.readdirSync(dirPath);
      sessions.push({
        name: dir,
        created: fs.statSync(dirPath).birthtime.toISOString(),
        fileCount: files.length
      });
    });
  }
  
  res.json({ sessions });
});

// Admin: Get users
app.get('/api/admin/users', (req, res) => {
  const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
  res.json({ users: accounts });
});

// Admin: Create user
app.post('/api/admin/users', (req, res) => {
  const { username, password, expired } = req.body;
  const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
  
  accounts.push({ username, password, role: 'user', expired });
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
  
  res.json({ success: true });
});

// Admin: Delete user
app.delete('/api/admin/users/:username', (req, res) => {
  const { username } = req.params;
  let accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
  
  accounts = accounts.filter(u => u.username !== username);
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
  
  res.json({ success: true });
});

// Admin: Get models
app.get('/api/admin/models', (req, res) => {
  const models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  res.json({ models });
});

// Admin: Add model
app.post('/api/admin/models', (req, res) => {
  const { name, id } = req.body;
  const models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  
  models.push({ name, id });
  fs.writeFileSync(MODELS_FILE, JSON.stringify(models, null, 2));
  
  res.json({ success: true });
});

// Admin: Delete model
app.delete('/api/admin/models/:id', (req, res) => {
  const modelId = decodeURIComponent(req.params.id);
  let models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  
  models = models.filter(m => m.id !== modelId);
  fs.writeFileSync(MODELS_FILE, JSON.stringify(models, null, 2));
  
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(\`Backend server running on http://localhost:\${PORT}\`);
});
```

## Running the Application

### Backend
```bash
cd backend
node server.js
```

### Frontend (Development)
```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`
The backend API runs on `http://localhost:3001`

## Production Deployment

For production, you'll need to:
1. Set up proper environment variables
2. Use a production database instead of JSON files
3. Implement proper authentication with JWT tokens
4. Add rate limiting and security middleware
5. Use HTTPS for all communications

## Security Notes

⚠️ **Important**: The current implementation uses basic authentication for demo purposes. In production:
- Hash passwords with bcrypt
- Use JWT tokens for session management
- Implement CSRF protection
- Add rate limiting
- Validate all inputs
- Use environment variables for sensitive data
