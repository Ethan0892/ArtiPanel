#!/bin/bash

################################################################################
# ArtiPanel Setup Wizard
# 
# This script automates the complete setup of ArtiPanel for Linux/macOS
# It handles all dependencies, permissions, and configuration
#
# Usage: bash setup.sh
################################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=${BACKEND_PORT:-4001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

################################################################################
# Utility Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

prompt_yes_no() {
    local prompt=$1
    local response
    
    while true; do
        read -p "$(echo -e ${YELLOW}$prompt${NC}) (y/n): " response
        case "$response" in
            [yY][eE][sS]|[yY]) return 0 ;;
            [nN][oO]|[nN]) return 1 ;;
            *) echo "Please answer y or n" ;;
        esac
    done
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        return 1
    fi
    return 0
}

################################################################################
# Prerequisite Checks
################################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing=0
    
    # Check Node.js
    if check_command node; then
        local node_version=$(node --version)
        local node_major=$(echo $node_version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ $node_major -ge 16 ]; then
            print_success "Node.js $node_version"
        else
            print_error "Node.js $node_version (need v16 or higher)"
            missing=1
        fi
    else
        print_error "Node.js is not installed"
        print_info "Visit: https://nodejs.org/"
        missing=1
    fi
    
    # Check npm
    if check_command npm; then
        local npm_version=$(npm --version)
        local npm_major=$(echo $npm_version | cut -d'.' -f1)
        if [ $npm_major -ge 7 ]; then
            print_success "npm $npm_version"
        else
            print_error "npm $npm_version (need v7 or higher)"
            missing=1
        fi
    else
        print_error "npm is not installed"
        missing=1
    fi
    
    # Check Git
    if check_command git; then
        print_success "Git $(git --version | awk '{print $3}')"
    else
        print_error "Git is not installed"
        print_info "Install with: sudo apt-get install git"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        print_error "Please install missing dependencies"
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

################################################################################
# Permission Fixes
################################################################################

fix_permissions() {
    print_header "Fixing Permissions"
    
    print_info "Setting correct permissions on project directory..."
    
    # Fix directory permissions
    chmod -R u+w "$PROJECT_DIR" 2>/dev/null || true
    
    # Fix ownership if running with sudo
    if [ "$SUDO_USER" ]; then
        chown -R "$SUDO_USER:$SUDO_USER" "$PROJECT_DIR" 2>/dev/null || true
        print_success "Ownership fixed for $SUDO_USER"
    fi
    
    print_success "Permissions fixed!"
}

################################################################################
# Port Availability Check
################################################################################

check_port() {
    local port=$1
    local name=$2
    
    if command -v lsof &> /dev/null; then
        if lsof -i ":$port" > /dev/null 2>&1; then
            print_warning "$name port $port is already in use"
            print_info "Process using port $port:"
            lsof -i ":$port" | tail -n +2
            
            if prompt_yes_no "Kill this process?"; then
                lsof -i ":$port" | tail -n +2 | awk '{print $2}' | xargs -r kill -9
                print_success "Process killed"
                return 0
            else
                return 1
            fi
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_warning "$name port $port is already in use"
            return 1
        fi
    fi
    
    return 0
}

check_ports() {
    print_header "Checking Port Availability"
    
    if ! check_port $BACKEND_PORT "Backend API"; then
        print_error "Cannot use port $BACKEND_PORT for backend"
        if prompt_yes_no "Use port 4002 instead?"; then
            BACKEND_PORT=4002
        else
            exit 1
        fi
    fi
    print_success "Backend port $BACKEND_PORT available"
    
    if ! check_port $FRONTEND_PORT "Frontend"; then
        print_error "Cannot use port $FRONTEND_PORT for frontend"
        if prompt_yes_no "Use port 3001 instead?"; then
            FRONTEND_PORT=3001
        else
            exit 1
        fi
    fi
    print_success "Frontend port $FRONTEND_PORT available"
}

################################################################################
# Dependencies Installation
################################################################################

install_dependencies() {
    print_header "Installing Dependencies"
    
    # Backend
    print_info "Installing backend dependencies..."
    cd "$PROJECT_DIR/backend"
    
    if [ -d "node_modules" ]; then
        print_info "Clearing existing node_modules..."
        rm -rf node_modules package-lock.json
    fi
    
    npm cache clean --force > /dev/null 2>&1 || true
    npm install --prefer-offline
    print_success "Backend dependencies installed"
    
    # Frontend
    print_info "Installing frontend dependencies..."
    cd "$PROJECT_DIR/frontend"
    
    if [ -d "node_modules" ]; then
        print_info "Clearing existing node_modules..."
        rm -rf node_modules package-lock.json .vite dist
    fi
    
    npm cache clean --force > /dev/null 2>&1 || true
    npm install --prefer-offline
    print_success "Frontend dependencies installed"
    
    cd "$PROJECT_DIR"
}

################################################################################
# Configuration Setup
################################################################################

