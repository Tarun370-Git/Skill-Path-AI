@echo off
title SkillPath AI Launcher
echo ====================================================
echo             SkillPath AI Project Launcher            
echo ====================================================
echo.

:: Check if running in project root
if not exist "backend" (
    echo Error: Could not find backend folder. Make sure you run this in the project root folder.
    pause
    exit /b
)

:: 1. Start FastAPI Backend in a new CMD window
echo [INFO] Launching FastAPI Backend on http://localhost:8000...
start "SkillPath AI - Backend Server" cmd /k "cd backend && venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

:: Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak > nul

:: 2. Start Vite React Frontend in a new CMD window
echo [INFO] Launching Vite React Frontend on http://localhost:5173...
start "SkillPath AI - Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================================
echo  Servers initialized!
echo  - Backend API Swagger Docs: http://localhost:8000/docs
echo  - Frontend Web App: http://localhost:5173
echo ====================================================
echo.
echo  Keep this launcher window open or press any key to exit this launcher 
echo  (the server windows will remain open).
echo.
pause
