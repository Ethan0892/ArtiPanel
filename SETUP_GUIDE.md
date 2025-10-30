# ArtiPanel Setup Guide

Welcome to ArtiPanel! This guide will help you get started quickly with our automated setup wizards.

## Quick Start

### For Linux/macOS Users

```bash
# 1. Clone the repository
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel

# 2. Make the setup script executable
chmod +x setup.sh

# 3. Run the setup wizard
bash setup.sh
```

The wizard will:
- ✅ Check all prerequisites (Node.js, npm, git)
- ✅ Fix file permissions
- ✅ Check port availability
- ✅ Install all dependencies
- ✅ Configure the application
- ✅ Start both services automatically

### For Windows Users

```batch
# 1. Clone the repository
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel

# 2. Run the setup wizard
setup.bat
```

The wizard will:
- ✅ Check all prerequisites (Node.js, npm)
- ✅ Check port availability
- ✅ Install all dependencies
- ✅ Configure the application
- ✅ Offer to start services

## Default Login

Once setup is complete, access ArtiPanel at:

```
URL: http://localhost:3000
Username: admin
Password: admin123
```

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## Setup Options

### For Linux/macOS

```bash
# Interactive setup (recommended)
bash setup.sh

# Skip prerequisite checks (faster)
bash setup.sh --skip-checks

# Custom ports
bash setup.sh --backend-port 4002 --frontend-port 3001

# Show help
bash setup.sh --help
```

### For Windows

Simply run:
```batch
setup.bat
```

The wizard will prompt you for options interactively.

## Manual Setup (if wizard doesn't work)

### Step 1: Clone Repository
```bash
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
```

### Step 2: Fix Permissions (Linux/macOS only)
```bash
chmod -R u+w .
```

### Step 3: Install Backend
```bash
cd backend
npm install
```

### Step 4: Install Frontend
```bash
cd ../frontend
npm install
```

### Step 5: Start Backend
```bash
cd ../backend
PORT=4001 npm run dev
```

### Step 6: Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### Step 7: Access the Application
Open your browser and go to: **http://localhost:3000**

## Troubleshooting

### "Permission denied" on Linux/macOS
```bash
# Fix permissions
chmod -R u+w ~/path/to/ArtiPanel
sudo chown -R $USER:$USER ~/path/to/ArtiPanel

# Try setup again
bash setup.sh
```

### "Port already in use"
The wizard will automatically detect this and offer alternative ports.

Or manually change ports:
```bash
# Linux/macOS
PORT=4002 npm run dev

# Windows (in Command Prompt)
set PORT=4002
npm run dev
```

### "Command not found: node"
You need to install Node.js:
- Visit: https://nodejs.org/
- Download Node.js v16 or higher (LTS recommended)
- Install and verify: `node --version`

### "npm ERR! code EACCES"
Clear cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Frontend won't connect to backend
1. Make sure backend is running on port 4001
2. Check browser console (F12) for errors
3. Try: `curl http://localhost:4001/api/auth/status`
4. Clear browser cache and refresh page

## What Gets Installed

### Backend
- Express.js server
- TypeScript compiler
- JWT authentication
- Password reset functionality
- Email service support
- WebSocket support

### Frontend
- React 18
- Vite bundler
- Context API for state management
- Password strength validator
- Authentication forms

## Next Steps

### After First Login
1. **Change Admin Password**: Click user icon → Settings → Change Password
2. **Explore Dashboard**: Familiarize yourself with the interface
3. **Create Users**: Admin Panel → Users → Add New User
4. **Configure Settings**: Check Settings for system configuration

### For Production
1. Update `.env` files with production settings
2. Enable HTTPS/SSL certificate
3. Configure firewall rules
4. Set up automated backups
5. Configure email notifications
6. Set strong JWT_SECRET in backend/.env

## Important Configuration

### Backend Configuration (`backend/.env`)
```bash
NODE_ENV=development              # development or production
PORT=4001                         # Backend port
FRONTEND_URL=http://localhost:3000

# Change these for production!
JWT_SECRET=change-to-random-string
PASSWORD_SALT=change-to-random-string
```

### Frontend Configuration (`frontend/.env`)
```bash
REACT_APP_API_URL=http://localhost:4001
REACT_APP_WS_URL=ws://localhost:4001
```

## Getting Help

- **Documentation**: See [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Troubleshooting**: See [TROUBLESHOOTING_SETUP.md](./TROUBLESHOOTING_SETUP.md)
- **Linux/RPi Issues**: See [SETUP_LINUX_RPI.md](./SETUP_LINUX_RPI.md)
- **Security**: See [SECURITY.md](./SECURITY.md)
- **GitHub Issues**: https://github.com/Ethan0892/ArtiPanel/issues

## Starting Services Manually

If the wizard doesn't start services automatically:

### Linux/macOS
```bash
# Terminal 1 - Backend
cd backend
PORT=4001 npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Windows
```batch
REM Terminal 1 - Backend
cd backend
set PORT=4001
npm run dev

REM Terminal 2 - Frontend
cd frontend
npm run dev
```

## Service URLs

| Service | URL |
|---------|-----|
| Frontend (Web UI) | http://localhost:3000 |
| Backend API | http://localhost:4001 |
| WebSocket | ws://localhost:4001 |

## Verify Installation

To verify everything is working:

```bash
# Check backend is running
curl http://localhost:4001/api/auth/status

# Expected response:
# {"initialized":true,"requiresSetup":false}

# Open in browser
# http://localhost:3000
# Should show login form
```

---

**Congratulations!** Your ArtiPanel instance is ready to use. 🎉

For more information, see the full [Documentation](./DOCUMENTATION.md).
