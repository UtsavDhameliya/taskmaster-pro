@echo off
title TaskMaster Pro - Frontend (Vite)
echo ========================================================
echo        Starting TaskMaster Pro Frontend (React + Vite)
echo ========================================================
cd /d "%~dp0frontend"
echo Frontend starting at http://localhost:5173
echo.
npm run dev
pause
