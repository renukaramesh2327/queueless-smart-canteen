@echo off
title CampusBite Frontend
cd /d "%~dp0frontend"

echo.
echo ========================================
echo    CampusBite Frontend
echo ========================================
echo.

if not exist "node_modules" (
    echo Installing npm packages (first time)...
    npm install
)

echo Starting Vite...
echo   http://localhost:5173
echo.
echo   Make sure START_BACKEND.bat is running first!
echo ----------------------------------------
npm run dev
pause
