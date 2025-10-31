# ArtiPanel v0.1.0-alpha.1 - Setup Complete ✅

**Date**: October 30, 2025  
**Status**: Ready for Use  
**Current Commit**: 3a2041e

## What's Implemented

### ✅ Core System
- Node.js/Express backend with TypeScript
- React frontend with Vite bundler
- Authentication system with JWT tokens
- User role-based access control
- Default admin auto-initialization on first startup

### ✅ Password Management
- Complete password reset system
- Email-based password recovery (mock + production modes)
- Real-time password strength meter
- Admin password reset capability
- Token-based verification (15-min expiration)

### ✅ Safety Features
- Auto-setup mode when no users exist
- Prevents login page lockout
- Fresh installations show setup page
- Default admin (admin/<password>) created from DEFAULT_ADMIN_PASSWORD in .env

### ✅ Configuration
- Port flexibility (backend on 4001, frontend on 3000)
- Environment variable support
- Development and production modes
- CORS configuration for frontend access

### ✅ Documentation
- Comprehensive README with quick start
- Main documentation hub
- Linux/Raspberry Pi setup guide
- Troubleshooting guide
- Architecture and feature documentation

## 🚀 Quick Start (Fresh Install)

### 1. Pull Latest Code
```bash
cd ~/Tests/ArtiPanel
git pull origin main
```

### 2. Start Backend
```bash
cd backend
npm install  # if first time
PORT=4001 npm run dev
```

### 3. Start Frontend (New Terminal)
```bash
cd frontend
npm install  # if first time
npm run dev
```

### 4. Access Application
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: Set via DEFAULT_ADMIN_PASSWORD in backend/.env

## 📋 Default Credentials

```
Username: admin
Password: ${DEFAULT_ADMIN_PASSWORD} (configure in .env)
```

⚠️ **IMPORTANT**: Configure a strong password in .env before deployment!

## 🗂️ Key Files

### Backend
- `backend/src/index.ts` - Server entry point (auto-creates default admin on startup)
- `backend/src/api/routes/auth.ts` - Authentication endpoints
- `backend/src/models/User.ts` - User model with initialization function
- `backend/src/utils/emailService.ts` - Email service for password reset

### Frontend
- `frontend/src/config/panelConfig.ts` - Configuration (ports set to 4001/3000)
- `frontend/src/components/Auth.tsx` - Login/setup component
- `frontend/src/components/PasswordStrengthMeter.tsx` - Password validator
- `frontend/src/context/AuthContext.tsx` - Auth state management

### Documentation
- `README.md` - Main project documentation
- `DOCUMENTATION.md` - Documentation hub
- `SETUP_LINUX_RPI.md` - Platform-specific setup
- `TROUBLESHOOTING_SETUP.md` - Common issues and fixes
- `SECURITY.md` - Security best practices

## 🔧 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Backend API | 4001 | http://localhost:4001 |
| Frontend | 3000 | http://localhost:3000 |
| WebSocket | 4001 | ws://localhost:4001 |

## 📊 Latest Commits

```
3a2041e - docs: Update all documentation and clean up obsolete files
c1d7b54 - feat: Auto-create default admin account on first startup
6134c13 - config: Update frontend API/WebSocket URLs to port 4001
efee17d - docs: Add quick fix guide for Linux/RPi specific errors
08b3fd9 - docs: Linux/RPi setup guide to documentation index
9c559e4 - docs: Comprehensive Linux/Raspberry Pi setup guide
```

## 🎯 Next Steps

### For Development
1. Review `docs/ARCHITECTURE.md` for system design
2. Check `DOCUMENTATION.md` for detailed guides
3. Read `SECURITY.md` for security best practices

### For Production Deployment
1. Change default admin password
2. Update `backend/.env` with production settings
3. Set up HTTPS/SSL certificate
4. Configure firewall rules
5. Enable email notifications
6. Set up automated backups

### Feature Development
- Review `docs/FEATURES.md` for available features
- Check GitHub issues for feature requests
- Submit PRs for new features/fixes

## 🚨 Troubleshooting

### Backend won't start
```bash
# Kill existing process
pkill -9 node

# Try different port
PORT=4002 npm run dev
```

### Frontend won't connect
```bash
# Clear cache
rm -rf frontend/node_modules
npm cache clean --force
npm install
npm run dev
```

### Permission issues (Linux/RPi)
```bash
# Fix permissions
chmod -R u+w ~/Tests/ArtiPanel
sudo chown -R $USER:$USER ~/Tests/ArtiPanel

# Reinstall
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

## 📚 Documentation Structure

```
Root Directory
├── README.md                    # Main project readme
├── DOCUMENTATION.md             # Docs hub & index
├── SETUP_LINUX_RPI.md          # Linux/RPi setup
├── TROUBLESHOOTING_SETUP.md    # Troubleshooting
├── SECURITY.md                 # Security guide
│
├── docs/                        # Detailed docs
│   ├── ARCHITECTURE.md
│   ├── AUTHENTICATION.md
│   ├── FEATURES.md
│   ├── DEPLOYMENT.md
│   └── CLI.md
│
├── backend/                     # API server
├── frontend/                    # Web UI
└── .github/                     # GitHub config
```

## ✨ System Highlights

### Auto-Initialization
- Default admin account created on first startup
- No manual setup required
- Login immediately with default credentials

### Security Features
- JWT-based authentication
- Password strength validation
- Email-based password reset
- Session management with token refresh
- PBKDF2-SHA512 password hashing

### Developer Experience
- TypeScript for type safety
- Vite for fast frontend builds
- Hot module replacement
- Comprehensive error handling
- Structured logging

## 🎉 You're All Set!

Your ArtiPanel instance is ready to use. Start both services and login with:
- **Username**: admin
- **Password**: Check your backend/.env DEFAULT_ADMIN_PASSWORD

Remember to configure a strong password in .env and review security settings for production use!

---

**Questions?** Check [DOCUMENTATION.md](./DOCUMENTATION.md) or [TROUBLESHOOTING_SETUP.md](./TROUBLESHOOTING_SETUP.md)

**Need help?** Open an issue on [GitHub](https://github.com/Ethan0892/ArtiPanel/issues)
