@echo off
title TaskMaster Pro - Backend Server
echo ========================================================
echo        Starting TaskMaster Pro Backend (FastAPI)
echo ========================================================
cd /d "%~dp0to_do"
call .\venv\Scripts\activate
echo Backend running at http://127.0.0.1:8000
echo Interactive API Documentation at http://127.0.0.1:8000/docs
echo.
python main.py
pause
