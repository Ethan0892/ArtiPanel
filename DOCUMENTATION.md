# ArtiPanel Documentation Hub

Welcome to the ArtiPanel documentation! This is your one-stop resource for everything related to the ArtiPanel server management platform.

## 🚀 Getting Started

### ⚡ Fastest Way (Recommended)
**[Setup Wizard](./SETUP_GUIDE.md)** - Automated setup in 2 minutes!

```bash
# Linux/macOS
bash setup.sh

# Windows
setup.bat
```

### For New Users
1. **[Setup Guide](./SETUP_GUIDE.md)** - Automated setup wizard (recommended)
2. **[Quick Start Guide](./README.md)** - Get up and running in 5 minutes
3. **[First Login Guide](#first-login)** - How to access and configure your first admin account
4. **[Web Interface Tour](./docs/FEATURES.md)** - Overview of all features

### For Developers
1. **[Architecture Overview](./docs/ARCHITECTURE.md)** - Understand the system design
2. **[Development Setup](./README.md#-running-the-application)** - Set up your dev environment
3. **[API Reference](./docs/FEATURES.md)** - REST API documentation

### For System Administrators
1. **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deploy to production
2. **[Configuration Guide](#configuration)** - Environment setup
3. **[Security Guide](./SECURITY.md)** - Hardening and best practices

### For Linux/Raspberry Pi Users
1. **[Linux/RPi Setup Guide](./SETUP_LINUX_RPI.md)** - Platform-specific installation
2. **[Troubleshooting Guide](./TROUBLESHOOTING_SETUP.md)** - Common issues and fixes

## 🔑 First Login

### Default Credentials
When you start ArtiPanel for the first time, a default admin account is automatically created with credentials configured in your `.env` file (see `backend/.env.example`):

```
Username: admin
Password: ${DEFAULT_ADMIN_PASSWORD} (set in .env)
```

### ⚠️ First Steps (IMPORTANT!)
1. **Always set a strong password** in the `.env` file under `DEFAULT_ADMIN_PASSWORD` before starting the application
2. Change the admin password after first login
3. Create additional user accounts as needed
3. Configure your server connections
4. Set up monitoring alerts

## 📚 Core Documentation

### Installation & Setup
- **[docs/SETUP.md](./docs/SETUP.md)** - Complete setup and configuration
- **[docs/INSTALLATION.md](./docs/INSTALLATION.md)** - Detailed installation steps
- **[FIRST_USER_SETUP.txt](./FIRST_USER_SETUP.txt)** - Visual guide to first admin account setup

### Authentication & Users
- **[docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)** - Complete auth system guide including password reset
- Password reset: Admin can reset user passwords through Users dashboard
- Forgot password: Users can request password reset (admin must approve)

### Architecture & Design
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture overview
- **[REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md)** - Project structure and file organization
- **[LOGO_SHOWCASE.md](./LOGO_SHOWCASE.md)** - Logo design and branding

### Features
- **[docs/FEATURES.md](./docs/FEATURES.md)** - Complete feature list
- **[docs/NODES.md](./docs/NODES.md)** - Node management system

### Security
- **[SECURITY.md](./SECURITY.md)** - Security features and best practices
- **[README_SECURITY.md](./README_SECURITY.md)** - Additional security notes

### API Documentation
- **[docs/API.md](./docs/API.md)** - REST API reference

### Branding
- **[frontend/public/LOGO_GUIDE.md](./frontend/public/LOGO_GUIDE.md)** - Logo usage guidelines

## 📋 Advanced Topics

### Optimization
- **[LIGHTWEIGHT_OPTIMIZATION.md](./LIGHTWEIGHT_OPTIMIZATION.md)** - Performance optimization guide
- **[MODERNIZATION.md](./MODERNIZATION.md)** - Modern development practices

### CLI
- **[docs/CLI.md](./docs/CLI.md)** - Command-line interface reference

### Lightweight Installation
- **[docs/LIGHTWEIGHT.md](./docs/LIGHTWEIGHT.md)** - Minimal installation guide

## 📖 Main Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Project overview and features |
| [QUICKSTART.md](./QUICKSTART.md) | Quick setup guide |
| [START_HERE.md](./START_HERE.md) | Getting started |
| [FIRST_USER_SETUP.txt](./FIRST_USER_SETUP.txt) | Visual setup guide |
| [LOGO_SHOWCASE.md](./LOGO_SHOWCASE.md) | Logo and branding |

## 🗂️ Directory Structure

```
ArtiPanel/
├── docs/                          # Detailed documentation
│   ├── SETUP.md                   # Setup guide
│   ├── INSTALLATION.md            # Installation steps
│   ├── AUTHENTICATION.md          # Auth system (includes password reset)
│   ├── ARCHITECTURE.md            # System design
│   ├── FEATURES.md                # Feature list
│   ├── NODES.md                   # Node management
│   ├── API.md                     # API reference
│   ├── CLI.md                     # CLI reference
│   └── LIGHTWEIGHT.md             # Minimal setup
│
├── frontend/
│   ├── public/
│   │   ├── logo.svg              # Full logo
│   │   ├── favicon.svg           # Browser favicon
│   │   ├── icon.svg              # Small icon
│   │   └── LOGO_GUIDE.md         # Logo usage
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── api/routes/
│   │   │   ├── auth.ts           # Auth endpoints (includes password reset)
│   │   │   └── admin.ts          # Admin endpoints
│   │   ├── models/
│   │   └── utils/
│   └── ...
│
├── README.md                      # Project overview
├── QUICKSTART.md                  # Quick start guide
├── START_HERE.md                  # Getting started
├── FIRST_USER_SETUP.txt           # Visual setup guide
├── LOGO_SHOWCASE.md               # Logo information
├── SECURITY.md                    # Security features
└── REPOSITORY_STRUCTURE.md        # Repository layout
```

## � Troubleshooting

Having issues? Check these resources:

- **[TROUBLESHOOTING_SETUP.md](./TROUBLESHOOTING_SETUP.md)** - Fresh installation problems
  - Login page showing instead of setup
  - Browser storage issues
  - Clear browser cache solutions
  - Complete reset procedures
  - Automated fix scripts

## �🔐 Password Reset Workflow

### User Forgot Password
1. User clicks "Forgot Password" on login page
2. Enters username
3. System sends password reset instructions (if account exists)
4. User contacts administrator for manual reset

### Administrator Reset
1. Admin goes to Users dashboard
2. Finds the user account
3. Uses password reset endpoint to set new password
4. User can login with new password

See **[docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)** for complete details.

## 🎨 Branding & Logo

ArtiPanel features a modern professional logo system:
- **Full Logo** (`logo.svg`) - For splash screens and documentation
- **Favicon** (`favicon.svg`) - Browser tab icon
- **Icon** (`icon.svg`) - Navigation and buttons

See **[LOGO_SHOWCASE.md](./LOGO_SHOWCASE.md)** for design details.

## 🚀 Key Features

- ✅ Pterodactyl-style authentication
- ✅ First-user auto-admin setup
- ✅ Role-based access control (Admin, User, Viewer)
- ✅ Password reset system
- ✅ User management dashboard
- ✅ Server and node management
- ✅ Real-time monitoring
- ✅ Modern professional UI

## 🔗 Quick Links

### Getting Help
- 📖 See [docs/SETUP.md](./docs/SETUP.md) for setup issues
- 🔐 See [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md) for auth/login issues
- 💾 See [docs/INSTALLATION.md](./docs/INSTALLATION.md) for installation issues

### Common Tasks
- **Setup ArtiPanel**: See [QUICKSTART.md](./QUICKSTART.md)
- **First-time login**: See [FIRST_USER_SETUP.txt](./FIRST_USER_SETUP.txt)
- **Reset a user's password**: See [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)
- **Understand architecture**: See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **API integration**: See [docs/API.md](./docs/API.md)

## 📝 Document Legend

| Icon | Meaning |
|------|---------|
| 📖 | Main documentation |
| 🚀 | Getting started |
| 🔐 | Security/Authentication |
| 💻 | Technical details |
| 🎨 | Design/Branding |
| 📋 | Lists/References |

## Version Info

- **Current Version**: 0.1.0-alpha.1
- **Last Updated**: October 30, 2025
- **Status**: Production Ready

---

**Need help?** Start with [QUICKSTART.md](./QUICKSTART.md) or [START_HERE.md](./START_HERE.md)!
