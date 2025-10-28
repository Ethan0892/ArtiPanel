# ArtiPanel Node Management System

## Overview

ArtiPanel includes a **Pterodactyl-like distributed node system** for enterprise-scale game server hosting. This system allows you to manage game servers across multiple physical or virtual machines (nodes) with intelligent resource allocation, automatic failover, and load balancing.

**Why Nodes Matter:**
- Scale from single server to thousands of game servers
- Distribute load across multiple machines
- Achieve true high availability
- Support different hardware tiers
- Enable geographic distribution
- Optimize resource utilization

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────┐
│          ArtiPanel Control Panel (Master)           │
│  (REST API, Database, WebSocket Server, Dashboard)  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    ┌─────┐  ┌─────┐  ┌─────┐
    │Node1│  │Node2│  │Node3│
    │(US) │  │(EU) │  │(Asia)
    │     │  │     │  │     │
    │Game │  │Game │  │Game │
    │Svrs │  │Svrs │  │Svrs │
    └─────┘  └─────┘  └─────┘
```

### Node Structure

Each node is a containerized game server host with:
- Docker daemon for game server containers
- Allocated port ranges
- Resource limits (CPU, RAM, Disk)
- Real-time monitoring agents
- Heartbeat mechanism to master

### Allocation System

Allocations are port assignments on nodes:
- Each allocation = IP:Port combination
- Allocations are assigned to game servers
- Multiple allocations per server (for multi-port games)
- Automatic allocation to available ports

## API Endpoints

### Node Management

```bash
# List all nodes
GET /api/nodes

# Register new node
POST /api/nodes
{
  "name": "US East - Primary",
  "host": "192.168.1.10",
  "port": 8080,
  "region": "us-east-1",
  "memory_total": 32000,
  "disk_total": 500000,
  "cpu_count": 16,
  "servers_max": 50
}

# Get node details
GET /api/nodes/:id

# Update node config
PUT /api/nodes/:id

# Delete node (drain servers first)
DELETE /api/nodes/:id
```

### Node Health & Monitoring

```bash
# Get real-time node statistics
GET /api/nodes/:id/stats

# Send heartbeat (node to master)
POST /api/nodes/:id/heartbeat

# Get node health status
GET /api/nodes/:id/health
```

### Allocations (Port Management)

```bash
# List all allocations on node
GET /api/nodes/:id/allocations

# Get available ports
GET /api/nodes/:id/allocations/available

# Create new port allocation
POST /api/nodes/:id/allocations

# Delete allocation
DELETE /api/nodes/:id/allocations/:alloc_id
```

### Servers on Node

```bash
# List game servers on node
GET /api/nodes/:id/servers

# Deploy server to node
POST /api/nodes/:id/servers
{
  "name": "My Game Server",
  "game": "minecraft_java",
  "memory": 4096,
  "disk": 50000,
  "players_max": 20,
  "allocation": "alloc-001"
}
```

### Node Configuration

```bash
# Get node configuration
GET /api/nodes/:id/config

# Update node configuration
PUT /api/nodes/:id/config

# Suspend node (prevent new servers)
POST /api/nodes/:id/suspend

# Unsuspend node
POST /api/nodes/:id/unsuspend

# Reinstall node (drain servers first)
POST /api/nodes/:id/reinstall
```

## Key Features

### 1. Distributed Architecture
- Multiple nodes in different geographic regions
- Independent Docker daemon per node
- Master-node communication via HTTP/WebSocket
- Automatic node discovery

### 2. Resource Management
- CPU allocation per server
- RAM allocation per server
- Disk quota per server
- Overallocation support (percentage-based)
- Real-time usage tracking

### 3. Port Allocation
- Automatic port assignment from available pool
- Multiple ports per server support
- Port range configuration per node
- Port reservation system

### 4. Health Monitoring
- Real-time stats collection
- Heartbeat-based node detection
- Automatic health checks
- Issue detection and alerts
- Historical data tracking

### 5. Server Deployment
- One-click server creation on any node
- Automatic allocation assignment
- Resource constraint checking
- Deployment status tracking
- Rollback support

### 6. Server Migration
- Move servers between nodes
- Automatic data transfer
- Zero-downtime migration
- Allocation remapping
- Fallback to original node on failure

### 7. Load Balancing
- Automatic node selection based on resources
- Manual node pinning
- Resource-aware scheduling
- Geographic distribution

### 8. Failover & High Availability
- Automatic node failure detection
- Server restart on failure
- Migration to healthy node
- Alert generation
- Recovery status tracking

## Node Deployment

### Quick Start: Docker Deployment

```bash
# Pull ArtiPanel node container
docker pull artipanel/node:latest

