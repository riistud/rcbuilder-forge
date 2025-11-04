#!/bin/bash

echo "======================================"
echo "   Starting RcBuilder Backend API"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js v18 or higher"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "WARNING: Node.js version is $NODE_VERSION"
    echo "Recommended version is 18 or higher"
fi

# Navigate to the API directory
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if acc.json exists
if [ ! -f "acc.json" ]; then
    echo "WARNING: acc.json not found!"
    echo "Creating default acc.json..."
    cat > acc.json << 'EOF'
[
  {
    "username": "admin",
    "password": "admin123",
    "role": "admin",
    "exp": "Lifetime"
  },
  {
    "username": "demo",
    "password": "demo123",
    "role": "user",
    "exp": "2025-12-31"
  }
]
EOF
fi

# Check if models.json exists
if [ ! -f "models.json" ]; then
    echo "WARNING: models.json not found!"
    echo "Creating default models.json..."
    cat > models.json << 'EOF'
[
  {
    "name": "Qwen3-Coder-30B",
    "id": "Qwen/Qwen3-Coder-30B-A3B-Instruct"
  },
  {
    "name": "Qwen3-Next-80B",
    "id": "Qwen/Qwen3-Next-80B-A3B-Instruct"
  },
  {
    "name": "DeepSeek-V3.1",
    "id": "deepseek-ai/DeepSeek-V3.1"
  }
]
EOF
fi

# Create sessions directory if it doesn't exist
if [ ! -d "sessions" ]; then
    echo "Creating sessions directory..."
    mkdir -p sessions
fi

echo ""
echo "Starting server..."
echo "================================"

# Start the server
node server.js
