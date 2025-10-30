@echo off
REM ############################################################################
REM # ArtiPanel Setup Wizard for Windows
REM #
REM # This script automates the complete setup of ArtiPanel for Windows
REM # It handles all dependencies, permissions, and configuration
REM #
REM # Usage: setup.bat
REM ############################################################################

setlocal enabledelayedexpansion

REM Configuration
set BACKEND_PORT=4001
set FRONTEND_PORT=3000
set PROJECT_DIR=%~dp0

REM Colors (using findstr for color effects)
for /F %%A in ('copy /Z "%~f0" nul') do set "BS=%%A"

REM ############################################################################
REM # Utility Functions
REM ############################################################################

:print_header
echo.
echo ========================================
echo %~1
echo ========================================
echo.
exit /b

:print_success
echo [OK] %~1
exit /b

:print_error
echo [ERROR] %~1
exit /b

:print_warning
echo [WARNING] %~1
exit /b

:print_info
echo [INFO] %~1
exit /b

:check_command
where %~1 >nul 2>nul
exit /b %errorlevel%

REM ############################################################################
REM # Prerequisite Checks
REM ############################################################################

:check_prerequisites
call :print_header "Checking Prerequisites"

REM Check Node.js
call :check_command node
if %errorlevel% equ 0 (
    for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js !NODE_VERSION!
) else (
    echo [ERROR] Node.js is not installed
    echo [INFO] Download from: https://nodejs.org/
    exit /b 1
)

REM Check npm
call :check_command npm
if %errorlevel% equ 0 (
    for /f "tokens=1" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm !NPM_VERSION!
) else (
    echo [ERROR] npm is not installed
    exit /b 1
)

REM Check Git
call :check_command git
if %errorlevel% equ 0 (
    for /f "tokens=3" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [OK] Git !GIT_VERSION!
) else (
    echo [WARNING] Git is not installed (optional)
)

echo [OK] All prerequisites met!
exit /b 0

REM ############################################################################
REM # Port Availability Check
REM ############################################################################

:check_ports
call :print_header "Checking Port Availability"

REM Check backend port
netstat -ano | findstr ":%BACKEND_PORT%" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port %BACKEND_PORT% is already in use
    set /p USER_INPUT="Use port 4002 instead? (y/n): "
    if /i "!USER_INPUT!"=="y" (
        set BACKEND_PORT=4002
        echo [OK] Using port !BACKEND_PORT! for backend
    ) else (
        exit /b 1
    )
) else (
    echo [OK] Backend port %BACKEND_PORT% available
)

REM Check frontend port
netstat -ano | findstr ":%FRONTEND_PORT%" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port %FRONTEND_PORT% is already in use
    set /p USER_INPUT="Use port 3001 instead? (y/n): "
    if /i "!USER_INPUT!"=="y" (
        set FRONTEND_PORT=3001
        echo [OK] Using port !FRONTEND_PORT! for frontend
    ) else (
        exit /b 1
    )
) else (
    echo [OK] Frontend port %FRONTEND_PORT% available
)

exit /b 0

REM ############################################################################
REM # Dependencies Installation
REM ############################################################################

:install_dependencies
call :print_header "Installing Dependencies"

echo [INFO] Installing backend dependencies...
cd /d "%PROJECT_DIR%backend"
if exist node_modules (
    echo [INFO] Clearing existing node_modules...
    rmdir /s /q node_modules >nul 2>&1
    del package-lock.json >nul 2>&1
)
call npm cache clean --force >nul 2>&1
call npm install --prefer-offline
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)
echo [OK] Backend dependencies installed

echo [INFO] Installing frontend dependencies...
cd /d "%PROJECT_DIR%frontend"
if exist node_modules (
    echo [INFO] Clearing existing node_modules...
    rmdir /s /q node_modules >nul 2>&1
    del package-lock.json >nul 2>&1
)
if exist .vite (
    rmdir /s /q .vite >nul 2>&1
)
if exist dist (
    rmdir /s /q dist >nul 2>&1
)
call npm cache clean --force >nul 2>&1
call npm install --prefer-offline
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)
echo [OK] Frontend dependencies installed

cd /d "%PROJECT_DIR%"
exit /b 0

REM ############################################################################
REM # Configuration Setup
REM ############################################################################

:setup_configuration
call :print_header "Configuring ArtiPanel"
echo [INFO] Configuration already set in code
echo [OK] Configuration complete
exit /b 0

REM ############################################################################
REM # Main Setup
REM ############################################################################

:main
echo.
echo ========================================
echo     ArtiPanel Setup Wizard for Windows
echo ========================================
echo.
echo This wizard will guide you through setting up ArtiPanel.
echo.
echo Steps:
echo   1. Check prerequisites (Node.js, npm)
echo   2. Check port availability
echo   3. Install dependencies
echo   4. Configure application
echo.

set /p CONTINUE="Continue with setup? (y/n): "
if /i not "%CONTINUE%"=="y" (
    echo Setup cancelled
    exit /b 0
)

call :check_prerequisites
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Please install missing prerequisites
    pause
    exit /b 1
)

call :check_ports
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Could not resolve port issues
    pause
    exit /b 1
)

call :install_dependencies
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

call :setup_configuration

echo.
echo ========================================
echo     Setup Complete!
echo ========================================
echo.
echo Backend URL: http://localhost:%BACKEND_PORT%
echo Frontend URL: http://localhost:%FRONTEND_PORT%
echo.
echo Default Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo [WARNING] Change the default password immediately!
echo.
set /p START_SERVICES="Start services now? (y/n): "
if /i "%START_SERVICES%"=="y" (
    call :start_services
) else (
    echo.
    echo To start services manually, run:
    echo   Terminal 1: cd backend ^& set PORT=%BACKEND_PORT% ^& npm run dev
    echo   Terminal 2: cd frontend ^& set PORT=%FRONTEND_PORT% ^& npm run dev
    echo.
    pause
)

exit /b 0

REM ############################################################################
REM # Start Services
REM ############################################################################

:start_services
echo.
echo [INFO] Starting backend on port %BACKEND_PORT%...
start cmd /k "cd /d %PROJECT_DIR%backend && set PORT=%BACKEND_PORT% && npm run dev"

timeout /t 3 /nobreak

echo [INFO] Starting frontend on port %FRONTEND_PORT%...
start cmd /k "cd /d %PROJECT_DIR%frontend && set PORT=%FRONTEND_PORT% && npm run dev"

echo.
echo [OK] Services started in new windows
echo [INFO] Open browser: http://localhost:%FRONTEND_PORT%
echo.
pause

exit /b 0

REM ############################################################################
REM # Entry Point
REM ############################################################################

call :main
exit /b %errorlevel%
