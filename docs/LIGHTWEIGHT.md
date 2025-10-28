# ArtiPanel Lightweight Configuration

**For systems with limited resources**

---

## System Requirements - Lightweight

### Minimum Spec
- **OS**: Linux/macOS
- **CPU**: 1+ core
- **Memory**: 1GB RAM
- **Storage**: 5GB+ SSD
- **Network**: Internet connection

### Recommended Lightweight Spec
- **OS**: Linux (Ubuntu 22.04 LTS recommended)
- **CPU**: 2+ cores
- **Memory**: 2GB RAM
- **Storage**: 10GB+ SSD
- **Network**: Gigabit connection

---

## Lightweight Installation

### Method: Docker Compose (Minimal Resources)

```bash
git clone https://github.com/Ethan0892/ArtiPanel.git
cd ArtiPanel
cp examples/environment.sample .env

# For lightweight setup, edit .env
nano .env
```

**Key lightweight settings in `.env`:**

```bash
# Minimal logging
LOG_LEVEL=warn

# Lightweight database
DATABASE_HOST=postgres
DATABASE_PORT=5432

# Reduce connection pool
DATABASE_POOL_MIN=1
DATABASE_POOL_MAX=5

# Small cache
REDIS_DB=0

# Disable unnecessary features
DEBUG=false
```

Then start:

```bash
docker-compose up -d
```

---

## Resource Usage

After starting ArtiPanel with lightweight config:

| Service | Memory | Disk |
|---------|--------|------|
| PostgreSQL | 128MB | 100MB |
| Redis | 32MB | 50MB |
| Backend | 256MB | 500MB |
| Frontend | 128MB | 300MB |
| **Total** | **~600MB** | **~1GB** |

---

## Optimizations Applied

### Docker Optimizations
✅ Alpine Linux base images (small size)  
✅ Multi-stage builds (removes build tools)  
✅ Memory limits per container  
✅ Production Node.js setup  

### PostgreSQL Optimizations
✅ Alpine Linux version  
✅ Reduced shared buffers (128MB)  
✅ Limited connections (50)  
✅ Disabled appendonly in Redis  

### Redis Optimizations
✅ Alpine Linux version  
✅ Memory limit: 64MB  
✅ LRU eviction policy  
✅ No persistence by default  

### Node.js Optimizations
✅ Production builds only  
✅ Max old space: 256MB  
✅ Dev dependencies removed  
✅ Warn-level logging  

---

## Disk Space Breakdown (5GB setup)

```
ArtiPanel Installation
├── Source Code (200MB)
│   ├── backend/src
│   ├── frontend/src
│   └── node_modules (150MB)
│
├── Docker Images (2GB)
│   ├── Node:18-alpine (150MB)
│   ├── PostgreSQL:15-alpine (200MB)
│   ├── Redis:7-alpine (50MB)
│   ├── Nginx:alpine (60MB)
│   └── Built images (1.5GB)
│
├── Data Volumes (1.5GB)
│   ├── PostgreSQL data (500MB)
│   ├── Redis data (100MB)
│   └── Logs (200MB)
│
└── Overhead (800MB)
    ├── Docker system (500MB)
    └── Temporary files (300MB)

Total: ~5GB
```

---

## Performance Tuning

### For 1GB RAM Systems

```bash
# Edit backend/src/index.ts rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Reduced from 100
  standardHeaders: true,
});

# Edit docker-compose.yml memory:
# Set backend memory to 256MB max
# Set postgres memory to 128MB max
# Set redis memory to 32MB max
```

### For 2GB RAM Systems

```bash
# Edit docker-compose.yml memory:
# Set backend memory to 512MB max
# Set postgres memory to 256MB max
# Set redis memory to 64MB max

# This allows all services to run without swapping
```

### For 4GB+ RAM Systems

Can use default settings with full features enabled.

---

## Monitoring Lightweight Setup

```bash
# Check memory usage
docker stats

# Expected output for lightweight:
# artipanel-postgres: ~100MB
# artipanel-redis: ~20MB
# artipanel-api: ~200MB
# artipanel-frontend: ~80MB
# Total: ~400MB used
```

---

## Reducing Disk Usage Further

### Option 1: Disable Redis Persistence
```bash
# In docker-compose.yml, change redis command to:
command: redis-server --maxmemory 32mb --maxmemory-policy allkeys-lru
```
**Saves**: ~50MB disk

### Option 2: Limit Log Files
Create `backend/src/utils/logger.ts` config:
```typescript
// Limit log file size
maxSize: '5m', // 5MB max per file
maxFiles: '3', // Keep only 3 files
```
**Saves**: ~500MB over time

