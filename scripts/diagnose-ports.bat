@echo off
echo ====================================
echo Port Diagnostic Tool
echo ====================================
echo.

echo Checking ports 3000, 3001, 3002, 5173...
echo.

echo === Port 3000 (Backend) ===
netstat -ano | findstr ":3000" | findstr "LISTENING"
if %ERRORLEVEL% NEQ 0 (
    echo Port 3000: AVAILABLE
) else (
    echo Port 3000: IN USE
)
echo.

echo === Port 3001 (Frontend) ===
netstat -ano | findstr ":3001" | findstr "LISTENING"
if %ERRORLEVEL% NEQ 0 (
    echo Port 3001: AVAILABLE
) else (
    echo Port 3001: IN USE
)
echo.

echo === Port 3002 (Fallback) ===
netstat -ano | findstr ":3002" | findstr "LISTENING"
if %ERRORLEVEL% NEQ 0 (
    echo Port 3002: AVAILABLE
) else (
    echo Port 3002: IN USE
)
echo.

echo === Port 5173 (Vite) ===
netstat -ano | findstr ":5173" | findstr "LISTENING"
if %ERRORLEVEL% NEQ 0 (
    echo Port 5173: AVAILABLE
) else (
    echo Port 5173: IN USE
)
echo.

echo === Bun Processes ===
tasklist /FI "IMAGENAME eq bun.exe" 2>nul | findstr "bun.exe"
if %ERRORLEVEL% NEQ 0 (
    echo No Bun processes running
)
echo.

echo === Node Processes ===
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr "node.exe"
if %ERRORLEVEL% NEQ 0 (
    echo No Node processes running
)
echo.

echo ====================================
echo Diagnostic Complete
echo ====================================
echo.
echo If ports show as IN USE but no processes listed,
echo try waiting 2-5 minutes or restart your computer.
echo.
pause
