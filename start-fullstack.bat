@echo off
echo 🚀 Starting CivicSense Fullstack Application...

REM Kill existing node processes
taskkill /f /im node.exe >nul 2>&1

REM Wait a moment
timeout /t 2 >nul

echo 📦 Installing dependencies if needed...
cd /d C:\Users\farma\OneDrive\Desktop\civicSense
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install --legacy-peer-deps
)

cd /d C:\Users\farma\OneDrive\Desktop\civicSense\scripts
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

echo 🎯 Starting Backend Server...
start "CivicSense Backend" cmd /k "cd /d C:\Users\farma\OneDrive\Desktop\civicSense\scripts && node backend-server.js"

REM Wait for backend to start
timeout /t 3 >nul

echo 🎨 Starting Frontend Server...
start "CivicSense Frontend" cmd /k "cd /d C:\Users\farma\OneDrive\Desktop\civicSense && npm run dev"

echo ✅ Both servers are starting!
echo 📱 Frontend will be available at: http://localhost:3000
echo 🔧 Backend will be available at: http://localhost:3001
echo.
echo 🔍 Backend APIs:
echo   - Health Check: http://localhost:3001/health
echo   - Reports API: http://localhost:3001/reports
echo   - Admin Login: POST http://localhost:3001/auth/login
echo   - Guest Login: POST http://localhost:3001/auth/guest
echo   - AI Services: http://localhost:3001/ai/status
echo.
echo Press any key to exit...
pause >nul