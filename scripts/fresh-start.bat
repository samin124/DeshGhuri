@echo off
echo ====================================
echo DeshGhuri - Fresh Start
echo ====================================
echo.
echo This script will:
echo 1. Kill all processes on ports 3000-3002, 5173
echo 2. Wait 10 seconds for ports to release
echo 3. Start development servers
echo.
echo Press Ctrl+C to cancel, or
pause
echo.

echo [Step 1/3] Killing processes on development ports...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') DO @taskkill /F /PID %%P >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') DO @taskkill /F /PID %%P >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3002" ^| findstr "LISTENING"') DO @taskkill /F /PID %%P >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') DO @taskkill /F /PID %%P >nul 2>&1
echo Done!
echo.

echo [Step 2/3] Waiting 10 seconds for ports to release...
timeout /t 10 /nobreak >nul
echo Done!
echo.

echo [Step 3/3] Starting development servers...
echo.
echo Backend will start on: http://localhost:3000
echo Frontend will start on: http://localhost:3001
echo.
echo Press Ctrl+C to stop servers when done.
echo.
cd /d E:\Learn-Typescript\DeshGhuri
bun run dev
