@echo off
title BB84 Quantum Security Simulator - Launcher
color 0B

echo ======================================================================
echo       BB84 QUANTUM SECURITY SIMULATOR ^& ANALYSIS SUITE
echo ======================================================================
echo.
echo [1/3] Starting Backend Server (FastAPI + Qiskit on Port 8000)...
start "BB84 Backend (FastAPI)" cmd /k "cd /d "%~dp0" && py -3.12 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting Frontend Server (Vite + React on Port 5173)...
start "BB84 Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Launching Web Browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ======================================================================
echo  All services are up and running!
echo.
echo  - Frontend Application:   http://localhost:5173
echo  - Backend API:            http://127.0.0.1:8000
echo  - API Interactive Docs:   http://127.0.0.1:8000/docs
echo.
echo  To stop all servers, run stop.bat or close the opened terminal windows.
echo ======================================================================
echo.
pause

