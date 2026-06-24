@echo off
title CampusBite Backend (Stable)
cd /d "%~dp0backend"

echo.
echo ========================================
echo    CampusBite Backend - Stable Mode
echo ========================================
echo.

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 ( echo ERROR: Python not found. & pause & exit /b 1 )
)

call venv\Scripts\activate.bat

echo Installing/verifying packages...
pip install -r requirements.txt -q
echo Done.

echo.
echo Starting server (no auto-reload)...
echo   Backend: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo   student@campusbite.com / Student@123
echo   staff@campusbite.com   / Staff@123
echo   admin@campusbite.com   / Admin@123
echo.
echo   Keep this window open. Press Ctrl+C to stop.
echo ----------------------------------------
uvicorn app.main:app --host 0.0.0.0 --port 8000
if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start! See error above.
    pause
)
pause
