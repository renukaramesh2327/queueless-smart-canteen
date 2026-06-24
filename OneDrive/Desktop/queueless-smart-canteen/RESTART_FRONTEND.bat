@echo off
title CampusBite - Restart Frontend
echo Killing old frontend on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173"') do (
    if not "%%a"=="0" (
        echo Killing PID %%a
        taskkill /PID %%a /F 2>nul
    )
)
taskkill /IM node.exe /F 2>nul
timeout /t 2 /nobreak >nul
echo Starting fresh frontend...
cd /d "%~dp0frontend"
echo.
echo   URL: http://localhost:5173
echo   Keep this window open.
echo ----------------------------------------
npm run dev
pause
