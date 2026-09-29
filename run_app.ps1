# VisionTrace Startup Script for Windows PowerShell
$root = $PSScriptRoot
Set-Location $root

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VisionTrace // DEFENSE INTEGRITY ASSURANCE PLATFORM" -ForegroundColor Cyan
Write-Host "  Enterprise Computer Vision Cryptographic Assurance" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Check and seed DB if needed
if (-not (Test-Path "storage/integrity.db")) {
    Write-Host "[*] Initializing database and demo assets..." -ForegroundColor Yellow
    $env:PYTHONPATH = "."
    python backend/seed_demo_data.py
}

# Start Backend in background window
Write-Host "[*] Launching Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$root'; `$env:PYTHONPATH='.'; python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

# Start Frontend in background window
Write-Host "[*] Launching Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$root/frontend'; npm run dev"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VisionTrace SERVICES LAUNCHED SUCCESSFULLY" -ForegroundColor Green
Write-Host "  Dashboard UI:   http://localhost:5173" -ForegroundColor Yellow
Write-Host "  FastAPI Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