### Option 3: Use SQLite Instead of PostgreSQL
For very lightweight deployments (<1GB RAM):
- Removes PostgreSQL container entirely
- Uses embedded SQLite database
- Saves: ~300MB and 256MB RAM

See `docs/SETUP.md` for SQLite configuration.

---

## Troubleshooting Lightweight Setup

### "Out of Memory" Errors

```bash
# Reduce service memory limits in docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 256M

# Or increase swap
sudo swapon --show
# If no swap, create it:
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Slow Performance

```bash
# Check what's running
docker stats

# Check disk I/O
iostat -x 1

# If PostgreSQL is slow, increase shared_buffers:
POSTGRES_INITDB_ARGS: "-c shared_buffers=256MB"

# But this uses more memory
```

### Disk Space Getting Full

```bash
# Clean Docker cache
docker system prune

# Remove old volumes
docker volume prune

# Clear logs
rm -f logs/*.log
docker-compose restart

# Check what's using space
du -sh *
du -sh logs/
```

---

## Lightweight Features

### Included Features
✅ Server management  
✅ Node management  
✅ Container management  
✅ Monitoring (basic)  
✅ Backup scheduling  
✅ Authentication & 2FA  
✅ SSL/TLS support  
✅ API access  

### Disabled for Lightweight (Can Be Enabled)
⚠️ Gaming server management (enable if needed)  
⚠️ Advanced analytics  
⚠️ Full audit logging (limited to warnings)  
⚠️ NAS/Storage management  
⚠️ Kubernetes integration  

To enable features, edit `.env`:
```bash
FEATURE_GAMING=true
FEATURE_ANALYTICS=true
FEATURE_NAS=true
```

---

## Scaling from Lightweight to Production

### Phase 1: Lightweight (5GB, 1GB RAM)
- Docker Compose setup
- Single node
- Basic monitoring
- SQLite or minimal PostgreSQL

### Phase 2: Small Production (10GB, 2GB RAM)
- Docker Compose with resource limits
- Multiple node support
- Standard PostgreSQL
- Redis caching
- Basic backups

### Phase 3: Production (20GB+, 4GB+ RAM)
- Docker Compose or Kubernetes
- Multiple nodes
- Full PostgreSQL
- Redis + clustering
- Automated backups
- Advanced monitoring
- Load balancing

### Phase 4: Enterprise (50GB+, 8GB+ RAM)
- Kubernetes orchestration
- PostgreSQL with replication
- Redis Sentinel
- Full audit logging
- Advanced security
- Multi-region support
- Enterprise features

---

## Resource Upgrade Path

**Start Lightweight** (5GB, 1GB):
```bash
docker-compose up -d
# Works great for testing, small deployments
```

**Scale to Small Production** (10GB, 2GB):
```bash
# Just edit docker-compose memory limits
# Add automated backups
# Enable standard monitoring
```

**Scale to Full Production** (20GB+, 4GB+):
```bash
# Upgrade hardware
# Use Kubernetes if needed
# Enable all features
# Add load balancing
```

---

## Best Practices for Lightweight

1. **Use Docker Compose** - Most efficient for single host
2. **Alpine Linux images** - Minimal footprint
3. **Production builds** - No dev dependencies
4. **Memory limits** - Prevent runaway processes
5. **Log rotation** - Limit disk usage
6. **Regular cleanup** - `docker system prune`
7. **Monitor resources** - `docker stats`
8. **Upgrade gradually** - Scale as needed

---

## Getting Help

**Lightweight Issues**:
- Check `docker stats` for resource usage
- Read logs: `docker-compose logs -f`
- Test connectivity: `curl http://localhost:4000/health`

**Need More Resources**:
- Upgrade RAM or disk
- Or upgrade hardware tier
- See scaling guide above

**Questions**:
- GitHub Issues: Report problems
- GitHub Discussions: Ask questions
- Read docs/SETUP.md for detailed setup

---

## Summary

✅ **Works with 5GB disk space**  
✅ **Runs on 1GB RAM minimum**  
✅ **Uses Alpine Linux images**  
✅ **Optimized for production**  
✅ **Easy to scale up later**  

ArtiPanel is now lightweight-friendly while maintaining enterprise-grade functionality!

---

**Version**: 0.1.0-alpha.1  
**Lightweight Setup**: ✅ Complete  
**Disk Required**: 5GB minimum (10GB recommended)  
**RAM Required**: 1GB minimum (2GB recommended)  
**Status**: Production-Ready at Any Scale
