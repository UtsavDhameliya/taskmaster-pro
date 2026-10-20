@echo off
title TaskMaster Pro - Full Stack Launcher
echo ========================================================
echo        Launching TaskMaster Pro Full Stack App
echo ========================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "TaskMaster Pro - Backend" cmd /k "cd /d ""%~dp0to_do"" && .\venv\Scripts\python.exe main.py"

echo Starting Vite Frontend on http://localhost:5173 ...
start "TaskMaster Pro - Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ========================================================
echo  Both services launched in separate windows!
echo  Frontend UI:  http://localhost:5173
echo  Backend API:  http://127.0.0.1:8000
echo  Swagger Docs: http://127.0.0.1:8000/docs
echo ========================================================
timeout /t 3 >nul
start http://localhost:5173
exit
