const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

const API_URL = "https://api.deepinfra.com/v1/openai/chat/completions";
const MAX_TIMEOUT_MS = 500000;

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const USERS_DB = path.join(__dirname, 'acc.json');
const MODELS_DB = path.join(__dirname, 'models.json');
const SESSIONS_DIR = path.join(__dirname, 'sessions');

// Ensure directories exist
async function initializeDirectories() {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
    console.log('✅ Directories initialized');
  } catch (error) {
    console.error('❌ Error creating directories:', error);
  }
}

// Read JSON file
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Write JSON file
async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readJSON(USERS_DB);

    if (!users) {
      return res.status(500).json({ error: 'Database error' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      return res.json({
        success: true,
        user: {
          username: user.username,
          role: user.role,
          expired: user.exp,
          token
        }
      });
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== AI ROUTES ====================

app.post('/api/ai/generate', async (req, res) => {
  try {
    const { message, model, history = [] } = req.body;

    if (!message || !model) {
      return res.status(400).json({ error: 'Message and model are required' });
    }

    const systemInstruction = `Anda adalah RiiBotzz, asisten AI multifungsi yang dibuat oleh RiiCODE.

KEMAMPUAN UTAMA:
1. Coding Expert - Ahli dalam SEMUA bahasa pemrograman
2. Conversational AI - Bisa diskusi, tanya jawab, brainstorming
3. Problem Solver - Bantu debugging, analisis, dan solusi teknis

ATURAN PENTING UNTUK MEMBUAT KODE:

1. WAJIB MENGGUNAKAN DESAIN MODERN & ELEGANT:
   - Implementasikan UI/UX premium seperti anggaran unlimited
   - Gunakan design system modern: Glassmorphism, Neumorphism, Gradient backgrounds
   - Animasi smooth: transitions, hover effects, scroll animations
   - Responsive design sempurna untuk semua device
   - Dark mode / Light mode toggle jika relevan
   - Micro-interactions dan smooth scrolling
   - Modern color palette: vibrant gradients, subtle shadows
   - Typography yang elegant dan readable
   - Spacing dan layout yang breathable

2. FORMAT MULTI-FILE:
   Untuk project dengan beberapa file, gunakan format:
   === FILENAME: namafile.ext ===
   [kode lengkap di sini]
   === END FILE ===

3. JANGAN PERNAH MENGGUNAKAN KUTIPAN MARKDOWN (\`\`\`) DI AWAL DAN AKHIR JIKA HANYA ADA SATU FILE.

Selalu deliver kode yang LENGKAP, SIAP PAKAI, dan MODERN!`;

    const apiMessages = [
      { role: "system", content: systemInstruction },
      ...history,
      { role: "user", content: message }
    ];

    const payload = {
      model,
      messages: apiMessages,
      stream: false,
    };

    const headers = {
      "Content-Type": "application/json",
      "X-Deepinfra-Source": "web-page",
      "accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
      "Referer": "https://deepinfra.com/chat",
    };

    const response = await axios.post(API_URL, payload, {
      headers,
      timeout: MAX_TIMEOUT_MS
    });

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    res.json({ success: true, content });

  } catch (error) {
    console.error('AI Generate error:', error);
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    res.status(500).json({ error: error.message || 'AI generation failed' });
  }
});

// ==================== SESSION ROUTES ====================

app.post('/api/sessions/save', async (req, res) => {
  try {
    const { username, sessionName, files } = req.body;

    if (!username || !sessionName || !files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const userDir = path.join(SESSIONS_DIR, username);
    const sessionDir = path.join(userDir, sessionName);

    await fs.mkdir(sessionDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(sessionDir, file.fileName);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf8');
    }

    res.json({ success: true, message: 'Session saved successfully' });

  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

app.get('/api/sessions/list/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const userDir = path.join(SESSIONS_DIR, username);

    try {
      await fs.access(userDir);
    } catch {
      return res.json({ sessions: [] });
    }

    const sessions = await fs.readdir(userDir);
    const sessionList = [];

    for (const session of sessions) {
      const sessionPath = path.join(userDir, session);
      const stats = await fs.stat(sessionPath);
      
      if (stats.isDirectory()) {
        const files = await getAllFiles(sessionPath);
        sessionList.push({
          name: session,
          created: stats.birthtime,
          fileCount: files.length
        });
      }
    }

    res.json({ sessions: sessionList });

  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

async function getAllFiles(dir) {
  let files = [];
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      files = files.concat(await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

app.get('/api/sessions/download/:username/:sessionName', async (req, res) => {
  try {
    const { username, sessionName } = req.params;
    const sessionPath = path.join(SESSIONS_DIR, username, sessionName);

    try {
      await fs.access(sessionPath);
    } catch {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${sessionName}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);
    archive.directory(sessionPath, false);
    await archive.finalize();

  } catch (error) {
    console.error('Download session error:', error);
    res.status(500).json({ error: 'Failed to download session' });
  }
});

app.delete('/api/sessions/delete/:username/:sessionName', async (req, res) => {
  try {
    const { username, sessionName } = req.params;
    const sessionPath = path.join(SESSIONS_DIR, username, sessionName);

    try {
      await fs.access(sessionPath);
    } catch {
      return res.status(404).json({ error: 'Session not found' });
    }

    await fs.rm(sessionPath, { recursive: true, force: true });
    res.json({ success: true, message: 'Session deleted successfully' });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// ==================== ADMIN ROUTES ====================

// Users Management
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await readJSON(USERS_DB);
    if (!users) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { username, password, role = 'user', exp = 'Lifetime' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = await readJSON(USERS_DB);
    if (!users) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    users.push({ username, password, role, exp });
    await writeJSON(USERS_DB, users);

    res.json({ success: true, message: 'User created successfully' });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.delete('/api/admin/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const users = await readJSON(USERS_DB);

    if (!users) {
      return res.status(500).json({ error: 'Database error' });
    }

    const filteredUsers = users.filter(u => u.username !== username);

    if (filteredUsers.length === users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    await writeJSON(USERS_DB, filteredUsers);
    res.json({ success: true, message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Models Management
app.get('/api/admin/models', async (req, res) => {
  try {
    const models = await readJSON(MODELS_DB);
    if (!models) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Failed to get models' });
  }
});

app.post('/api/admin/models', async (req, res) => {
  try {
    const { name, id } = req.body;

    if (!name || !id) {
      return res.status(400).json({ error: 'Name and ID are required' });
    }

    const models = await readJSON(MODELS_DB);
    if (!models) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (models.find(m => m.id === id)) {
      return res.status(400).json({ error: 'Model ID already exists' });
    }

    models.push({ name, id });
    await writeJSON(MODELS_DB, models);

    res.json({ success: true, message: 'Model added successfully' });

  } catch (error) {
    console.error('Add model error:', error);
    res.status(500).json({ error: 'Failed to add model' });
  }
});

app.put('/api/admin/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, newId } = req.body;

    const models = await readJSON(MODELS_DB);
    if (!models) {
      return res.status(500).json({ error: 'Database error' });
    }

    const modelIndex = models.findIndex(m => m.id === id);
    if (modelIndex === -1) {
      return res.status(404).json({ error: 'Model not found' });
    }

    if (name) models[modelIndex].name = name;
    if (newId) models[modelIndex].id = newId;

    await writeJSON(MODELS_DB, models);
    res.json({ success: true, message: 'Model updated successfully' });

  } catch (error) {
    console.error('Update model error:', error);
    res.status(500).json({ error: 'Failed to update model' });
  }
});

app.delete('/api/admin/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const models = await readJSON(MODELS_DB);

    if (!models) {
      return res.status(500).json({ error: 'Database error' });
    }

    const filteredModels = models.filter(m => m.id !== id);

    if (filteredModels.length === models.length) {
      return res.status(404).json({ error: 'Model not found' });
    }

    await writeJSON(MODELS_DB, filteredModels);
    res.json({ success: true, message: 'Model deleted successfully' });

  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RcBuilder API is running' });
});

// ==================== START SERVER ====================

initializeDirectories().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║        🚀 RcBuilder API Server                   ║
║                                                   ║
║        ✅ Server running on port ${PORT}          ║
║        🌐 http://localhost:${PORT}                ║
║        📁 Sessions dir: ${SESSIONS_DIR}           ║
║                                                   ║
║        Created by RiiCODE 💜                     ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
  });
});
