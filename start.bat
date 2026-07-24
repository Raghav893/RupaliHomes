@echo off
:: Rupali Homes - Start Frontend & Backend together (Windows)

title Rupali Homes

echo.
echo  ========================================
echo   Rupali Homes - Starting...
echo  ========================================
echo.

:: Get the script directory
set "SCRIPT_DIR=%~dp0"

:: ─── Start Backend ──────────────────────────────────────
echo  [*] Starting Backend (Spring Boot) on port 8080...
cd /d "%SCRIPT_DIR%backend_new"
start "Rupali-Backend" /B cmd /c "mvnw.cmd spring-boot:run > %TEMP%\rupali_backend.log 2>&1"
echo      Backend is launching in the background...
echo.

:: Wait for backend to be ready
echo  [*] Waiting for backend to start (up to 60s)...
set READY=0
for /L %%i in (1,1,60) do (
    curl -s http://localhost:8080 >nul 2>&1
    if not errorlevel 1 (
        echo      [OK] Backend is ready!
        set READY=1
        goto :backend_ready
    )
    timeout /t 1 /nobreak >nul
)
echo      [!] Backend may still be starting...

:backend_ready
echo.

:: ─── Start Frontend ─────────────────────────────────────
echo  [*] Starting Frontend (Next.js) on port 3000...
cd /d "%SCRIPT_DIR%frontend"
start "Rupali-Frontend" /B cmd /c "npm run dev > %TEMP%\rupali_frontend.log 2>&1"
echo      Frontend is launching in the background...

timeout /t 3 /nobreak >nul

echo.
echo  ========================================
echo   Rupali Homes is running!
echo  ========================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8080
echo   Admin:     http://localhost:3000/admin
echo.
echo   Press Ctrl+C to stop, then close this window.
echo.

:: Keep the script alive
:loop
timeout /t 5 /nobreak >nul
goto loop
