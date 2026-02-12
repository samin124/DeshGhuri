@echo off
REM pkill.bat - Quick port killer for Windows
REM Double-click to kill development server ports

echo ============================================
echo   DeshGhuri Port Killer
echo ============================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0pkill.ps1"

echo.
echo Press any key to exit...
pause >nul