# Run node
docker run -d \
  --name artipanel-node \
  -e MASTER_URL=http://master.artipanel.com \
  -e NODE_NAME="US East" \
  -e NODE_REGION="us-east-1" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8080:8080 \
  artipanel/node:latest
```

### Advanced: Multi-Node Kubernetes Setup

```yaml
apiVersion: v1
kind: Node
metadata:
  name: artipanel-node-1
  labels:
    region: us-east-1
    tier: primary
spec:
  capacity:
    cpu: 16
    memory: 32Gi
    ephemeral-storage: 500Gi
```

### Node Configuration

Required environment variables:

```bash
# Master communication
MASTER_URL=http://artipanel-master:4000
MASTER_API_KEY=your-secure-api-key

# Node identification
NODE_NAME=US East Primary
NODE_REGION=us-east-1
NODE_ID=node-001

# Resource allocation
MAX_SERVERS=50
MEMORY_OVERALLOCATE_PERCENT=100
DISK_OVERALLOCATE_PERCENT=100

# Container management
DOCKER_SOCKET=/var/run/docker.sock
SFTP_PORT=2222

# Monitoring
HEARTBEAT_INTERVAL=30
STATS_COLLECTION_INTERVAL=10
```

## Resource Allocation

### CPU Allocation
- Cores assigned per server (1-N)
- CPU limits enforced via Docker
- CPU shares for fairness
- Overallocation percentage configurable

### Memory Allocation
- RAM assigned per server (MB)
- Swap configuration
- Memory limits enforced
- OOM killer settings

### Disk Allocation
- Disk quota per server
- Ext4 quota support
- LVM thin provisioning support
- Automatic quota enforcement

### Example Resource Sizing

**Minecraft Java Server:**
```
CPU:    2-4 cores
RAM:    2-8 GB (depends on players)
Disk:   10-50 GB (depends on world)
```

**Minecraft Bedrock:**
```
CPU:    1-2 cores
RAM:    512 MB - 2 GB
Disk:   5-20 GB
```

## Monitoring & Alerts

### Real-time Stats
```json
GET /api/nodes/:id/stats
{
  "memory": {
    "total": 32000,
    "used": 18000,
    "available": 14000,
    "percent": 56.25
  },
  "disk": {
    "total": 500000,
    "used": 250000,
    "available": 250000,
    "percent": 50
  },
  "cpu": {
    "cores": 16,
    "usage": 45,
    "load_avg": [12.5, 10.2, 8.1]
  },
  "timestamp": "2025-10-28T15:45:23Z"
}
```

### Health Status
```json
GET /api/nodes/:id/health
{
  "status": "healthy",
  "memory_healthy": true,
  "disk_healthy": true,
  "cpu_healthy": true,
  "network_healthy": true,
  "docker_healthy": true,
  "issues": []
}
```

### Alert Types
- High memory usage (>90%)
- High disk usage (>95%)
- High CPU usage (>80%)
- Network connectivity issues
- Docker daemon errors
- Heartbeat missed
- Disk I/O errors
- Temperature warnings (if available)

## Allocation Management

### Allocation Pool

Each node has a pool of available ports:

```bash
# Node 1: 192.168.1.10:25565-25580
# Node 2: 192.168.1.11:25565-25580
# Node 3: 192.168.1.12:25565-25580
```

### Automatic Allocation

When creating a server:
1. Request resource requirements
2. Find suitable node (by region/tier)
3. Check node capacity
4. Reserve allocation from available pool
5. Deploy server
6. Assign allocation to server

### Manual Allocation

For specific requirements:
1. Choose node explicitly
2. Select specific allocation
3. Create server
4. Confirm allocation mapping

### Port Ranges

Configure per node:
```json
{
  "allocations": {
    "primary_ip": "192.168.1.10",
    "port_range_start": 25565,
    "port_range_end": 26000,
    "reserved_ports": [25565, 25566]
  }
}
```

## Load Balancing Strategies

### Resource-Based
- Allocate to least-used node
- Consider CPU, RAM, Disk
- Recommended for mixed workloads

### Region-Based
- Select node in requested region
- Fallback to nearest region
- Good for geographic distribution

### Tier-Based
- Premium tier for high-performance
- Standard tier for normal workloads
- Budget tier for testing

### Manual Selection
- User selects specific node
- Override automatic selection
- For specific requirements

## Migration

### Moving Servers Between Nodes

```bash
PUT /api/gaming/:id/node
{
  "target_node_id": "node-002"
}
```

**Migration Process:**
1. Stop game server on source node
2. Create backup of server data
3. Transfer data to target node
4. Start server on target node
5. Update allocation mapping
6. Verify server running
7. Optionally delete source data

**Zero-Downtime Alternative:**
- Available for some games
- Run dual instances briefly
- Switch player connections
- Graceful shutdown on source

## Disaster Recovery

### Node Failure
- Heartbeat timeout detection
- Automatic server restart on healthy node
- Alert generation
- Manual recovery options

### Data Loss Prevention
- Automatic backups before migration
- Backup retention policies
- Backup verification
- Restore procedures

### Recovery Steps
1. Detect node failure
2. Move servers to healthy nodes
3. Verify services running
4. Check data integrity
5. Alert administrators
6. Create incident ticket

## Performance Tuning

### Node Optimization
```bash
# Kernel parameters for Docker
vm.max_map_count=262144
net.ipv4.ip_forward=1
net.bridge.bridge-nf-call-iptables=1

