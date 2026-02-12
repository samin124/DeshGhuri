@echo off
echo Killing development ports...

FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') DO @taskkill /F /PID %%P >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') DO @taskkill /F /PID %%P >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3002" ^| findstr "LISTENING"') DO @taskkill /F /PID %%P >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') DO @taskkill /F /PID %%P >nul 2>&1

echo Done! All development ports cleared.
