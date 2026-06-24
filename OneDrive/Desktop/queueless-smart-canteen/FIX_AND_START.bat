@echo off
title CampusBite - Fix & Start Backend
cd /d "%~dp0backend"

echo.
echo ============================================
echo   CampusBite - Fixing Python Environment
echo ============================================
echo.

echo [1/5] Removing old virtual environment...
if exist "venv" (
    rmdir /s /q venv
    echo       Done - old venv removed.
) else (
    echo       No existing venv found.
)

echo [2/5] Creating fresh virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.11 or 3.12 from python.org
    pause
    exit /b 1
)
echo       Done.

echo [3/5] Installing packages (this may take 1-2 minutes)...
call venv\Scripts\activate.bat
pip install --upgrade pip -q
pip install fastapi==0.111.0 uvicorn[standard]==0.29.0 sqlalchemy==2.0.30 pydantic==2.7.1 pydantic-settings==2.2.1 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 python-multipart==0.0.9 alembic==1.13.1 python-dotenv==1.0.1 httpx==0.27.0 Pillow==10.3.0 qrcode==7.4.2 aiofiles==23.2.1 bcrypt==4.0.1 email-validator==2.1.1
if errorlevel 1 (
    echo ERROR: Package installation failed. Check your internet connection.
    pause
    exit /b 1
)
echo       Done.

echo [4/5] Seeding database with demo data...
python seed.py
echo       Done.

echo [5/5] Starting server...
echo.
echo   Backend running at: http://localhost:8000
echo   Swagger docs:       http://localhost:8000/docs
echo.
echo   Demo logins:
echo     student@campusbite.com  /  Student@123
echo     staff@campusbite.com    /  Staff@123
echo     admin@campusbite.com    /  Admin@123
echo.
echo   Keep this window open. Press Ctrl+C to stop.
echo ============================================

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
