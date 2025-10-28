# ArtiPanel Quick Start Guide

**For Users Just Cloning from GitHub**

---

## The Setup Process (As Shown in Your Terminal)

```bash
ethan0892@ArtiPi:~ $ git clone https://github.com/Ethan0892/ArtiPanel.git
ethan0892@ArtiPi:~ $ cd ArtiPanel
ethan0892@ArtiPi:~/ArtiPanel $ cp examples/environment.sample .env
ethan0892@ArtiPi:~/ArtiPanel $ nano .env
```

✅ **This is correct!** Follow these steps.

---

## What Was Missing (Now Fixed)

When you tried to run the installation script, you got this error:

```bash
ethan0892@ArtiPi:~/ArtiPanel $ chmod +x scripts/install.sh
chmod: cannot access 'scripts/install.sh': No such file or directory
```

**We've now added**:
1. ✅ `scripts/install.sh` - Full automated installation script
2. ✅ `docs/SETUP.md` - Comprehensive setup documentation
3. ✅ Updated `README.md` with proper installation instructions

---

## Three Ways to Install ArtiPanel

### Option 1: Docker Compose (Easiest - Recommended)

```bash
cd ArtiPanel
cp examples/environment.sample .env
nano .env              # Edit configuration if needed

docker-compose up -d

# Access it
# Frontend: http://localhost:3000
# API: http://localhost:4000/api
```

**Requirements**: Docker and Docker Compose only  
**Time**: 2-3 minutes

### Option 2: Installation Script (Automated - Linux/macOS)

```bash
cd ArtiPanel
sudo chmod +x scripts/install.sh
sudo ./scripts/install.sh

# The script will:
# ✓ Check system requirements
# ✓ Install dependencies (Node.js, PostgreSQL, Redis)
# ✓ Setup database
# ✓ Install npm packages
# ✓ Start services
# ✓ Show access information
```

**Requirements**: sudo access  
**Supported**: Ubuntu, Debian, CentOS, macOS  
**Time**: 5-10 minutes

### Option 3: Manual Setup (Full Control - Advanced)

See [docs/SETUP.md](./docs/SETUP.md) for step-by-step manual installation.

---

## Recommended Setup Flow

```bash
# 1. Clone
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel

# 2. Copy environment
cp examples/environment.sample .env

# 3. Edit configuration (optional - defaults work for local testing)
nano .env

# 4. Start with Docker Compose
docker-compose up -d

# 5. Wait for services to start
sleep 30

# 6. Check status
docker-compose ps

# 7. Access in browser
# http://localhost:3000
```

---

## Verify Installation

```bash
# Check if all services are running
docker-compose ps

# Expected output (all showing "Up"):
# CONTAINER ID   IMAGE                    NAMES                 STATUS
# ...            artipanel-postgres       artipanel-postgres    Up 2 minutes
# ...            artipanel-redis          artipanel-redis       Up 2 minutes
# ...            artipanel-api            artipanel-api         Up 2 minutes
# ...            artipanel-frontend       artipanel-frontend    Up 2 minutes

# View logs
docker-compose logs -f

# Test API health
curl http://localhost:4000/health
```

---

## Quick Configuration

Edit `.env` with your settings:

```bash
# Essential settings
NODE_ENV=production
PORT=4000
FRONTEND_URL=http://yourdomain.com

# Database (Docker defaults are fine for testing)
DATABASE_PASSWORD=changeMe123

# JWT Secret (change this!)
JWT_SECRET=your_random_secret_key_minimum_32_chars_long

# Other settings - see backend/.env.example for full list
```

---

## Access Panel

### After Starting Services

1. **Frontend**: http://localhost:3000
2. **API**: http://localhost:4000/api
3. **Health**: http://localhost:4000/health

### Default Setup
- Complete the setup wizard in the browser
- Create admin account
- Configure nodes and servers

---

## Common Issues & Solutions

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Find what's using port 4000
lsof -i :4000

# Kill the process (if needed)
kill -9 <PID>
```

### Docker Not Starting

```bash
# Verify Docker is running
docker ps

# Start Docker service
sudo systemctl start docker

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Database Connection Failed

```bash
# Check PostgreSQL
docker-compose ps artipanel-postgres

# Restart database
docker-compose restart artipanel-postgres

# Check logs
docker-compose logs artipanel-postgres
```

### Can't Access http://localhost:3000

```bash
# Check if frontend is running
docker-compose ps artipanel-frontend

# Check frontend logs
docker-compose logs -f artipanel-frontend

# Restart frontend
docker-compose restart artipanel-frontend
```

---

## Complete Documentation

For more detailed information, see:

| Document | Purpose |
|----------|---------|
| [docs/SETUP.md](./docs/SETUP.md) | Complete setup & configuration guide |
| [docs/INSTALLATION.md](./docs/INSTALLATION.md) | Detailed installation guide |
| [docs/API.md](./docs/API.md) | REST API reference |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [README.md](./README.md) | Project overview |
| [README_SECURITY.md](./README_SECURITY.md) | Security features |

---

## Support

- **GitHub Issues**: https://github.com/Ethan0892/ArtiPanel/issues
- **GitHub Discussions**: https://github.com/Ethan0892/ArtiPanel/discussions
- **Documentation**: See `/docs/` folder

---

## What's Next?

After successful installation:

1. ✅ Access http://localhost:3000
2. ✅ Complete setup wizard
3. ✅ Read [docs/SETUP.md](./docs/SETUP.md)
4. ✅ Add first node
5. ✅ Add first server
6. ✅ Configure monitoring
7. ✅ Setup backups

---

**Version**: 0.1.0-alpha.1  
**Last Updated**: October 28, 2025  
**Status**: Production-Ready
