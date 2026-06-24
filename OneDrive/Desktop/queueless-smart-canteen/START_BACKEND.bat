@echo off
title CampusBite Backend
cd /d "%~dp0backend"

echo.
echo ========================================
echo    CampusBite Backend Setup ^& Start
echo ========================================
echo.

if not exist "venv" (
    echo [1/5] Creating virtual environment...
    python -m venv venv
    echo       Done.
) else (
    echo [1/5] Virtual environment exists.
)

echo [2/5] Activating...
call venv\Scripts\activate.bat

echo [3/5] Installing packages...
pip install -r requirements.txt -q
echo       Done.

echo [4/5] Seeding database...
python seed.py

echo.
echo [5/5] Starting server...
echo.
echo   Backend: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo   student@campusbite.com / Student@123
echo   staff@campusbite.com   / Staff@123
echo   admin@campusbite.com   / Admin@123
echo.
echo   Press Ctrl+C to stop.
echo ----------------------------------------
uvicorn app.main:app --reload --reload-dir app --host 0.0.0.0 --port 8000
pause
