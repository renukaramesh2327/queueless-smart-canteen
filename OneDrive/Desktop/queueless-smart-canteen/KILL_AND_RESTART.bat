@echo off
title CampusBite - Kill & Restart Backend
echo.
echo ========================================
echo   Stopping old backend on port 8000...
echo ========================================

:: Kill any process using port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr LISTENING') do (
    echo Killing PID %%a ...
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo Done. Starting fresh backend...
echo.

cd /d "%~dp0backend"
call venv\Scripts\activate.bat
echo Installing packages (bcrypt fix)...
pip install -r requirements.txt -q
echo Starting server...
echo.
echo   Backend: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo   student@campusbite.com / Student@123
echo   staff@campusbite.com   / Staff@123
echo   admin@campusbite.com   / Admin@123
echo.
echo   Keep this window open.
echo ----------------------------------------
uvicorn app.main:app --host 0.0.0.0 --port 8000
if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start!
    pause
)
pause
