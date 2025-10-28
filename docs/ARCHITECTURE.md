# ArtiPanel Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
├──────────────────────┬──────────────────────────────────────────┤
│   React Frontend     │      Web UI (Vite + React 18)            │
│   (Port 3000)        │  - Real-time dashboards                  │
│                      │  - WebSocket subscriptions                │
│                      │  - Responsive design                      │
└──────────────────────┴──────────────────────────────────────────┘
              │                            │
              │ HTTP/WebSocket             │ REST API calls
              │                            │
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                            │
├──────────────────────────────────────────────────────────────────┤
│   Express.js API Server (Port 4000)                             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Route Handlers                                          │   │
│  │  - /api/servers        (Server management)             │   │
│  │  - /api/containers     (Docker/Kubernetes)             │   │
│  │  - /api/gaming         (Game servers)                  │   │
│  │  - /api/storage        (NAS/RAID management)           │   │
│  │  - /api/monitoring     (Health & alerts)               │   │
│  │  - /api/remote         (VNC/RDP/SSH)                   │   │
│  │  - /api/auth           (Authentication)                │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Middleware                                              │   │
│  │  - JWT Authentication                                  │   │
│  │  - Rate Limiting                                       │   │
│  │  - CORS & Security Headers (Helmet)                    │   │
│  │  - Request Logging (Winston)                           │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ WebSocket Server (Socket.io)                            │   │
│  │  - Real-time server stats                              │   │
│  │  - Terminal console events                             │   │
│  │  - Alert notifications                                 │   │
│  │  - Live monitoring updates                             │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
              │                            │                │
              │ SSH/WinRM                  │ Direct API     │ WebSocket
              │                            │ Calls          │
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE TIER                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Server Service  │  │ Container Svc   │  │ Gaming Service  │ │
│  │                 │  │                 │  │                 │ │
│  │ - SSH tunneling │  │ - Docker client │  │ - Minecraft mgr │ │
│  │ - Exec commands │  │ - K8s client    │  │ - Backups       │ │
│  │ - System info   │  │ - Image mgmt    │  │ - Mod installer │ │
│  │ - Status check  │  │ - Networking    │  │ - Player mgmt   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Storage Service │  │ Monitoring Svc  │  │ Auth Service    │ │
│  │                 │  │                 │  │                 │ │
│  │ - RAID mgmt     │  │ - Prometheus    │  │ - JWT tokens    │ │
│  │ - Share mgmt    │  │ - Alerts        │  │ - 2FA setup     │ │
│  │ - Quotas        │  │ - Logs          │  │ - RBAC          │ │
│  │ - Backups       │  │ - Performance   │  │ - API keys      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
              │                 │                    │
              │ SSH/WinRM       │ Direct API         │ Local sockets
              │                 │                    │
┌─────────────────────────────────────────────────────────────────┐
│                    MANAGED SERVERS                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Linux Server  │  Windows Server  │  Docker Host  │  Kubernetes │
│  (Ubuntu/      │  (Server 2019/   │              │  Cluster     │
│   Debian/      │   2022 with WinRM)              │              │
│   CentOS)      │                  │              │              │
│                │                  │              │              │
│ OpenSSH       │  OpenSSH/WinRM   │  Docker      │  kubectl     │
│ Docker         │  Docker          │  Engine      │  API         │
│ Systemd        │  Hyper-V/VSphere │  DockerD     │              │
│ cGroups        │  .NET Core       │  Compose     │              │
│ UFW/Firewalld  │  Firewall Config │  Swarm       │              │
│                │                  │              │              │
└──────────────────────────────────────────────────────────────────┘
              │                 │                    │
              │                 │                    │
┌─────────────────────────────────────────────────────────────────┐
│                      DATA TIER                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  PostgreSQL DB   │  │   Redis Cache    │  │  File Storage  │ │
│  │                  │  │                  │  │                │ │
│  │ - Servers        │  │ - Session data   │  │ - Backups      │ │
│  │ - Users/Auth     │  │ - Cache layer    │  │ - Logs         │ │
│  │ - Config         │  │ - Rate limits    │  │ - Configs      │ │
│  │ - Audit logs     │  │ - Real-time data │  │ - Media        │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ Message Queue    │  │  S3/Cloud Storage│  (Optional)         │
│  │ (Bull/RabbitMQ)  │  │                  │                     │
│  │                  │  │ - Backups        │                     │
│  │ - Jobs           │  │ - Archive logs   │                     │
│  │ - Tasks          │  │ - Disaster recov │                     │
│  │ - Notifications  │  │                  │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Architecture
```
React App (Vite)
├── Pages/
│   ├── Dashboard
│   ├── Servers
│   ├── Containers
│   ├── Gaming
│   ├── Storage
│   ├── Monitoring
│   └── Settings
├── Components/
│   ├── Common
│   ├── Charts
│   ├── Forms
│   ├── Modals
│   └── Layouts
├── Hooks/
│   ├── useServers()
│   ├── useContainers()
│   ├── useWebSocket()
│   └── useMonitoring()
├── Services/
│   ├── api.ts (Axios)
│   ├── websocket.ts (Socket.io)
│   └── auth.ts
└── Store/
    └── Zustand stores
```

