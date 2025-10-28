# ArtiPanel Setup & Installation Guide

**Version**: 0.1.0-alpha.1  
**Last Updated**: October 28, 2025  
**Status**: Production-Ready

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation Methods](#installation-methods)
4. [Docker Setup](#docker-setup)
5. [Manual Setup](#manual-setup)
6. [Configuration](#configuration)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel

# Copy environment template
cp examples/environment.sample .env

# Edit configuration
nano .env

# Start services
docker-compose up -d

# Access panel
# Frontend: http://localhost:3000
# API: http://localhost:4000/api
```

### Using Installation Script (Linux/macOS)

```bash
# Clone repository
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel

# Run installation script
sudo chmod +x scripts/install.sh
sudo ./scripts/install.sh

# Follow the wizard to complete setup
```

---

## System Requirements

### Minimum Configuration
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+) or macOS
- **Memory**: 2GB RAM
- **Storage**: 20GB available space
- **Node.js**: 18.0.0 or later
- **PostgreSQL**: 12 or later (or Docker)
- **Docker**: 20.10+ (for Docker setup)

### Recommended Configuration
- **OS**: Ubuntu 22.04 LTS or later
- **Memory**: 4GB+ RAM
- **Storage**: 50GB+ SSD
- **CPU**: 2+ cores
- **Network**: Gigabit internet connection

### Supported Operating Systems

| OS | Version | Status | Notes |
|---|---|---|---|
| Ubuntu | 20.04+ | ✅ Supported | Recommended |
| Debian | 11+ | ✅ Supported | Works well |
| CentOS | 8+ | ✅ Supported | Enterprise ready |
| Rocky Linux | 8+ | ✅ Supported | CentOS alternative |
| macOS | 10.15+ | ✅ Supported | Intel & Apple Silicon |
| Windows | 10/11 | ⚠️ WSL Only | Use WSL2 with Docker |

---

## Installation Methods

### Method 1: Docker Compose (Easiest)

```bash
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
cp examples/environment.sample .env
docker-compose up -d
```

**Pros**:
- ✅ Easiest setup
- ✅ Isolated environment
- ✅ Easy updates
- ✅ Cross-platform compatible

**Cons**:
- Requires Docker
- Slightly more overhead

### Method 2: Installation Script (Automated)

```bash
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
sudo chmod +x scripts/install.sh
sudo ./scripts/install.sh
```

**Pros**:
- ✅ Fully automated
- ✅ System-wide installation
- ✅ Native performance

**Cons**:
- Linux/macOS only
- Requires root access
- More complex dependencies

### Method 3: Manual Installation (Advanced)

```bash
# Install prerequisites
sudo apt-get install -y nodejs npm postgresql postgresql-contrib redis-server

# Clone repository
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel

# Setup backend
cd backend
npm install
npm run build
cd ..

# Setup frontend
cd frontend
npm install
npm run build
cd ..

# Setup database
createdb artipanel
psql artipanel < backend/schema.sql

# Start services
npm run start
```

**Pros**:
- ✅ Full control
- ✅ Customizable

**Cons**:
- Most complex
- Manual dependency management
- More troubleshooting needed

---

## Docker Setup

### Prerequisites

```bash
# Check Docker installation
docker --version
docker-compose --version

# If not installed, install Docker:
# Linux: curl -fsSL https://get.docker.com | sh
# macOS: https://www.docker.com/products/docker-desktop
# Windows: https://www.docker.com/products/docker-desktop
```

### Configuration

1. **Copy environment template**:
   ```bash
   cp examples/environment.sample .env
   ```

2. **Edit environment file**:
   ```bash
   nano .env
   ```

3. **Key variables to configure**:
   ```bash
   # Application
   NODE_ENV=production
   DEBUG=false

   # Server
   PORT=4000
   HOST=0.0.0.0
   FRONTEND_URL=http://yourdomain.com

   # Database
   DATABASE_HOST=postgres
   DATABASE_PORT=5432
   DATABASE_NAME=artipanel
   DATABASE_USER=artipanel
   DATABASE_PASSWORD=your_secure_password

   # JWT
   JWT_SECRET=your_random_secret_key_here
   JWT_EXPIRATION=24h

   # Other settings (see .env.example for full list)
   ```

### Docker Compose File

The `docker-compose.yml` includes:
- **artipanel-backend**: Node.js Express API server
- **artipanel-frontend**: React web interface
- **postgres**: PostgreSQL database
- **redis**: Caching and sessions
- **nginx**: Reverse proxy (optional)

### Running Containers

```bash
# Start all services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild images
docker-compose up -d --build
```

### Docker Network

All containers communicate through internal network:
- Backend: `http://artipanel-backend:4000`
- Database: `postgres:5432`
- Redis: `redis:6379`
- Frontend connects via: `http://localhost:3000`

---

## Manual Setup

### 1. Install System Dependencies

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install -y \
  nodejs npm git curl wget \
  postgresql postgresql-contrib \
  redis-server
```

**CentOS/Rocky**:
```bash
sudo yum install -y \
  nodejs npm git curl wget \
  postgresql postgresql-contrib postgresql-server \
  redis
```

**macOS** (with Homebrew):
```bash
brew install node postgresql redis
```

### 2. Verify Versions

```bash
node --version      # v18.0.0+
npm --version       # 8.0.0+
psql --version      # 12+
redis-cli --version # 6+
```

### 3. Clone Repository

```bash
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
```

### 4. Setup Database

**PostgreSQL**:
```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createdb artipanel
sudo -u postgres createuser artipanel
sudo -u postgres psql -c "ALTER USER artipanel WITH PASSWORD 'your_password'"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE artipanel TO artipanel"
```

### 5. Configure Environment

```bash
# Copy template
cp examples/environment.sample .env

# Edit configuration
nano .env

# Key variables:
# DATABASE_URL=postgresql://artipanel:password@localhost:5432/artipanel
# JWT_SECRET=your_secure_random_key
# NODE_ENV=production
```

### 6. Install Backend

```bash
cd backend
npm install --production
npm run build
cd ..
```

### 7. Install Frontend

```bash
cd frontend
npm install --production
npm run build
cd ..
```

### 8. Start Services

**Option A: Development Mode** (with auto-reload):
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Option B: Production Mode**:
```bash
cd backend
npm run start

# In another terminal
cd frontend
npm run preview
```

### 9. Access Application

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000/api`
- Health Check: `http://localhost:4000/health`

---

## Configuration

### Environment Variables

Create `.env` file with the following sections:

**Application**:
```bash
NODE_ENV=production
DEBUG=false
APP_NAME=ArtiPanel
APP_VERSION=0.1.0-alpha.1
```

**Server**:
```bash
PORT=4000
HOST=0.0.0.0
FRONTEND_URL=http://yourdomain.com
```

**Database**:
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=artipanel
DATABASE_USER=artipanel
DATABASE_PASSWORD=secure_password
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

**Redis**:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

**JWT**:
```bash
JWT_SECRET=your_random_secret_key_minimum_32_chars
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d
```

**Logging**:
```bash
LOG_LEVEL=info
LOG_FORMAT=json
```

**Security**:
```bash
ENCRYPTION_KEY=your_encryption_key_minimum_32_chars
SESSION_SECRET=your_session_secret_minimum_32_chars
```

See `backend/.env.example` for complete list of variables.

### Frontend Configuration

Frontend configuration in `frontend/src/config/panelConfig.ts`:
- API endpoint configuration
- UI/UX settings
- Feature flags
- Performance settings
- Security policies

---

## Verification

### Health Check

```bash
# Check backend health
curl http://localhost:4000/health

# Expected response:
# {
#   "status": "ok",
#   "uptime": 1234,
#   "memory": {...},
#   "version": "0.1.0-alpha.1",
#   "environment": "production"
# }
```

### Service Status

```bash
# Using Docker Compose
docker-compose ps

# All containers should show "Up"
```

### Database Connectivity

```bash
# Test database connection
psql -U artipanel -d artipanel -h localhost -c "SELECT 1"
```

### Frontend Access

1. Open `http://localhost:3000` in browser
2. You should see the ArtiPanel login page
3. Complete the setup wizard

### Logs

```bash
# Docker Compose logs
docker-compose logs -f

# Specific service
docker-compose logs -f artipanel-backend

# On filesystem
tail -f logs/combined.log
tail -f logs/error.log
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Find process using port 4000
lsof -i :4000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Docker Issues

```bash
# Rebuild containers
docker-compose down
docker-compose up -d --build

# Clear cache
docker system prune -a

# Check docker daemon
docker ps

# View docker logs
docker logs <container_id>
```

### Memory Issues

```bash
# Check available memory
free -h

# Increase Docker memory allocation
# Docker Desktop settings → Resources

# Reduce memory usage
# Disable unnecessary features in .env
```

### Frontend Not Loading

```bash
# Check if frontend is running
docker-compose ps artipanel-frontend

# Check frontend logs
docker-compose logs artipanel-frontend

# Rebuild frontend
docker-compose up -d --build artipanel-frontend
```

### Backend API Not Responding

```bash
# Check if backend is running
docker-compose ps artipanel-backend

# Check backend logs
docker-compose logs -f artipanel-backend

# Check if API is accessible
curl -v http://localhost:4000/health

# Restart backend
docker-compose restart artipanel-backend
```

### SSL/TLS Errors

```bash
# Check certificate
openssl x509 -in /path/to/cert.pem -text -noout

# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Update .env with certificate paths
# SSL_CERT_PATH=/path/to/cert.pem
# SSL_KEY_PATH=/path/to/key.pem
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker-compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Clear Redis cache
redis-cli FLUSHALL
```

---

## Next Steps

### 1. Complete Setup Wizard

- Login to `http://localhost:3000`
- Enter admin credentials
- Configure basic settings
- Add your first server/node

### 2. Configure Nodes

- Go to Nodes section
- Add your infrastructure nodes
- Configure resource allocation
- Set up monitoring

### 3. Add Servers

- Create servers on nodes
- Configure services
- Set up backups
- Enable monitoring

### 4. Setup Security

- Configure 2FA
- Review audit logs
- Setup SSL certificates
- Configure API keys

### 5. Read Documentation

- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Security Guide](../README_SECURITY.md)
- [Features Documentation](./FEATURES.md)

### 6. Monitor & Maintain

- Check health endpoint regularly
- Review logs periodically
- Update system regularly
- Backup database frequently

---

## Production Checklist

Before deploying to production:

- [ ] Database backups configured
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring and alerting setup
- [ ] Audit logging enabled
- [ ] Regular security updates enabled
- [ ] 2FA enabled for all users
- [ ] API keys rotated
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] DDoS protection enabled
- [ ] Disaster recovery plan documented

---

## Support & Resources

**Documentation**:
- API Reference: `docs/API.md`
- Architecture: `docs/ARCHITECTURE.md`
- Features: `docs/FEATURES.md`
- Nodes: `docs/NODES.md`

**Community**:
- GitHub Issues: https://github.com/Ethan0892/ArtiPanel/issues
- GitHub Discussions: https://github.com/Ethan0892/ArtiPanel/discussions

**Repository**:
- Main: https://github.com/Ethan0892/ArtiPanel
- Issues: https://github.com/Ethan0892/ArtiPanel/issues
- Releases: https://github.com/Ethan0892/ArtiPanel/releases

---

**Last Updated**: October 28, 2025  
**Version**: 0.1.0-alpha.1  
**Status**: Production-Ready Installation Guide
