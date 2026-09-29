#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  AEGIS-CV // DEFENSE MULTI-CONTRIBUTOR INTEGRITY PLATFORM"
echo "  Enterprise Computer Vision Cryptographic Assurance"
echo "=========================================================="

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

# Seed data if DB does not exist
if [ ! -f "storage/integrity.db" ]; then
    echo "[*] Initializing database and synthetic defense recon demo data..."
    PYTHONPATH=. ./venv/bin/python backend/seed_demo_data.py
fi

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "[*] Shutting down AEGIS-CV services..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "[*] Starting FastAPI Backend on http://127.0.0.1:8000 ..."
PYTHONPATH=. ./venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

echo "[*] Starting Vite Frontend on http://127.0.0.1:5173 ..."
npm run dev --prefix frontend &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  SYSTEM ARMED AND READY FOR EVALUATION"
echo "  Dashboard UI:   http://127.0.0.1:5173"
echo "  FastAPI Docs:   http://127.0.0.1:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."

wait
