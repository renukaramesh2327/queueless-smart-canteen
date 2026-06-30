@echo off
title Push CampusBite to GitHub
cd /d "%~dp0"

echo.
echo ========================================
echo   CampusBite - Push to GitHub
echo ========================================
echo.
echo Current folder: %CD%
echo.

:: Check if git is already initialized
if exist ".git" (
    echo Git already initialized. Skipping init.
) else (
    echo Initializing git...
    git init
    git branch -M main
)

echo.
echo Adding project files...
git add .

echo.
echo Committing...
git commit -m "CampusBite smart canteen app"

echo.
echo ============================================================
echo NEXT: Enter YOUR GitHub username below when asked
echo ============================================================
echo.
set /p GITHUB_USER="Enter your GitHub username: "

echo.
echo Setting remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/queueless-smart-canteen.git

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
if errorlevel 1 (
    echo ERROR: Push failed. Make sure you created the repo on GitHub first!
    echo Go to github.com, click New, name it: queueless-smart-canteen
) else (
    echo SUCCESS! Your code is now on GitHub at:
    echo https://github.com/%GITHUB_USER%/queueless-smart-canteen
)
echo.
pause
