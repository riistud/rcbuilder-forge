# RcBuilder - AI Code Generation Platform

Full-stack AI-powered code generation platform with multi-model support, session management, and admin dashboard.

**Created by RiiCODE** 💜

## Project info

**URL**: https://lovable.dev/projects/a220d57a-2c6e-40c8-911e-28376e29c122

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a220d57a-2c6e-40c8-911e-28376e29c122) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start backend
cd public/api
npm install
npm start

# In another terminal, start frontend
npm run dev
```

Visit: `http://localhost:8080`

**Demo Accounts:**
- Admin: `admin` / `admin123`
- User: `demo` / `demo123`

### VPS Production Deployment

See detailed guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

Quick commands:
```bash
# Backend
cd public/api
npm install
pm2 start ecosystem.config.js

# Frontend
npm install
npm run build
pm2 start "serve -s dist -l 8080" --name "rcbuilder-frontend"
```

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express
- **AI**: DeepInfra API (Multiple models support)
- **Storage**: JSON files (users, models, sessions)

## Features

- Multi AI model support (Qwen, DeepSeek, GPT, etc)
- Real-time code generation
- Session management & download
- Admin dashboard for user & model management
- Beautiful glassmorphism UI design
- Responsive & modern interface

## How can I deploy this project?

### Option 1: Lovable Hosting

Simply open [Lovable](https://lovable.dev/projects/a220d57a-2c6e-40c8-911e-28376e29c122) and click on Share -> Publish.

### Option 2: VPS Deployment

Follow our comprehensive guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

Or quick start: [QUICKSTART.md](./QUICKSTART.md)

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
