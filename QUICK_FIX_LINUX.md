# Quick Fix: Your Specific Linux/RPi Issues

## Error 1: ts-node-dev: not found

You got:
```
sh: 1: ts-node-dev: not found
```

### Quick Fix:

```bash
cd backend
npm install -D ts-node-dev
npm run dev
```

### If that doesn't work:

```bash
# Fix permissions
sudo chown -R $(whoami) ~/.npm

# Clean and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Try again
npm run dev
```

---

## Error 2: EACCES: permission denied on frontend

You got:
```
Error: EACCES: permission denied, mkdir '/home/ethan/Tests/ArtiPanel/frontend/node_modules/.vite/deps_temp_...'
```

### Quick Fix (Run this immediately):

```bash
cd ~/Tests/ArtiPanel

# Fix all permissions
chmod -R u+w .

# Reinstall frontend
cd frontend
rm -rf node_modules package-lock.json node_modules/.vite
npm cache clean --force
npm install

npm run dev
```

### If still failing:

```bash
# Option 1: Configure npm to not use sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Option 2: Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm

# Then try again
npm install
npm run dev
```

---

## Your Exact Step-by-Step Fix

Follow this exactly for your situation:

```bash
# 1. Navigate to your project
cd ~/Tests/ArtiPanel

# 2. Fix ALL permissions first
chmod -R u+w .

# 3. Delete everything npm-related
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# 4. Install backend with ts-node-dev explicitly
cd backend
npm cache clean --force
npm install
npm install -D ts-node-dev

# 5. Test backend
npm run dev

# Expected output:
# [shows server running on http://localhost:4000]
# Press Ctrl+C to stop

# 6. In a NEW terminal, install frontend
cd ~/Tests/ArtiPanel/frontend
npm cache clean --force
npm install

# 7. Run frontend
npm run dev

# Expected output:
# VITE v5.4.21 ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

Then open in browser: **http://localhost:5173/**

---

## Preventing These Errors Going Forward

Add this to your `~/.bashrc`:

```bash
# Set Node.js memory limit (for Raspberry Pi)
export NODE_OPTIONS="--max-old-space-size=512"

# Configure npm to avoid sudo
export PATH=~/.npm-global/bin:$PATH

# Set npm registry (optional, faster)
npm config set registry https://registry.npmjs.org/
```

Reload with:
```bash
source ~/.bashrc
```

---

## One-Command Auto-Fix (Copy and Paste)

Save this as `quick-fix.sh` in your ArtiPanel directory:

```bash
#!/bin/bash
echo "🔧 Quick fixing ArtiPanel..."
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install -D ts-node-dev
cd ../frontend
rm -rf node_modules package-lock.json node_modules/.vite
npm cache clean --force
npm install
echo "✅ Done! Start servers with:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
```

Run with:
```bash
chmod +x quick-fix.sh
./quick-fix.sh
```

---

## Verify Everything Works

After following the fix, run these commands to verify:

```bash
# Check 1: Backend dependencies
cd backend
npm list ts-node-dev
# Should show: ts-node-dev@...

# Check 2: Frontend dependencies  
cd ../frontend
npm list vite
# Should show: vite@...

# Check 3: Backend responds
curl http://localhost:4000/api/auth/status
# Should show JSON response

# Check 4: Frontend loads
curl http://localhost:5173/
# Should show HTML
```

---

## If You See These - You're Good! ✅

**Backend:**
```
Server running on http://localhost:4000
Database initialized
```

**Frontend:**
```
VITE v5.4.21 ready in 603 ms

➜  Local:   http://localhost:5173/
```

**Browser:**
- Shows login page (or setup if first time)
- No console errors in DevTools (F12)

---

## Still Stuck?

Run this diagnostic command and share the output:

```bash
echo "=== DIAGNOSTIC INFO ===" && \
node --version && \
npm --version && \
uname -a && \
df -h . && \
free -h && \
echo "=== END ===" 
```

Share that output in a GitHub issue with:
- The error message you got
- Output from the diagnostic command above
- Steps to reproduce

---

**Created**: October 30, 2025  
**For**: Linux/Raspberry Pi users  
**Tested**: Raspberry Pi, Ubuntu, Debian