### Backend Architecture
```
Express API
├── Routes/
│   ├── auth/
│   ├── servers/
│   ├── containers/
│   ├── gaming/
│   ├── storage/
│   ├── monitoring/
│   └── remoteAccess/
├── Controllers/
│   └── Handle route logic
├── Services/
│   ├── ServerService
│   ├── ContainerService
│   ├── GamingService
│   ├── StorageService
│   ├── MonitoringService
│   └── AuthService
├── Models/
│   ├── Server
│   ├── Container
│   ├── User
│   ├── Alert
│   └── AuditLog
├── Middleware/
│   ├── auth.ts
│   ├── authorization.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── logging.ts
├── Utils/
│   ├── ssh.ts
│   ├── docker.ts
│   ├── k8s.ts
│   └── encryption.ts
└── Websocket/
    └── Real-time events
```

## Data Models

### Core Entities
```
User
├── id (UUID)
├── email
├── password_hash
├── role (admin, user, readonly)
├── 2fa_enabled
├── api_keys[]
└── audit_logs[]

Server
├── id (UUID)
├── name
├── host
├── port
├── credentials
├── os_type (linux, windows)
├── cpu_cores
├── memory_gb
├── disk_gb
├── status (online, offline)
├── docker_enabled
├── containers[]
└── monitoring_enabled

Container
├── id (string, Docker ID)
├── server_id (FK)
├── name
├── image
├── status
├── ports
├── volumes
├── environment[]
└── logs

GameServer
├── id (UUID)
├── server_id (FK)
├── game_type (minecraft_java, minecraft_bedrock, etc)
├── port
├── players_connected
├── max_players
├── status
├── backups[]
└── mods[]

StorageDevice
├── id (UUID)
├── server_id (FK)
├── device_path
├── total_size
├── used_size
├── raid_level
└── partitions[]

Alert
├── id (UUID)
├── server_id (FK)
├── severity (critical, warning, info)
├── message
├── triggered_at
└── resolved_at
```

## Communication Patterns

### REST API
```
GET    /api/servers              → List all servers
GET    /api/servers/:id          → Get server details
POST   /api/servers              → Create server
PUT    /api/servers/:id          → Update server
DELETE /api/servers/:id          → Delete server
POST   /api/servers/:id/stats    → Get real-time stats
POST   /api/servers/:id/reboot   → Execute action
```

### WebSocket Events
```
Client → Server:
- "subscribe:server-stats"      → Subscribe to updates
- "remote:terminal-command"     → Send command
- "console:input"               → VNC input

Server → Client:
- "server:stats-updated"        → Stats update
- "remote:terminal-output"      → Command output
- "alert:triggered"             → New alert
- "container:status-changed"    → Container event
```

## Security Architecture

```
                    ┌─────────────────────┐
                    │  Client Request     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Rate Limiting      │
                    │  (express-limit)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  CORS Validation    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ HTTPS/SSL Validation│
                    │ (TLS 1.3)           │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Request Parsing     │
                    │ & Validation        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ JWT Authentication  │
                    │ & 2FA Verification  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ RBAC Check          │
                    │ (Role-based)        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Request Handler     │
                    │ (Authorized)        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Audit Log           │
                    │ (Recorded)          │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Response            │
                    │ (Encrypted)         │
                    └─────────────────────┘
```

## Deployment Topology

### Single Server Deployment
```
Server
├── Docker Engine
├── Postgres (container)
├── Redis (container)
├── API (container)
└── Frontend (nginx, container)
```

### High Availability Deployment
```
Load Balancer (Nginx)
├── API Node 1
├── API Node 2
├── API Node 3
└── Database Cluster
    ├── Primary (PostgreSQL)
    ├── Replica 1
    └── Replica 2
```

### Kubernetes Deployment
```
K8s Cluster
├── Ingress (HTTPS)
├── Namespace: artipanel
│   ├── api-deployment (3 replicas)
│   ├── frontend-deployment (2 replicas)
│   ├── postgres-statefulset
│   ├── redis-statefulset
│   └── Services (ClusterIP, LoadBalancer)
└── PersistentVolumes
    ├── Database storage
    └── Backup storage
```

## Performance Considerations

### Caching Strategy
- **Redis**: Session data, rate limit counters, frequently accessed configs
- **Database**: Query result caching with 5-min TTL
- **Client-side**: React Query for API caching

### Database Optimization
- Connection pooling (min: 5, max: 20)
- Query optimization with indexes
- Read replicas for monitoring queries
- Archive old logs after 90 days

### API Response Time Targets
- Health check: <10ms
- List endpoints: <500ms
- Create/Update: <1000ms
- Stats retrieval: <2000ms

---

**For deployment details, see [INSTALLATION.md](./INSTALLATION.md)**