# Docker daemon configuration
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Server Optimization
- Memory limits per server type
- CPU shares configuration
- I/O scheduling
- Network QoS settings

## Comparison with Pterodactyl

| Feature | Pterodactyl | ArtiPanel |
|---------|------------|-----------|
| Node Management | ✓ | ✓ Full featured |
| Port Allocation | ✓ | ✓ Enhanced |
| Resource Management | ✓ | ✓ Flexible |
| Gaming Support | ✓ Limited | ✓ **Extensive** |
| NAS Features | ✗ | ✓ **Yes** |
| Remote Console | ✓ Web | ✓ **VNC/RDP/SSH** |
| Cost | Free OSS | Free & **Open Source** |
| Dashboard | ✓ Good | ✓ **Modern React** |
| WebSocket Real-time | ✓ | ✓ |
| Multi-region | ✓ | ✓ |
| Kubernetes | ✗ | ✓ **Yes** |

## CLI Commands

```bash
# List nodes
artictl nodes list

# Get node info
artictl nodes get <node-id>

# Add node
artictl nodes add --name "US East" --host "192.168.1.10"

# Get node stats
artictl nodes stats <node-id>

# Create allocation
artictl allocations create <node-id> --ip "192.168.1.10" --port 25565

# Deploy server
artictl servers create --name "Test" --game minecraft_java --node <node-id>

# Migrate server
artictl servers migrate <server-id> --to-node <node-id>

# Health check
artictl nodes health <node-id>
```

## Security Considerations

### Node API Keys
- Unique key per node
- Rotate regularly
- Limit to node-specific operations
- IP whitelisting

### Firewall Rules
- Restrict master-node communication
- Game server port ranges
- SFTP port access
- Monitoring port access

### Encryption
- HTTPS for all master communication
- WebSocket over SSL
- Encrypted backups
- Encrypted data transfer between nodes

## Troubleshooting

### Node Not Connecting
```bash
# Check master reachability
curl -v http://master:4000/health

# Check API key
export ARTIPANEL_KEY=your-key
artictl nodes add --url master:4000

# Check firewall
telnet master 4000
```

### High Resource Usage
```bash
# Check running servers
docker ps -a

# Check resource usage
docker stats

# Identify heavy containers
docker top <container-id>
```

### Allocation Exhausted
```bash
# Check available allocations
curl http://master:4000/api/nodes/:id/allocations/available

# Expand port range
artictl nodes config <node-id> --port-range "25565-26000"

# Add new allocation batch
artictl allocations create-batch <node-id> --start 26000 --count 100
```

## Next Steps

1. **Deploy your first node** - Follow Quick Start above
2. **Create game server** - Use dashboard or API
3. **Monitor performance** - Check stats and alerts
4. **Scale** - Add more nodes as needed
5. **Optimize** - Tune resources for your workload

For more details, see:
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design
- [API Documentation](./docs/API.md) - Full API reference
- [CLI Guide](./docs/CLI.md) - Command-line tool

## Support

- GitHub Issues: https://github.com/artipanel/artipanel/issues
- Discord Community: https://discord.gg/artipanel
- Documentation: https://docs.artipanel.com

---

**ArtiPanel Node System** - Enterprise Game Server Hosting Made Easy
