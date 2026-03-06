@echo off
echo ========================================
echo   OnWay Deployment Script (Windows)
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed. Please install git first.
    pause
    exit /b 1
)

echo [INFO] Pre-deployment Checklist
echo ----------------------------------------
echo.

REM Check for uncommitted changes
git status --short > temp_status.txt
set /p status=<temp_status.txt
del temp_status.txt

if not "%status%"=="" (
    echo [WARNING] You have uncommitted changes
    git status --short
    echo.
    set /p commit_choice="Do you want to commit these changes? (y/n): "
    if /i "%commit_choice%"=="y" (
        set /p commit_msg="Enter commit message: "
        git add .
        git commit -m "%commit_msg%"
        echo [SUCCESS] Changes committed
    ) else (
        echo [WARNING] Proceeding without committing changes
    )
) else (
    echo [SUCCESS] No uncommitted changes
)

echo.
echo [INFO] Checking Backend Files
echo ----------------------------------------

if exist "backend\server.js" (
    echo [SUCCESS] backend/server.js found
) else (
    echo [ERROR] backend/server.js not found
    pause
    exit /b 1
)

if exist "backend\vercel.json" (
    echo [SUCCESS] backend/vercel.json found
) else (
    echo [ERROR] backend/vercel.json not found
    pause
    exit /b 1
)

if exist "backend\package.json" (
    echo [SUCCESS] backend/package.json found
) else (
    echo [ERROR] backend/package.json not found
    pause
    exit /b 1
)

echo.
echo [INFO] Checking Frontend Files
echo ----------------------------------------

if exist "on-way\package.json" (
    echo [SUCCESS] on-way/package.json found
) else (
    echo [ERROR] on-way/package.json not found
    pause
    exit /b 1
)

if exist "on-way\.env.local" (
    echo [SUCCESS] on-way/.env.local found
) else (
    echo [WARNING] on-way/.env.local not found (optional)
)

echo.
echo [INFO] Pushing to GitHub
echo ----------------------------------------

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
echo [SUCCESS] Current branch: %current_branch%

REM Push to GitHub
git push origin %current_branch%
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Code pushed to GitHub successfully
) else (
    echo [ERROR] Failed to push to GitHub
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Go to Vercel Dashboard: https://vercel.com/dashboard
echo 2. Check deployment status for both projects
echo 3. View function logs if there are any errors
echo 4. Test the API endpoints:
echo    - Health: https://on-way-server.vercel.app/api/health
echo    - Test: https://on-way-server.vercel.app/api/test
echo.
echo 5. Test registration from your frontend
echo.
echo [SUCCESS] Deployment script completed!
echo.
pause
