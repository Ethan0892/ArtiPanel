# ArtiPanel Installation & Setup Guide

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+), or Windows with WSL2
- **CPU**: 2+ cores (4+ recommended for production)
- **RAM**: 2GB minimum (4GB+ for production)
- **Storage**: 20GB+ available space
- **Network**: Stable internet connection

### Software Requirements
- Docker & Docker Compose (v20.10+)
- Node.js 18+ (for development only)
- npm 9+
- PostgreSQL 12+ (can be containerized)
- Git

## Installation Steps

### 1. Install Prerequisites

#### Ubuntu/Debian:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (optional, for development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### CentOS/RHEL:
```bash
# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone Repository

```bash
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
```

### 3. Configure Environment

```bash
# Copy environment template
cp examples/environment.sample .env

# Edit configuration
nano .env
```

**Essential `.env` variables:**
```bash
# Server
NODE_ENV=production
PORT=4000
API_URL=http://localhost:4000/api

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=artipanel
DB_USER=artipanel
DB_PASSWORD=your_secure_password_here

# Frontend
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:4000/api

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=24h

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### 4. Run Installer Script

```bash
chmod +x scripts/install.sh
sudo ./scripts/install.sh
```

**What the installer does:**
- Creates necessary directories
- Sets up PostgreSQL database
- Runs database migrations
- Builds Docker images
- Sets up SSL/TLS certificates
- Configures Nginx reverse proxy

### 5. Start Services

#### Option A: Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option B: Manual Setup
```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend (in another terminal)
cd frontend
npm install
npm run build
npm run preview
```

### 6. Access ArtiPanel

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000/api
- **API Docs**: http://localhost:4000/api/docs

### 7. Initial Setup

1. Open http://localhost:3000 in your browser
2. Create admin account
3. Configure your first server
4. Set up authentication methods
5. Configure monitoring preferences

## Adding Your First Server

### 1. SSH Connection
```bash
artictl server add --name "Main Server" \
  --host 192.168.1.100 \
  --user admin \
  --key ~/.ssh/id_rsa \
  --port 22
```

### 2. Web Interface
1. Go to Servers → Add Server
2. Enter connection details
3. Test connection
4. Configure monitoring

### 3. Docker Integration
```bash
artictl docker enable --server "Main Server"
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart services
docker-compose restart

# Full reset
docker-compose down -v
docker-compose up -d
```

### Database connection error
```bash
# Check PostgreSQL
docker-compose exec postgres psql -U artipanel -d artipanel

# Run migrations
docker-compose exec backend npm run migrate
```

### Port already in use
```bash
# Change ports in docker-compose.yml or .env
# Then restart services
docker-compose down
docker-compose up -d
```

### Authentication issues
```bash
# Reset admin password
docker-compose exec backend npm run reset-admin

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

## Updating ArtiPanel

```bash
# Pull latest code
git pull origin main

# Update dependencies
cd backend && npm install
cd ../frontend && npm install

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate
```

## Backup & Restore

### Backup
```bash
# Backup database
docker-compose exec postgres pg_dump -U artipanel artipanel > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup config
tar -czf artipanel_config_$(date +%Y%m%d_%H%M%S).tar.gz .env config/
```

### Restore
```bash
# Restore database
docker-compose exec -T postgres psql -U artipanel artipanel < backup_20240101_120000.sql

# Restore config
tar -xzf artipanel_config_20240101_120000.tar.gz
```

## Performance Tuning

### PostgreSQL
```bash
# In .env
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
```

### Redis
```bash
# Increase memory if needed
docker-compose.yml: 
  redis:
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Node.js
```bash
# Set memory limit
NODE_OPTIONS="--max-old-space-size=2048"
```

## Security Hardening

### 1. Change Default Credentials
```bash
# All passwords in .env should be strong (20+ characters)
# Use password generator: openssl rand -base64 32
```

### 2. Enable SSL/TLS
```bash
# Certificates are auto-generated, or use your own
CERT_FILE=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
KEY_FILE=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 3. Configure Firewall
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 4000/tcp (API, internal only)
```

### 4. Setup 2FA
1. In Settings → Security
2. Enable Two-Factor Authentication
3. Scan QR code with authenticator app

## Next Steps

- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Features Overview](./FEATURES.md)
- [Community Support](https://discord.gg/artipanel)

---

**Need help?** Open an issue on [GitHub](https://github.com/ArtisanTech/ArtiPanel/issues)
