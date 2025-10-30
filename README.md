# ArtiPanel - Enterprise Server Management Platform

> **Version**: 0.1.0-alpha.1  
> **Status**: Active Development  
> **License**: MIT  
> **GitHub**: [Ethan0892/ArtiPanel](https://github.com/Ethan0892/ArtiPanel)

ArtiPanel is a modern, open-source server control panel built for developers and system administrators. It combines server management, container orchestration, gaming server hosting, and NAS management into a single unified platform.

## 🚀 Quick Start (2 Minutes!)

### Automatic Setup (Recommended)

**For Linux/macOS:**
```bash
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
chmod +x setup.sh
bash setup.sh
```

**For Windows:**
```batch
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
setup.bat
```

The setup wizard will handle everything automatically! ✨

### Manual Setup

Prerequisites:
- **Node.js**: v16+ (v18+ recommended)
- **npm**: v7+

```bash
# 1. Clone the repository
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Start services
cd ../backend && PORT=4001 npm run dev
# In new terminal:
cd frontend && npm run dev
```

### First Login

The system automatically creates a default admin account:
- **URL**: http://localhost:3000
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately in production!

### Need Help?
See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for detailed instructions and troubleshooting.

## ✨ Core Features

### 🖥️ Server Management
- **Multi-Server Dashboard**: Monitor and manage multiple servers from one interface
- **Real-time System Monitoring**: CPU, Memory, Disk, Network metrics
- **SSH Terminal**: Direct terminal access to any server
- **File Manager**: Browse and edit server files
- **Process Management**: View and control running processes

### 🎮 Gaming Server Management
- **Minecraft Server Hosting**: Create, manage, and backup Minecraft servers
- **Multiple Game Support**: Extensible framework for additional game servers
- **Auto-Backups**: Scheduled backups with one-click restore
- **Player Management**: Whitelist, ban, and player administration
- **Performance Monitoring**: Game server-specific metrics

### 📦 Container & Orchestration
- **Docker Container Management**: Deploy, scale, and manage Docker containers
- **Docker Compose Support**: Multi-container application deployment
- **Kubernetes Integration**: Deploy to K8s clusters (advanced)
- **Container Logs & Monitoring**: Real-time container metrics

### 💾 Storage & NAS Management
- **Cloud Storage Integration**: Connect to S3, OneDrive, Google Drive
- **Local Storage Management**: Monitor and manage storage pools
- **Backup Automation**: Scheduled backups with encryption
- **Snapshot & Recovery**: Create and restore point-in-time snapshots

### 🔐 Security & Authentication
- **Role-Based Access Control**: Admin, User, Viewer roles
- **Session Management**: Secure token-based authentication
- **Password Reset**: Email-based password recovery with token verification
- **Password Strength Meter**: Real-time password strength validation
- **Two-Factor Authentication**: Optional 2FA for enhanced security (roadmap)

### 📊 Advanced Features
- **Monitoring & Alerts**: Set up alerts for system events
- **Resource Scheduling**: Schedule backups, updates, and maintenance
- **Remote Access**: VNC, RDP, and SSH terminal access
- **User Management**: Create and manage system users with role assignments
- **Audit Logging**: Comprehensive action logging for compliance

## 📋 Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (with JSON file storage for development)
- **Authentication**: JWT tokens (24-hour access, 7-day refresh)
- **Email**: Nodemailer (SMTP/mock support)
- **Real-time**: Socket.IO for live updates

### Frontend
- **Framework**: React 18+
- **Bundler**: Vite (⚡ Lightning-fast development)
- **Styling**: CSS3 with custom theme system
- **State Management**: Context API + Hooks
- **HTTP Client**: Axios with retry logic

## 📁 Project Structure

```
ArtiPanel/
├── backend/                          # Node.js/Express API Server
│   ├── src/
│   │   ├── api/routes/              # REST endpoints
│   │   ├── models/                  # Data models & business logic
│   │   ├── utils/                   # Helper functions & services
│   │   ├── middleware/              # Auth, logging, error handling
│   │   └── index.ts                 # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                         # React Dashboard
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── pages/                   # Page layouts
│   │   ├── context/                 # Context API (auth, theme)
│   │   ├── services/                # API communication
│   │   ├── styles/                  # CSS stylesheets
│   │   └── utils/                   # Utilities & helpers
│   ├── public/                       # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md
│   ├── AUTHENTICATION.md
│   ├── FEATURES.md
│   ├── CLI.md
│   └── DEPLOYMENT.md
│
└── README.md                         # This file
```

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```bash
# Server
NODE_ENV=development
PORT=4001
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artipanel
DB_USER=postgres
DB_PASSWORD=password

# Authentication
JWT_SECRET=your-super-secret-key-change-this
PASSWORD_SALT=artipanel-salt

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@artipanel.local
```

**Frontend** (`frontend/.env`):
```bash
REACT_APP_API_URL=http://localhost:4001
REACT_APP_WS_URL=ws://localhost:4001
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start

# Frontend
cd frontend
npm run build
npm run preview
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or use the provided Dockerfile
docker build -t artipanel:latest .
docker run -p 3000:3000 -p 4001:4001 artipanel:latest
```

## 📚 Documentation

- **[Architecture Overview](./docs/ARCHITECTURE.md)** - System design and components
- **[Authentication Guide](./docs/AUTHENTICATION.md)** - Auth flow and security
- **[Feature Reference](./docs/FEATURES.md)** - Detailed feature documentation
- **[CLI Reference](./docs/CLI.md)** - Command-line interface
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment
- **[Linux/RPi Setup](./SETUP_LINUX_RPI.md)** - Platform-specific setup
- **[Troubleshooting](./TROUBLESHOOTING_SETUP.md)** - Common issues and fixes

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Setup
```bash
# Install dependencies
npm install

# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck
```

## 🐛 Issues & Support

- **Found a bug?** [Open an issue](https://github.com/Ethan0892/ArtiPanel/issues)
- **Have a question?** Check the [Discussions](https://github.com/Ethan0892/ArtiPanel/discussions)
- **Need help?** See the [Troubleshooting guide](./TROUBLESHOOTING_SETUP.md)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by cPanel, Plesk, Coolify, and Pterodactyl
- Built with ❤️ for the open-source community
- Special thanks to all contributors

## 🗺️ Roadmap

### v0.2.0 (Q1 2026)
- [ ] Two-factor authentication (2FA)
- [ ] Advanced backup encryption
- [ ] Kubernetes support improvements
- [ ] Email integration enhancements

### v0.3.0 (Q2 2026)
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Custom branding
- [ ] API documentation portal

### v1.0.0 (Q3 2026)
- [ ] Production-ready release
- [ ] Enterprise features
- [ ] Commercial support options

---

**Made with ❤️ by [Ethan0892](https://github.com/Ethan0892)**
