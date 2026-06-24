# CampusBite — Backend Setup & Start Script
# Run this from the project root: .\START_BACKEND.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CampusBite Backend Setup & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\backend"

# Step 1: Create virtual environment if it doesn't exist
if (-Not (Test-Path "venv")) {
    Write-Host "[1/5] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "      ✓ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "[1/5] Virtual environment already exists ✓" -ForegroundColor Green
}

# Step 2: Activate
Write-Host "[2/5] Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
Write-Host "      ✓ Activated" -ForegroundColor Green

# Step 3: Install requirements
Write-Host "[3/5] Installing Python packages..." -ForegroundColor Yellow
pip install -r requirements.txt -q
Write-Host "      ✓ Packages installed" -ForegroundColor Green

# Step 4: Seed database (safe to re-run, skips existing records)
Write-Host "[4/5] Seeding database with demo data..." -ForegroundColor Yellow
python seed.py
Write-Host ""

# Step 5: Start server
Write-Host "[5/5] Starting FastAPI server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Backend URL : http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs    : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Demo logins:" -ForegroundColor White
Write-Host "    Student : student@campusbite.com / Student@123" -ForegroundColor Gray
Write-Host "    Staff   : staff@campusbite.com   / Staff@123" -ForegroundColor Gray
Write-Host "    Admin   : admin@campusbite.com   / Admin@123" -ForegroundColor Gray
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host "----------------------------------------" -ForegroundColor DarkGray

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