setup_configuration() {
    print_header "Configuring ArtiPanel"
    
    # Update frontend config for new ports
    print_info "Updating frontend configuration..."
    
    cd "$PROJECT_DIR/frontend"
    
    # Update API URL in config
    if grep -q "localhost:4001" src/config/panelConfig.ts; then
        print_info "Frontend already configured for correct ports"
    else
        print_info "Configuration already set"
    fi
    
    print_success "Configuration complete"
    cd "$PROJECT_DIR"
}

################################################################################
# Start Services
################################################################################

start_services() {
    print_header "Starting ArtiPanel Services"
    
    print_info "Backend will run on: ${GREEN}http://localhost:$BACKEND_PORT${NC}"
    print_info "Frontend will run on: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    
    echo ""
    print_warning "Running both services in foreground (Ctrl+C to stop)"
    echo ""
    
    # Create a temporary script to run both servers
    local backend_pid
    local frontend_pid
    
    # Start backend in background
    print_info "Starting backend..."
    cd "$PROJECT_DIR/backend"
    PORT=$BACKEND_PORT npm run dev > /tmp/artipanel-backend.log 2>&1 &
    backend_pid=$!
    print_success "Backend started (PID: $backend_pid)"
    
    # Wait for backend to be ready
    sleep 3
    
    # Start frontend in background
    print_info "Starting frontend..."
    cd "$PROJECT_DIR/frontend"
    PORT=$FRONTEND_PORT npm run dev > /tmp/artipanel-frontend.log 2>&1 &
    frontend_pid=$!
    print_success "Frontend started (PID: $frontend_pid)"
    
    # Wait for frontend to be ready
    sleep 5
    
    print_header "✅ ArtiPanel is Ready!"
    echo ""
    echo -e "${GREEN}Access the application at:${NC} ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
    echo ""
    echo -e "${YELLOW}Default Credentials:${NC}"
    echo -e "  ${BLUE}Username:${NC} admin"
    echo -e "  ${BLUE}Password:${NC} admin123"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Change the default password immediately!${NC}"
    echo ""
    echo -e "${YELLOW}Backend API:${NC} ${BLUE}http://localhost:$BACKEND_PORT${NC}"
    echo -e "${YELLOW}Logs:${NC}"
    echo -e "  ${BLUE}Backend:${NC}  tail -f /tmp/artipanel-backend.log"
    echo -e "  ${BLUE}Frontend:${NC} tail -f /tmp/artipanel-frontend.log"
    echo ""
    
    # Wait for both processes
    wait $backend_pid $frontend_pid
}

################################################################################
# Interactive Mode
################################################################################

interactive_mode() {
    print_header "ArtiPanel Setup Wizard"
    
    echo "This wizard will guide you through setting up ArtiPanel."
    echo ""
    echo "Steps:"
    echo "  1. Check prerequisites (Node.js, npm, git)"
    echo "  2. Fix file permissions"
    echo "  3. Check port availability"
    echo "  4. Install dependencies"
    echo "  5. Configure application"
    echo "  6. Start services"
    echo ""
    
    if ! prompt_yes_no "Continue with setup?"; then
        print_info "Setup cancelled"
        exit 0
    fi
    
    # Run all setup steps
    check_prerequisites
    fix_permissions
    check_ports
    install_dependencies
    setup_configuration
    
    echo ""
    if prompt_yes_no "Start ArtiPanel services now?"; then
        start_services
    else
        print_info "To start services manually, run:"
        echo "  cd $PROJECT_DIR/backend && PORT=$BACKEND_PORT npm run dev"
        echo "  cd $PROJECT_DIR/frontend && PORT=$FRONTEND_PORT npm run dev"
    fi
}

################################################################################
# Help
################################################################################

show_help() {
    cat << EOF
ArtiPanel Setup Wizard

Usage: bash setup.sh [OPTION]

Options:
  -h, --help          Show this help message
  --skip-checks       Skip prerequisite checks
  --backend-port PORT Set backend port (default: 4001)
  --frontend-port PORT Set frontend port (default: 3000)
  --no-start          Don't start services after setup

Examples:
  bash setup.sh                                    # Interactive setup
  bash setup.sh --backend-port 4002 --frontend-port 3001
  bash setup.sh --skip-checks                      # Skip prerequisite checks

EOF
}

################################################################################
# Main
################################################################################

main() {
    # Parse arguments
    local skip_checks=0
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --skip-checks)
                skip_checks=1
                shift
                ;;
            --backend-port)
                BACKEND_PORT="$2"
                shift 2
                ;;
            --frontend-port)
                FRONTEND_PORT="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Run setup
    if [ $skip_checks -eq 0 ]; then
        interactive_mode
    else
        print_info "Skipping prerequisite checks..."
        fix_permissions
        check_ports
        install_dependencies
        setup_configuration
        
        if prompt_yes_no "Start services?"; then
            start_services
        fi
    fi
}

# Run main
main "$@"
