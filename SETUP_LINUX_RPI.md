# ArtiPanel Setup Guide for Linux/Raspberry Pi

## Prerequisites Check

Before starting, ensure you have the required software installed:

```bash
# Check Node.js version (need v16+)
node --version

# Check npm version (need v7+)
npm --version

# Check git
git --version
```

If any are missing or outdated, install them:

```bash
# Update package manager
sudo apt-get update
sudo apt-get upgrade

# Install Node.js (v18 LTS recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install git (if not installed)
sudo apt-get install -y git
```

## Installation Steps

### 1. Clone the Repository

```bash
cd ~/Tests  # or wherever you want to install
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
```

### 2. Fix Permissions (CRITICAL for Linux/RPi)

This is the most common issue on Linux systems:

```bash
# Fix entire project permissions
chmod -R u+w .

# Specifically fix node_modules if it exists
rm -rf backend/node_modules frontend/node_modules
rm -rf backend/package-lock.json frontend/package-lock.json

# Ensure directories are writable
mkdir -p backend/node_modules
mkdir -p frontend/node_modules
mkdir -p backend/storage
chmod 755 backend/storage
```

### 3. Install Backend Dependencies

```bash
cd backend

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

# If ts-node-dev is still missing, install manually
npm install -D ts-node-dev

# Verify installation
npm list ts-node-dev
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

# Fix vite permissions issue
rm -rf node_modules/.vite
npm run build  # This recreates the cache properly
```

### 5. Verify Everything Works

```bash
# Test backend
cd ../backend
npm list | head -20

# Test frontend
cd ../frontend
npm list | head -20
```

## Running the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
Starting ts-node development server...
[timestamp] [info] Server running on http://localhost:4000
[timestamp] [info] Database connected
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.4.21 ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Terminal 3: Access the Application

```bash
# Open browser or use curl
curl http://localhost:5173/

# Check backend status
curl http://localhost:4000/api/auth/status
```

## Troubleshooting on Linux/RPi

### Error: ts-node-dev: not found

```bash
# Solution 1: Direct installation
cd backend
npm install ts-node-dev

# Solution 2: Use npx instead
npx ts-node-dev --respawn --transpile-only src/index.ts

# Solution 3: Check installation
which ts-node-dev
npm list -g ts-node-dev
```

### Error: EACCES: permission denied

**This is the most common error on Linux/RPi**

```bash
# Fix 1: Change npm permissions (RECOMMENDED)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Fix 2: Fix file permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) .

# Fix 3: Nuclear option (if stuck)
sudo rm -rf backend/node_modules frontend/node_modules
sudo npm install --prefix backend
sudo npm install --prefix frontend
```

### Error: Cannot find module 'vite'

```bash
cd frontend

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# If still failing, install globally
npm install -g vite

# Then try again
npm run dev
```

### Error: Port already in use

Backend on 4000 or frontend on 5173 might already be in use:

```bash
# Check what's using port 4000
lsof -i :4000

# Check what's using port 5173
lsof -i :5173

# Kill the process if needed
kill -9 <PID>

# Or use different ports
npm run dev -- --port 5174  # Frontend
# For backend, edit src/index.ts and change port
```

### Memory Issues on Raspberry Pi

If you get out-of-memory errors:

```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=512"
npm run dev

# Or permanently add to ~/.bashrc
echo 'export NODE_OPTIONS="--max-old-space-size=512"' >> ~/.bashrc
source ~/.bashrc

# For 4GB+ RPi, use 1024
export NODE_OPTIONS="--max-old-space-size=1024"
```

## Complete Fresh Install Script

If you want to automate everything, save this as `install.sh`:

```bash
#!/bin/bash

echo "ArtiPanel Fresh Install for Linux/RPi"
echo "======================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check npm version
NPM_VERSION=$(npm -v | cut -d. -f1)
if [ "$NPM_VERSION" -lt 7 ]; then
    echo "Upgrading npm..."
    npm install -g npm@latest
fi

echo "Versions:"
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"

# Fix permissions
echo "Fixing permissions..."
chmod -R u+w .
mkdir -p backend/storage frontend/dist

# Backend setup
echo "Setting up backend..."
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

if ! npm list ts-node-dev &> /dev/null; then
    npm install -D ts-node-dev
fi

cd ..

# Frontend setup
echo "Setting up frontend..."
cd frontend
rm -rf node_modules package-lock.json node_modules/.vite
npm cache clean --force
npm install

cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To run the application:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173/"
```

Run with:

```bash
chmod +x install.sh
./install.sh
```

## Development Environment Setup

### For Raspberry Pi Zero/1 (Limited Resources)

```bash
# Use lighter dev server
npm run build  # Instead of npm run dev for frontend

# Or use alternative dev server
npm install -D @vitejs/plugin-react

# Increase memory
export NODE_OPTIONS="--max-old-space-size=256"
```

### For Raspberry Pi 3/4+ (More Resources)

```bash
# Standard setup should work fine
# Just ensure permissions are correct
npm run dev
```

### Optional: Use PM2 for Running Services

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "artipanel-backend",
      script: "./backend/dist/index.js",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M"
    },
    {
      name: "artipanel-frontend",
      script: "npm",
      args: "run preview",
      cwd: "./frontend",
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
EOF

# Build and start
npm run build --prefix backend
npm run build --prefix frontend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Quick Verification Checklist

- [ ] Node.js v16+ installed
- [ ] npm v7+ installed
- [ ] Git installed
- [ ] Backend dependencies installed (`npm list ts-node-dev`)
- [ ] Frontend dependencies installed (`npm list vite`)
- [ ] backend/storage directory exists and is writable
- [ ] Backend starts without errors (`npm run dev` in backend)
- [ ] Frontend starts without errors (`npm run dev` in frontend)
- [ ] Backend responds to requests (`curl http://localhost:4000/api/auth/status`)
- [ ] Frontend loads in browser (http://localhost:5173/)

## Common Commands Reference

```bash
# Clean everything
cd backend && rm -rf node_modules package-lock.json dist
cd ../frontend && rm -rf node_modules package-lock.json dist build

# Rebuild
npm install --prefix backend
npm install --prefix frontend

# Run development
npm run dev --prefix backend  # Terminal 1
npm run dev --prefix frontend # Terminal 2

# Build for production
npm run build --prefix backend
npm run build --prefix frontend

# Run production build
npm run start --prefix backend
npm run preview --prefix frontend

# Check for issues
npm list --prefix backend
npm list --prefix frontend
npm audit --prefix backend
npm audit --prefix frontend
```

## Still Having Issues?

1. **Check Node version**: `node --version` (need v16+)
2. **Check npm version**: `npm --version` (need v7+)
3. **Check permissions**: `ls -la backend/node_modules/.bin/ts-node-dev`
4. **Check disk space**: `df -h` (need at least 500MB free)
5. **Check memory**: `free -h` (need at least 512MB available)
6. **Clear cache**: `npm cache clean --force`
7. **Nuclear reset**: Delete all node_modules and package-lock.json, start fresh

## Support

If you're still stuck:

1. Share the **full error message**
2. Share output of:
   ```bash
   node --version
   npm --version
   df -h
   free -h
   ```
3. Share your **OS**: `lsb_release -a` or `uname -a`
4. Create an issue on GitHub with all this info

---

**Last Updated**: October 30, 2025  
**Tested On**: Linux/Raspberry Pi  
**Node Version**: v16+  
**npm Version**: v7+
