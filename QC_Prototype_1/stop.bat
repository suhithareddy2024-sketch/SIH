@echo off
title BB84 Quantum Security Simulator - Stopper
color 0C

echo ======================================================================
echo       STOPPING BB84 QUANTUM SECURITY SIMULATOR SERVERS
echo ======================================================================
echo.

echo Stopping FastAPI backend (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping Vite frontend (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [OK] All BB84 simulator processes stopped.
echo ======================================================================
timeout /t 3 >nul

