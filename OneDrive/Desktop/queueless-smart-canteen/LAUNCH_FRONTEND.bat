@echo off
title CampusBite Frontend
cd /d "%~dp0frontend"

echo.
echo ========================================
echo    CampusBite Frontend Launcher
echo ========================================
echo.

echo Checking node_modules...
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
    if errorlevel 1 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
    echo Done.
) else (
    echo node_modules found, skipping install.
)

echo.
echo Starting Vite dev server...
echo   URL: http://localhost:5173
echo.
echo Keep this window open. Press Ctrl+C to stop.
echo ----------------------------------------
npm run dev
if errorlevel 1 (
    echo.
    echo ERROR: npm run dev failed! See error above.
    pause
)
pause
