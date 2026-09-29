#!/bin/bash

# ======================================================================
#       STOPPING BB84 QUANTUM SECURITY SIMULATOR SERVERS (macOS/Linux)
# ======================================================================

cd "$(dirname "$0")"

echo "======================================================================"
echo "       STOPPING BB84 QUANTUM SECURITY SIMULATOR SERVERS"
echo "======================================================================"
echo ""

# 1. Kill saved PIDs if file exists
if [ -f .bb84_pids ]; then
    while read -r pid; do
        if [ -n "$pid" ]; then
            kill "$pid" 2>/dev/null || true
        fi
    done < .bb84_pids
    rm -f .bb84_pids
fi

# 2. Guarantee ports 8000 and 5173 are freed
if command -v lsof &>/dev/null; then
    PORT_8000_PID=$(lsof -ti:8000 2>/dev/null)
    if [ -n "$PORT_8000_PID" ]; then
        kill -9 $PORT_8000_PID 2>/dev/null || true
    fi

    PORT_5173_PID=$(lsof -ti:5173 2>/dev/null)
    if [ -n "$PORT_5173_PID" ]; then
        kill -9 $PORT_5173_PID 2>/dev/null || true
    fi
fi

echo "[OK] All BB84 simulator processes have been stopped."
echo "======================================================================"

