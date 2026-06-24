# CampusBite — Frontend Start Script
# Run this from the project root in a SECOND terminal: .\START_FRONTEND.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   CampusBite Frontend Start" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Set-Location "$PSScriptRoot\frontend"

# Install if node_modules missing
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages (first time only)..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Packages installed" -ForegroundColor Green
}

Write-Host "Starting Vite dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Frontend URL : http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Make sure backend is also running on port 8000!" -ForegroundColor Yellow
Write-Host "  Run .\START_BACKEND.ps1 in another terminal first." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press Ctrl+C to stop" -ForegroundColor DarkGray
Write-Host "----------------------------------------" -ForegroundColor DarkGray

npm run dev
