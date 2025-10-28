#!/bin/bash

################################################################################
# ArtiPanel Installation Script
# Comprehensive setup for Linux/macOS systems
# Usage: sudo ./scripts/install.sh
################################################################################

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}===============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use: sudo ./scripts/install.sh)"
        exit 1
    fi
}

# Check system requirements
check_system() {
    print_header "Checking System Requirements"

    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS_TYPE="Linux"
        print_success "Operating System: Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS_TYPE="macOS"
        print_success "Operating System: macOS"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi

    # Check available memory
    if [[ "$OS_TYPE" == "Linux" ]]; then
        MEMORY=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024/1024)}')
    else
        MEMORY=$(vm_stat | grep "Pages free" | awk '{print int($3/256)}')
    fi

    if [ "$MEMORY" -lt 2 ]; then
        print_warning "Low memory detected: ${MEMORY}GB (recommended: 4GB+)"
    else
        print_success "Available memory: ${MEMORY}GB"
    fi

    # Check disk space
    DISK=$(df / | awk 'NR==2 {print int($4/1024/1024)}')
    if [ "$DISK" -lt 20 ]; then
        print_error "Insufficient disk space: ${DISK}GB (required: 20GB+)"
        exit 1
    fi
    print_success "Available disk space: ${DISK}GB"
}

# Install system dependencies
install_dependencies() {
    print_header "Installing System Dependencies"

    if [[ "$OS_TYPE" == "Linux" ]]; then
        # Update package manager
        print_info "Updating package manager..."
        apt-get update || yum update -y

        # Install curl
        if ! command -v curl &> /dev/null; then
            print_info "Installing curl..."
            apt-get install -y curl || yum install -y curl
        fi
        print_success "curl available"

        # Install git
        if ! command -v git &> /dev/null; then
            print_info "Installing git..."
            apt-get install -y git || yum install -y git
        fi
        print_success "git available"

        # Install wget
        if ! command -v wget &> /dev/null; then
            print_info "Installing wget..."
            apt-get install -y wget || yum install -y wget
        fi
        print_success "wget available"
    fi
}

# Install Docker
install_docker() {
    print_header "Checking Docker Installation"

    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker already installed: $DOCKER_VERSION"
    else
        print_info "Installing Docker..."
        if [[ "$OS_TYPE" == "Linux" ]]; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            rm get-docker.sh
            print_success "Docker installed successfully"
        else
            print_error "Please install Docker Desktop for macOS manually"
            print_info "Visit: https://www.docker.com/products/docker-desktop"
            exit 1
        fi
    fi

    # Install Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose already installed: $COMPOSE_VERSION"
    else
        print_info "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed successfully"
    fi
}

# Install Node.js
install_nodejs() {
    print_header "Checking Node.js Installation"

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js already installed: $NODE_VERSION"
    else
        print_info "Installing Node.js 18+..."
        if [[ "$OS_TYPE" == "Linux" ]]; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            apt-get install -y nodejs || yum install -y nodejs
        else
            print_error "Please install Node.js manually on macOS"
            print_info "Visit: https://nodejs.org/en/download/"
            exit 1
        fi
        print_success "Node.js installed successfully"
    fi

    # Verify Node version
    NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js version 18+ required, found: $(node -v)"
        exit 1
    fi
}

# Install PostgreSQL
install_postgresql() {
    print_header "Checking PostgreSQL Installation"

    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version)
        print_success "PostgreSQL already installed: $PG_VERSION"
    else
        print_info "Installing PostgreSQL 12+..."
        if [[ "$OS_TYPE" == "Linux" ]]; then
            apt-get install -y postgresql postgresql-contrib || yum install -y postgresql postgresql-contrib
            systemctl start postgresql
            systemctl enable postgresql
        else
            print_warning "PostgreSQL not found - will use Docker Compose instead"
        fi
        print_success "PostgreSQL ready"
    fi
}

# Setup ArtiPanel
setup_artipanel() {
    print_header "Setting Up ArtiPanel"

    # Copy environment file
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        if [ -f examples/environment.sample ]; then
            cp examples/environment.sample .env
            print_success ".env file created"
            print_warning "Please edit .env with your configuration"
        else
            print_error "Environment template not found: examples/environment.sample"
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi

    # Create required directories
    print_info "Creating required directories..."
    mkdir -p data/postgresql
    mkdir -p data/redis
    mkdir -p logs
    mkdir -p backups
    chmod 755 data logs backups
    print_success "Directories created"

    # Install backend dependencies
    print_info "Installing backend dependencies..."
    cd backend
    npm install --production
    print_success "Backend dependencies installed"
    cd ..

    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install --production
    npm run build
    print_success "Frontend dependencies installed and built"
    cd ..
}

# Start services with Docker Compose
start_services() {
    print_header "Starting ArtiPanel Services"

    print_info "Starting Docker Compose services..."
    docker-compose up -d

    # Wait for services to be ready
    print_info "Waiting for services to initialize (30 seconds)..."
    sleep 30

    # Check service status
    if docker-compose ps | grep -q "Up"; then
        print_success "Services started successfully"
        docker-compose ps
    else
        print_error "Failed to start services"
        docker-compose logs
        exit 1
    fi
}

# Print access information
print_access_info() {
    print_header "Installation Complete!"

    echo ""
    print_success "ArtiPanel has been successfully installed!"
    echo ""
    echo -e "${BLUE}Access Information:${NC}"
    echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "  API:      ${GREEN}http://localhost:4000/api${NC}"
    echo -e "  Database: ${GREEN}localhost:5432${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Complete the setup wizard"
    echo "  3. Configure nodes and servers"
    echo "  4. Read the documentation: docs/INSTALLATION.md"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "  View logs:        docker-compose logs -f"
    echo "  Stop services:    docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Rebuild images:   docker-compose up -d --build"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "  Troubleshooting: docs/TROUBLESHOOTING.md"
    echo "  API Reference:   docs/API.md"
    echo "  Architecture:    docs/ARCHITECTURE.md"
    echo ""
}

# Main installation flow
main() {
    print_header "ArtiPanel Installation Script"
    echo "Version: 0.1.0-alpha.1"
    echo "Repository: https://github.com/Ethan0892/ArtiPanel"
    echo ""

    # Run installation steps
    check_root
    check_system
    install_dependencies
    install_docker
    install_nodejs
    install_postgresql
    setup_artipanel
    start_services
    print_access_info

    print_success "Installation completed successfully!"
    echo ""
}

# Run main function
main
