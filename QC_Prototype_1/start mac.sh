#!/bin/bash

# ======================================================================
#       BB84 QUANTUM SECURITY SIMULATOR & ANALYSIS SUITE (macOS/Linux)
# ======================================================================

# Move to the directory where this script is located
cd "$(dirname "$0")"

echo "======================================================================"
echo "      BB84 QUANTUM SECURITY SIMULATOR & ANALYSIS SUITE"
echo "======================================================================"
echo ""

# 1. Check & Start Python Backend
echo "[1/3] Starting Backend Server (FastAPI + Qiskit on Port 8000)..."
if command -v python3 &>/dev/null; then
    python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload &
    BACKEND_PID=$!
elif command -v python &>/dev/null; then
    python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload &
    BACKEND_PID=$!
else
    echo "Error: Python 3 was not found. Please install Python 3."
    exit 1
fi

# 2. Start Vite Frontend Server
echo "[2/3] Starting Frontend Server (Vite + React on Port 5173)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Save process IDs for clean shutdown via stop.sh
echo "$BACKEND_PID" > .bb84_pids
echo "$FRONTEND_PID" >> .bb84_pids

echo "[3/3] Waiting for servers to initialize..."
sleep 3

# 3. Open Web Browser
echo ""
echo "Launching Web Browser at http://localhost:5173..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5173
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:5173 2>/dev/null || true
fi

echo ""
echo "======================================================================"
echo " All services are up and running!"
echo ""
echo " - Frontend Application:   http://localhost:5173"
echo " - Backend API:            http://127.0.0.1:8000"
echo " - API Interactive Docs:   http://127.0.0.1:8000/docs"
echo ""
echo " To stop all servers, run: ./stop.sh"
echo "======================================================================"

