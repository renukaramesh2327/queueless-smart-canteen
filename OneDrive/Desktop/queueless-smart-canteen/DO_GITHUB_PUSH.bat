@echo off
title Push to GitHub
cd /d "%~dp0"
echo Working in: %CD%
echo.

echo Removing any wrong remote...
git remote remove origin 2>nul

echo Adding correct remote...
git remote add origin https://github.com/renukaramesh2327/queueless-smart-canteen.git

echo Staging project files...
git add .

echo Committing...
git commit -m "CampusBite smart canteen app - initial commit"

echo Setting branch to main...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo.
if errorlevel 1 (
    echo PUSH FAILED - A browser window may have opened asking you to sign in to GitHub.
    echo Sign in there, then run this file again.
) else (
    echo.
    echo ============================================
    echo  SUCCESS! Code is live on GitHub at:
    echo  https://github.com/renukaramesh2327/queueless-smart-canteen
    echo ============================================
)
pause
