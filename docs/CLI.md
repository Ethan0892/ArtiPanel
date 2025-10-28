# ArtiPanel CLI Tool

**artictl** is the command-line interface for managing ArtiPanel servers and deployments.

## Installation

```bash
npm install -g @artipanel/cli
# or
pip install artipanel-cli
```

## Usage

### Server Management

```bash
# List all servers
artictl server list

# Add a new server
artictl server add --name "Production" \
  --host 192.168.1.100 \
  --user admin \
  --key ~/.ssh/id_rsa

# Get server status
artictl server status <server-id>

# Execute command on server
artictl server exec <server-id> "ls -la"

# Reboot server
artictl server reboot <server-id>
```

### Container Management

```bash
# List containers on server
artictl container list --server <server-id>

# Start container
artictl container start <container-id>

# Stop container
artictl container stop <container-id>

# View logs
artictl container logs <container-id> --tail 100

# Deploy from compose file
artictl compose deploy --file docker-compose.yml --server <server-id>
```

### Gaming Servers

```bash
# Create Minecraft server
artictl gaming create minecraft-java \
  --server <server-id> \
  --port 25565 \
  --ram 4096 \
  --version 1.20.1

# Backup world
artictl gaming backup --server <server-id>

# Install mod
artictl gaming mod install --server <server-id> --mod "Fabric API"

# Get player list
artictl gaming players --server <server-id>
```

### Storage Management

```bash
# List storage devices
artictl storage list --server <server-id>

# Check RAID status
artictl storage raid-status --device sda

# Create shared folder
artictl storage share create \
  --server <server-id> \
  --name "Media" \
  --path "/mnt/storage/media" \
  --protocol smb

# Schedule backup
artictl storage backup schedule \
  --server <server-id> \
  --target "s3://bucket/backups" \
  --frequency daily --retention 30
```

### Monitoring

```bash
# Get dashboard summary
artictl monitoring dashboard

# View alerts
artictl monitoring alerts --severity critical

# Get server stats
artictl monitoring stats <server-id> --interval 60s

# Export metrics
artictl monitoring export --format prometheus --output metrics.txt
```

### Authentication

```bash
# Login
artictl auth login --email user@example.com

# Setup 2FA
artictl auth 2fa setup

# Generate API key
artictl auth api-key generate

# List API keys
artictl auth api-key list
```

### Deployment

```bash
# Deploy from template
artictl deploy template \
  --name wordpress \
  --server <server-id> \
  --domain example.com

# Deploy custom app
artictl deploy app \
  --name myapp \
  --server <server-id> \
  --image myapp:1.0 \
  --port 8080

# Rollback deployment
artictl deploy rollback <deployment-id> --to <version>
```

### Configuration

```bash
# Set config
artictl config set <key> <value>

# Get config
artictl config get <key>

# List all config
artictl config list

# Reset to defaults
artictl config reset
```

## Flags

Global flags:
- `--help, -h`: Show help message
- `--version, -v`: Show version
- `--config, -c`: Config file path
- `--output, -o`: Output format (json, table, yaml)
- `--quiet, -q`: Quiet mode
- `--debug`: Debug mode

## Environment Variables

- `ARTIPANEL_API_URL`: API endpoint
- `ARTIPANEL_TOKEN`: Authentication token
- `ARTIPANEL_SERVER`: Default server ID
- `ARTIPANEL_FORMAT`: Default output format

## Examples

```bash
# Monitor all servers in real-time
artictl monitoring stats --all --interval 5s

# Deploy WordPress to server with auto-SSL
artictl deploy template wordpress \
  --server prod-1 \
  --domain mysite.com \
  --ssl-auto

# Backup all servers daily
artictl storage backup schedule \
  --servers all \
  --target s3://backups \
  --frequency daily

# Ansible-like playbook
artictl playbook run --file playbook.yml

# Export all config for backup
artictl config export --format yaml > backup.yml
```

---

See `artictl --help` for more information.
