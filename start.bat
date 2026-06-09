@echo off
chcp 65001 >nul
echo ========================================
echo   Cinema BlindBox - Docker One-Click Start
echo ========================================
echo.
echo [1/4] Building backend jar...
cd /d "%~dp0backend"
call mvn package -DskipTests -B
if %errorlevel% neq 0 (
    echo Maven build failed!
    pause
    exit /b 1
)
echo.
cd /d "%~dp0"
echo [2/4] Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo Docker build failed!
    pause
    exit /b 1
)
echo.
echo [3/4] Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo Start failed!
    pause
    exit /b 1
)
echo.
echo [4/4] Waiting for services to be ready...
timeout /t 15 /nobreak >nul
echo.
echo ========================================
echo   All services started!
echo ========================================
echo   Frontend:  http://localhost:2028
echo   Backend:   http://localhost:6028
echo   MySQL:     localhost:3307
echo ========================================
echo.
echo Use 'docker-compose down' to stop all services.
pause
