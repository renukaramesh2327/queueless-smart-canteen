@echo off
title Kill Port 8000
echo Killing ALL Python processes on port 8000...

:: Kill by port more aggressively
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do (
    if not "%%a"=="0" (
        echo Killing PID %%a
        taskkill /PID %%a /F 2>nul
    )
)

:: Also kill all uvicorn/python that might hold the port
taskkill /IM python.exe /F 2>nul
taskkill /IM python3.exe /F 2>nul

timeout /t 3 /nobreak >nul

echo Checking if port 8000 is free...
netstat -aon | findstr ":8000"
if errorlevel 1 (
    echo Port 8000 is FREE!
) else (
    echo WARNING: something is still on port 8000
)
echo.
echo Done. Now run LAUNCH_BACKEND.bat
pause
